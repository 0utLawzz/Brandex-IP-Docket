import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
// AI Studio dev server strictly runs on port 3000
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI if key is present
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Heuristic rule-based fallback parser for offline/no-key mode
function ruleBasedWhatsAppParser(text: string, referenceDateStr?: string) {
  const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // Clean WhatsApp metadata like "[10:24 AM, 5/11/2026] Boss: " or "11/05/2026, 14:32 - Boss: "
  const cleanedParagraphs: string[] = [];
  let currentBlock = '';

  for (const line of lines) {
    const isHeader = line.match(/^(\[?\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}[,\s]+(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]?\s*[-–:]?\s*)(.*?):/);
    if (isHeader) {
      if (currentBlock.trim()) {
        cleanedParagraphs.push(currentBlock.trim());
      }
      currentBlock = line.replace(/^.*?:\s*/, '');
    } else {
      currentBlock += ' ' + line;
    }
  }
  if (currentBlock.trim()) {
    cleanedParagraphs.push(currentBlock.trim());
  }

  // If no chat headers found, split by double newlines or punctuation
  const candidateTexts = cleanedParagraphs.length > 0 ? cleanedParagraphs : [text];
  const results = [];

  for (const block of candidateTexts) {
    if (block.length < 5) continue;
    
    // Detect IP Category
    let ipType = 'Trademark';
    if (/patent|provisional|complete spec|prior art|invention/i.test(block)) {
      ipType = 'Patent';
    } else if (/copyright|literary|artistic work|software copyright/i.test(block)) {
      ipType = 'Copyright';
    } else if (/industrial design|design patent|embroidery design|packaging design/i.test(block)) {
      ipType = 'Industrial Design';
    }

    // Detect Application Number
    const appMatch = block.match(/(?:app(?:lication)?\s*(?:no\.?|#)?|tm\s*no\.?|file\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-]+)/i) ||
                     block.match(/\b(\d{5,7})\b/) ||
                     block.match(/(?:P-\d{4}\/\d{3,5})/i);
    const appNumber = appMatch ? appMatch[1] : (ipType === 'Trademark' ? 'TM-New' : 'Pending');

    // Detect Title / Mark
    let title = 'Untitled IP Matter';
    const markMatch = block.match(/['"“](.*?)['"”]/) ||
                      block.match(/(?:trademark|mark|brand|named|title|in the name of)\s*[:\-]?\s*([A-Z0-9\s]{3,25})/i);
    if (markMatch) {
      title = markMatch[1].trim();
    } else {
      // Pick first 3-4 significant words
      const words = block.split(/\s+/).slice(0, 4).join(' ');
      title = words.replace(/^(please|ali|urgent|check|draft|file)\s+/i, '');
    }

    // Detect Client Name
    let client = 'Client - Brandex Law';
    const clientMatch = block.match(/(?:client|for\s+client|party|applicant)\s*[:\-]?\s*([A-Za-z0-9\s.,&]+?)(?=[,.;]|\s+(?:urgent|before|due|file|call|contact)|$)/i);
    if (clientMatch) {
      client = clientMatch[1].trim();
    }

    // Detect Task / Office Action
    let taskType = 'Application Filing';
    let stage = 'drafting';
    if (/tm-?11|reply to exam|examination report|examiner objection|section 14|section 28/i.test(block)) {
      taskType = 'TM-11 Reply to Examination Report';
      stage = 'office_action';
    } else if (/tm-?12|opposition|notice of opp/i.test(block)) {
      taskType = 'TM-12 Notice of Opposition';
      stage = 'hearing_opposition';
    } else if (/tm-?13|counter[- ]statement/i.test(block)) {
      taskType = 'TM-13 Counter Statement';
      stage = 'hearing_opposition';
    } else if (/hearing|registrar hearing|appearance|attend/i.test(block)) {
      taskType = 'Hearing Attendance before Registrar';
      stage = 'hearing_opposition';
    } else if (/tm-?16|renewal|annuity/i.test(block)) {
      taskType = 'TM-16 Trademark Renewal';
      stage = 'office_action';
    } else if (/search|clearance|availability/i.test(block)) {
      taskType = 'IP Search & Clearance Report';
      stage = 'new_instruction';
    } else if (/draft|tm-?1|spec|filing/i.test(block)) {
      taskType = 'TM-1 Application Preparation';
      stage = 'drafting';
    }

    // Detect Priority
    let priority = 'normal';
    if (/urgent|asap|critical|immediate|today|statutory deadline/i.test(block)) {
      priority = 'urgent';
    } else if (/priority|high|important|before monday/i.test(block)) {
      priority = 'high';
    }

    // Calculate Due Date
    let dueDate = new Date(refDate.getTime() + 7 * 86400000).toISOString().split('T')[0];
    const dateMatch = block.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})?/i) ||
                      block.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (dateMatch) {
      try {
        const parsed = new Date(dateMatch[0]);
        if (!isNaN(parsed.getTime())) {
          if (!dateMatch[3] && parsed.getFullYear() < 2020) {
            parsed.setFullYear(refDate.getFullYear());
          }
          dueDate = parsed.toISOString().split('T')[0];
        }
      } catch (e) {
        // keep default
      }
    } else if (/within\s+(\d+)\s+days/i.test(block)) {
      const days = parseInt(block.match(/within\s+(\d+)\s+days/i)![1], 10);
      dueDate = new Date(refDate.getTime() + days * 86400000).toISOString().split('T')[0];
    } else if (/tomorrow/i.test(block)) {
      dueDate = new Date(refDate.getTime() + 86400000).toISOString().split('T')[0];
    }

    // Detect Class
    let niceClass = 'Class 35';
    const classMatch = block.match(/class\s*[:\-]?\s*(\d{1,2})/i);
    if (classMatch) {
      niceClass = `Class ${classMatch[1]}`;
    }

    results.push({
      title: title || 'New IP Matter',
      client: client || 'Private Client',
      ipType,
      appNumber,
      taskType,
      stage,
      dueDate,
      priority,
      niceClass,
      jurisdiction: 'IPO Pakistan (Head Office Karachi / Lahore)',
      notes: block,
      rawExcerpt: block
    });
  }

  return results.length > 0 ? results : [{
    title: 'Extracted IP Filing',
    client: 'Brandex Law Client',
    ipType: 'Trademark',
    appNumber: 'TM-Draft',
    taskType: 'Application Preparation',
    stage: 'drafting',
    dueDate: new Date(refDate.getTime() + 5 * 86400000).toISOString().split('T')[0],
    priority: 'normal',
    niceClass: 'Class 35',
    jurisdiction: 'IPO Pakistan (Lahore)',
    notes: text,
    rawExcerpt: text
  }];
}

// Endpoint to parse WhatsApp messages using Gemini 3.8 Flash
app.post('/api/parse-whatsapp', async (req, res) => {
  const { text, contextDate } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const referenceDate = contextDate || new Date().toISOString().split('T')[0];

  // Try Gemini 3.8 Flash if API key is present
  if (ai) {
    try {
      const prompt = `You are an expert Intellectual Property (IP) paralegal and docketing coordinator at Brandex Law Association (brandex.pk), an esteemed Pakistan and international IP law firm.
Your job is to parse incoming WhatsApp messages, transcripts, voice-note notes, and task briefs sent by the firm's Managing Partner / Boss to docket filing deadlines, office actions, opposition notices, and tasks into the law firm's docketing system.

Current Reference Date: ${referenceDate}

Carefully analyze the following WhatsApp message/chat:
"""
${text}
"""

Extract all individual filings, matters, or assignments mentioned. For each matter, determine:
- title: Trademark name, Patent invention title, or Copyright/Design work name (clean, proper casing, without quotes)
- client: Client name, company, applicant or principal
- ipType: One of "Trademark", "Patent", "Copyright", "Industrial Design"
- appNumber: Official Application No. (e.g., "584920", "P-2024/9912"), or "New Filing" if not yet filed
- taskType: Specific statutory or legal task (e.g. "TM-11 Reply to Examiner Objections", "TM-1 Trademark Application", "TM-12 Notice of Opposition", "TM-13 Counter-Statement", "TM-16 Trademark Renewal", "Patent Form 1 & 2 Complete Specification", "Hearing Attendance before Registrar", "Prior Art & Availability Search")
- stage: One of:
  * "new_instruction": Initial instruction or search
  * "drafting": Preparation of forms, power of attorney, specifications
  * "office_action": Examination report, objection letter, official citation under Section 14/28
  * "hearing_opposition": Opposition proceedings, counter-statement, registrar hearing
  * "registered": Final certificate, renewal completed
- dueDate: Expected statutory due date in YYYY-MM-DD format. If relative (e.g., "due within 15 days", "before next Friday", "before 15th Nov"), compute the exact ISO date relative to ${referenceDate}.
- priority: "urgent" (due < 5 days or marked urgent/statutory), "high", or "normal"
- niceClass: International Nice Classification class (e.g., "Class 5", "Class 25", "Class 30") or "Class General"
- jurisdiction: Registry or office (e.g., "IPO Pakistan (Lahore)", "IPO Pakistan (Karachi)", "IPO Pakistan (Islamabad)", "WIPO Madrid", "USPTO")
- notes: Summary of boss's instructions, required documents, or client background
- rawExcerpt: The specific WhatsApp line or sentence this task was derived from.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              filings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    client: { type: Type.STRING },
                    ipType: { type: Type.STRING },
                    appNumber: { type: Type.STRING },
                    taskType: { type: Type.STRING },
                    stage: { type: Type.STRING },
                    dueDate: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    niceClass: { type: Type.STRING },
                    jurisdiction: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    rawExcerpt: { type: Type.STRING },
                  },
                  required: ['title', 'client', 'ipType', 'taskType', 'stage', 'dueDate', 'priority']
                }
              },
              summary: { type: Type.STRING, description: 'Brief executive summary of WhatsApp instructions received' }
            },
            required: ['filings']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{"filings":[]}');
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        summary: parsed.summary || 'Extracted from WhatsApp conversation',
        filings: parsed.filings || []
      });
    } catch (err: any) {
      console.warn('Gemini parsing error, falling back to rule-based engine:', err?.message || err);
      // Fallback to local heuristic parser
      const filings = ruleBasedWhatsAppParser(text, referenceDate);
      return res.json({
        success: true,
        source: 'rule-based-fallback',
        summary: 'Parsed using Brandex Law IP rule extractor',
        filings
      });
    }
  } else {
    // Local heuristic parser when no API key is provided
    const filings = ruleBasedWhatsAppParser(text, referenceDate);
    return res.json({
      success: true,
      source: 'rule-based-engine',
      summary: 'Parsed using Brandex Law local IP pattern extractor',
      filings
    });
  }
});

// Endpoint to simulate automated email reminder dispatch
app.post('/api/send-email-reminder', (req, res) => {
  const { recipient, subject, filingTitle, clientName, dueDate, taskType, statutoryRef } = req.body;
  
  const trackingId = 'BLA-NOTIF-' + Math.floor(100000 + Math.random() * 900000);
  const timestamp = new Date().toISOString();

  // In production, integration with SMTP/SES/Sendgrid or Google Workspace
  res.json({
    success: true,
    trackingId,
    timestamp,
    message: `Statutory reminder dispatched to ${recipient || 'Client & Docket Team'}`,
    preview: {
      from: 'Brandex Law Association Docketing Desk <docket@brandex.pk>',
      to: recipient,
      subject: subject || `Urgent Statutory Deadline: ${filingTitle} (${taskType})`,
      client: clientName,
      dueDate,
      statutoryRef: statutoryRef || 'Trade Marks Ordinance 2001 / Patent Ordinance 2000'
    }
  });
});

// Start server and mount Vite middleware
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const portNum = Number(PORT) || 3000;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`Brandex IP Docket server running on http://0.0.0.0:${portNum}`);
  });
}

startServer();
