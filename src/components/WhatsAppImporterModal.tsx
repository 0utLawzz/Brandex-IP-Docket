import React, { useState } from 'react';
import { FilingItem, FilingStage, IPType, PriorityLevel } from '../types';
import { CURRENT_DATE_STR } from '../utils/dateUtils';
import {
  AlertCircle,
  Check,
  FileText,
  Loader2,
  MessageSquareCode,
  Sparkles,
  Upload,
  X,
  Calendar,
  Layers,
  Building,
  Plus,
  MousePointerClick,
  Edit3,
  CheckCircle,
} from 'lucide-react';

interface WhatsAppImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFilings: (newFilings: FilingItem[]) => void;
}

const SAMPLE_BOSS_MESSAGES = [
  {
    id: 'msg-1',
    author: 'Boss Brandex (Advocate Supreme Court)',
    time: '10:15 AM, Today',
    snippet: 'Urgent TM-11 Reply for SWIFTEX LOGISTICS',
    fullText: `[10:15 AM] Boss: Ali, urgent matter! IPO Karachi issued examination report for "SWIFTEX LOGISTICS" App No 634819 in Class 39. Client is Swiftex Freight Services Ltd. Examiner raised objection under Section 14 citing prior mark SWIFT-CARGO. Statutory reply TM-11 is due before 12th November. Draft detailed submissions on trade channel distinction and attach client invoice history.`,
    preset: {
      title: 'SWIFTEX LOGISTICS',
      client: 'Swiftex Freight Services Ltd',
      ipType: 'Trademark' as IPType,
      appNumber: 'TM-634819',
      niceClass: 'Class 39',
      jurisdiction: 'IPO Pakistan (Karachi Registry)',
      taskType: 'TM-11 Reply to Examiner Report',
      stage: 'office_action' as FilingStage,
      dueDate: '2026-11-12',
      priority: 'urgent' as PriorityLevel,
    },
  },
  {
    id: 'msg-2',
    author: 'Boss Brandex',
    time: '09:20 AM, Today',
    snippet: 'New Trademark Application for ZENITH BEVERAGES',
    fullText: `[09:20 AM] Boss: Prepare TM-1 application for "ZENITH BEVERAGES" in Class 32 for client Pak Drinks Corporation. Logo is approved, file before 17th Nov.`,
    preset: {
      title: 'ZENITH BEVERAGES',
      client: 'Pak Drinks Corporation',
      ipType: 'Trademark' as IPType,
      appNumber: 'TM-Pending',
      niceClass: 'Class 32',
      jurisdiction: 'IPO Pakistan (Lahore Registry)',
      taskType: 'TM-1 Application Preparation & Filing',
      stage: 'drafting' as FilingStage,
      dueDate: '2026-11-17',
      priority: 'high' as PriorityLevel,
    },
  },
  {
    id: 'msg-3',
    author: 'Boss Brandex',
    time: 'Yesterday',
    snippet: 'Patent Complete Spec for SOLAR INSECT TRAP',
    fullText: `[11:00 AM] Boss: Patent filing: Client AgroBio Pak needs complete specification drafted under Patent Form 2 for "SOLAR INSECT TRAP" App P-2025/1442. 12 month deadline ends on 28th Nov.`,
    preset: {
      title: 'SOLAR INSECT TRAP',
      client: 'AgroBio Pak Ltd',
      ipType: 'Patent' as IPType,
      appNumber: 'P-2025/1442',
      niceClass: 'IPC A01M 1/04',
      jurisdiction: 'Patent Office of Pakistan (Karachi)',
      taskType: 'Patent Complete Specification (Form 2)',
      stage: 'drafting' as FilingStage,
      dueDate: '2026-11-28',
      priority: 'normal' as PriorityLevel,
    },
  },
  {
    id: 'msg-4',
    author: 'Boss Brandex',
    time: '2:40 PM',
    snippet: 'Trademark Renewal for FALCON BATTERIES',
    fullText: `[02:40 PM] Boss: Please docket renewal TM-16 for "FALCON BATTERIES" (App 490122, Class 9) for Falcon Power Ltd. Expiry is in 20 days (26th Nov).`,
    preset: {
      title: 'FALCON BATTERIES',
      client: 'Falcon Power Ltd',
      ipType: 'Trademark' as IPType,
      appNumber: 'TM-490122',
      niceClass: 'Class 9',
      jurisdiction: 'IPO Pakistan (Islamabad Desk)',
      taskType: 'TM-16 Trademark Renewal (10-Year)',
      stage: 'new_instruction' as FilingStage,
      dueDate: '2026-11-26',
      priority: 'normal' as PriorityLevel,
    },
  },
];

// Helper to quickly parse any arbitrary text line into field candidates
const autoExtractFieldsFromText = (text: string) => {
  let title = 'Untitled IP Matter';
  let client = 'Brandex Law Client';
  let appNumber = 'TM-Pending';
  let niceClass = 'Class 35';
  let ipType: IPType = 'Trademark';
  let taskType = 'Filing Preparation';
  let stage: FilingStage = 'new_instruction';
  let dueDate = '2026-11-15';
  let priority: PriorityLevel = 'normal';
  let jurisdiction = 'IPO Pakistan (Lahore Registry)';

  const quoteMatch = text.match(/["']([^"']+)["']/);
  if (quoteMatch) {
    title = quoteMatch[1];
  }

  const appMatch = text.match(/(?:app(?:lication)?\.?\s*(?:no\.?|#)?|P-|TM-|ID-|CR-)\s*([A-Za-z0-9\/-]+)/i);
  if (appMatch) {
    appNumber = appMatch[1].toUpperCase().startsWith('TM') || appMatch[1].toUpperCase().startsWith('P') ? appMatch[1].toUpperCase() : `TM-${appMatch[1]}`;
  }

  const classMatch = text.match(/class\s*([0-9]{1,2}|[A-Za-z0-9\s-]+)/i);
  if (classMatch) {
    niceClass = `Class ${classMatch[1].trim()}`;
  }

  const clientMatch = text.match(/(?:client|for)\s+([A-Za-z0-9\s&.,]+?)(?:\.|\s+needs|\s+has|\s+is|\s+in|\s+due|\s+before|\s+appointed)/i);
  if (clientMatch) {
    client = clientMatch[1].trim();
  }

  if (/patent/i.test(text)) {
    ipType = 'Patent';
    jurisdiction = 'Patent Office of Pakistan (Karachi)';
  } else if (/design/i.test(text)) {
    ipType = 'Industrial Design';
    jurisdiction = 'IPO Pakistan (Designs Office Karachi)';
  } else if (/copyright/i.test(text)) {
    ipType = 'Copyright';
    jurisdiction = 'Copyright Office Pakistan (Karachi)';
  }

  if (/karachi/i.test(text)) jurisdiction = 'IPO Pakistan (Karachi Registry)';
  else if (/lahore/i.test(text)) jurisdiction = 'IPO Pakistan (Lahore Registry)';
  else if (/islamabad/i.test(text)) jurisdiction = 'IPO Pakistan (Islamabad Desk)';

  if (/tm-11|examiner|objection|refusal/i.test(text)) {
    taskType = 'TM-11 Reply to Examiner Report';
    stage = 'office_action';
    priority = 'urgent';
  } else if (/tm-12|tm-13|hearing|opposition/i.test(text)) {
    taskType = 'Hearing & Opposition Proceeding';
    stage = 'hearing_opposition';
    priority = 'high';
  } else if (/tm-16|renewal/i.test(text)) {
    taskType = 'TM-16 Trademark Renewal (10-Year)';
    stage = 'new_instruction';
  } else if (/tm-1|application/i.test(text)) {
    taskType = 'TM-1 Application Preparation & Filing';
    stage = 'drafting';
  }

  if (/urgent|asap|immediately|today/i.test(text)) {
    priority = 'urgent';
    dueDate = '2026-11-10';
  }

  return { title, client, appNumber, niceClass, ipType, taskType, stage, dueDate, priority, jurisdiction };
};

export const WhatsAppImporterModal: React.FC<WhatsAppImporterModalProps> = ({
  isOpen,
  onClose,
  onImportFilings,
}) => {
  // Tabs: 'manual_select' (MANUALLY ADD SELECTION TO ADD ANY MSG TO THE DOCKET) vs 'auto_batch'
  const [activeMode, setActiveMode] = useState<'manual_select' | 'auto_batch'>('manual_select');

  // Manual Selection & Direct Docket State
  const [selectedMsgText, setSelectedMsgText] = useState(SAMPLE_BOSS_MESSAGES[0].fullText);
  const [manualTitle, setManualTitle] = useState(SAMPLE_BOSS_MESSAGES[0].preset.title);
  const [manualClient, setManualClient] = useState(SAMPLE_BOSS_MESSAGES[0].preset.client);
  const [manualIpType, setManualIpType] = useState<IPType>(SAMPLE_BOSS_MESSAGES[0].preset.ipType);
  const [manualAppNumber, setManualAppNumber] = useState(SAMPLE_BOSS_MESSAGES[0].preset.appNumber);
  const [manualNiceClass, setManualNiceClass] = useState(SAMPLE_BOSS_MESSAGES[0].preset.niceClass);
  const [manualJurisdiction, setManualJurisdiction] = useState(SAMPLE_BOSS_MESSAGES[0].preset.jurisdiction);
  const [manualTaskType, setManualTaskType] = useState(SAMPLE_BOSS_MESSAGES[0].preset.taskType);
  const [manualStage, setManualStage] = useState<FilingStage>(SAMPLE_BOSS_MESSAGES[0].preset.stage);
  const [manualDueDate, setManualDueDate] = useState(SAMPLE_BOSS_MESSAGES[0].preset.dueDate);
  const [manualPriority, setManualPriority] = useState<PriorityLevel>(SAMPLE_BOSS_MESSAGES[0].preset.priority);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);

  // Batch Auto-Parse State
  const [chatText, setChatText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedFilings, setParsedFilings] = useState<FilingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle user selecting one of the boss message items
  const handleSelectPreloadedMessage = (msg: typeof SAMPLE_BOSS_MESSAGES[0]) => {
    setSelectedMsgText(msg.fullText);
    setManualTitle(msg.preset.title);
    setManualClient(msg.preset.client);
    setManualIpType(msg.preset.ipType);
    setManualAppNumber(msg.preset.appNumber);
    setManualNiceClass(msg.preset.niceClass);
    setManualJurisdiction(msg.preset.jurisdiction);
    setManualTaskType(msg.preset.taskType);
    setManualStage(msg.preset.stage);
    setManualDueDate(msg.preset.dueDate);
    setManualPriority(msg.preset.priority);
    setManualSuccessMsg(null);
  };

  // Handle user typing/pasting custom message in manual selection box
  const handleCustomMessageChange = (text: string) => {
    setSelectedMsgText(text);
    if (text.trim().length > 10) {
      const extracted = autoExtractFieldsFromText(text);
      setManualTitle(extracted.title);
      setManualClient(extracted.client);
      setManualAppNumber(extracted.appNumber);
      setManualNiceClass(extracted.niceClass);
      setManualIpType(extracted.ipType);
      setManualTaskType(extracted.taskType);
      setManualStage(extracted.stage);
      setManualDueDate(extracted.dueDate);
      setManualPriority(extracted.priority);
      setManualJurisdiction(extracted.jurisdiction);
    }
  };

  // Handle "MANUALLY ADD SELECTION TO ADD ANY MSG TO THE DOCKET"
  const handleAddManualSelectionToDocket = () => {
    if (!manualTitle.trim()) {
      alert('Please enter a mark or title for this filing.');
      return;
    }

    const uniqueId = `bla-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newFiling: FilingItem = {
      id: uniqueId,
      title: manualTitle.trim(),
      client: manualClient.trim() || 'Brandex Law Client',
      ipType: manualIpType,
      appNumber: manualAppNumber.trim() || 'TM-Pending',
      niceClass: manualNiceClass.trim() || 'Class 35',
      jurisdiction: manualJurisdiction.trim() || 'IPO Pakistan (Lahore Registry)',
      taskType: manualTaskType.trim() || 'Filing Action',
      stage: manualStage,
      dueDate: manualDueDate || '2026-11-20',
      priority: manualPriority,
      completed: manualStage === 'registered',
      completedAt: manualStage === 'registered' ? CURRENT_DATE_STR : undefined,
      notes: `Docketed from WhatsApp message: ${selectedMsgText.slice(0, 150)}...`,
      statutoryRef: manualIpType === 'Trademark' ? 'Trade Marks Ordinance 2001' : 'Intellectual Property Law',
      assignedLawyer: 'Ali Raza, Advocate High Court',
      source: 'whatsapp',
      rawWhatsAppText: selectedMsgText,
      remindersSent: 0,
      createdAt: CURRENT_DATE_STR,
      subtasks: [
        { id: `${uniqueId}-st-1`, title: 'Verify official IPO Pakistan record & fee voucher', completed: false },
        { id: `${uniqueId}-st-2`, title: 'Prepare draft petition / reply for partner signoff', completed: false },
        { id: `${uniqueId}-st-3`, title: 'File with Registrar & dispatch copy to client', completed: false },
      ],
    };

    onImportFilings([newFiling]);
    setManualSuccessMsg(`Successfully added "${newFiling.title}" directly to Brandex Law docket!`);
    setTimeout(() => {
      setManualSuccessMsg(null);
    }, 3500);
  };

  // Quick deadline adjustment buttons (+3d, +7d, +14d, +30d)
  const adjustDueDate = (daysToAdd: number) => {
    const base = new Date(CURRENT_DATE_STR);
    base.setDate(base.getDate() + daysToAdd);
    setManualDueDate(base.toISOString().split('T')[0]);
  };

  // Batch parsing handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setChatText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleParse = async () => {
    if (!chatText.trim()) {
      setError('Please paste WhatsApp messages or load a sample chat first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/parse-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: chatText,
          contextDate: CURRENT_DATE_STR,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse WhatsApp chat.');
      }

      const items: FilingItem[] = (data.filings || []).map((f: any, idx: number) => {
        const itemUniqueId = `bla-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`;
        return {
          id: itemUniqueId,
          title: f.title || 'Untitled IP Matter',
          client: f.client || 'Brandex Law Client',
          ipType: (['Trademark', 'Patent', 'Copyright', 'Industrial Design'].includes(f.ipType)
            ? f.ipType
            : 'Trademark') as IPType,
          appNumber: f.appNumber || 'TM-Pending',
          niceClass: f.niceClass || 'Class 35',
          jurisdiction: f.jurisdiction || 'IPO Pakistan (Lahore Registry)',
          taskType: f.taskType || 'Filing Preparation',
          stage: (['new_instruction', 'drafting', 'office_action', 'hearing_opposition', 'registered'].includes(
            f.stage
          )
            ? f.stage
            : 'new_instruction') as FilingStage,
          dueDate: f.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          priority: (['urgent', 'high', 'normal'].includes(f.priority) ? f.priority : 'normal') as PriorityLevel,
          completed: false,
          notes: f.notes || chatText.slice(0, 200),
          assignedLawyer: 'Ali Raza, Advocate High Court',
          source: 'whatsapp' as const,
          rawWhatsAppText: f.rawExcerpt || chatText,
          remindersSent: 0,
          createdAt: CURRENT_DATE_STR,
          subtasks: [
            { id: `${itemUniqueId}-st-1`, title: 'Verify official IPO Pakistan record & fee voucher', completed: false },
            { id: `${itemUniqueId}-st-2`, title: 'Prepare draft petition / reply for partner signoff', completed: false },
            { id: `${itemUniqueId}-st-3`, title: 'File with Registrar & dispatch copy to client', completed: false },
          ],
        };
      });

      setParsedFilings(items);
      setStatusMessage(
        `Successfully extracted ${items.length} actionable filing ${
          items.length === 1 ? 'matter' : 'matters'
        } using ${data.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash IP Intelligence' : 'Brandex Rule Engine'}.`
      );
    } catch (err: any) {
      setError(err?.message || 'Error processing WhatsApp text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBatchImport = () => {
    if (parsedFilings.length === 0) return;
    const toImport: FilingItem[] = parsedFilings.map((f, i) => {
      const freshId = `bla-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`;
      return {
        ...f,
        id: freshId,
        subtasks: (f.subtasks || []).map((st, si) => ({
          ...st,
          id: `${freshId}-st-${si}`,
        })),
      };
    });
    onImportFilings(toImport);
    setParsedFilings([]);
    setChatText('');
    setStatusMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">WhatsApp Message Importer & Docketing Tool</h2>
              <p className="text-xs text-slate-300">
                Brandex Law Association · Select any boss message to docket or batch parse chat transcripts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMode('manual_select')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors border-b-2 ${
              activeMode === 'manual_select'
                ? 'bg-white text-slate-900 border-amber-500 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50'
            }`}
          >
            <MousePointerClick className="w-4 h-4 text-amber-600" />
            <span>Select & Add Any Message to Docket (Manual Selector)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('auto_batch')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors border-b-2 ${
              activeMode === 'auto_batch'
                ? 'bg-white text-slate-900 border-amber-500 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Batch Auto-Parse Chat Transcripts</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: MANUALLY ADD SELECTION TO ADD ANY MSG TO THE DOCKET */}
          {activeMode === 'manual_select' && (
            <div className="space-y-5">
              {/* Top Banner explaining the feature */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 flex items-start gap-2.5">
                <MousePointerClick className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Manual Message Selector:</strong> Click any boss WhatsApp message snippet below, or paste ANY custom message in the box. Check the auto-filled docket fields, adjust whatever you want, and click <strong>"Add Message to Docket"</strong>!
                </div>
              </div>

              {/* Boss Message Picker (1-Click Selection) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  1. Select from Incoming Boss WhatsApp Messages (or paste your own below):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_BOSS_MESSAGES.map((msg) => {
                    const isSelected = selectedMsgText === msg.fullText;
                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => handleSelectPreloadedMessage(msg)}
                        className={`text-left p-3 rounded border transition-all text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 truncate">{msg.snippet}</span>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{msg.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                          "{msg.fullText}"
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-amber-800">
                          <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{isSelected ? 'Currently Selected' : 'Click to select this message'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Content Textarea (Can be freely pasted/edited) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    2. Selected Message Text (Paste ANY message from your WhatsApp chat):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Live extraction updates fields automatically
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={selectedMsgText}
                  onChange={(e) => handleCustomMessageChange(e.target.value)}
                  placeholder="Paste any boss WhatsApp message snippet here (e.g. 'Ali, file reply to examiner report for trademark ALPHA FOODS App 519201 before 15th Nov...')"
                  className="w-full text-xs font-mono p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-900"
                />
              </div>

              {/* Editable Particulars Form for Selected Message */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      3. Docket Particulars for This Message
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Verify statutory deadline & details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Mark / Invention Title *
                    </label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="e.g. VERTEX GLOW"
                      className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Client / Company Name *
                    </label>
                    <input
                      type="text"
                      value={manualClient}
                      onChange={(e) => setManualClient(e.target.value)}
                      placeholder="e.g. Alpha Foods Ltd"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      IP Category
                    </label>
                    <select
                      value={manualIpType}
                      onChange={(e) => setManualIpType(e.target.value as IPType)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="Trademark">Trademark</option>
                      <option value="Patent">Patent</option>
                      <option value="Industrial Design">Industrial Design</option>
                      <option value="Copyright">Copyright</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Application Reference #
                    </label>
                    <input
                      type="text"
                      value={manualAppNumber}
                      onChange={(e) => setManualAppNumber(e.target.value)}
                      placeholder="e.g. TM-634819"
                      className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Nice Class / Classification
                    </label>
                    <input
                      type="text"
                      value={manualNiceClass}
                      onChange={(e) => setManualNiceClass(e.target.value)}
                      placeholder="e.g. Class 30, Class 5, IPC A01"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Registry / Jurisdiction
                    </label>
                    <select
                      value={manualJurisdiction}
                      onChange={(e) => setManualJurisdiction(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="IPO Pakistan (Karachi Registry)">IPO Pakistan (Karachi Registry)</option>
                      <option value="IPO Pakistan (Lahore Registry)">IPO Pakistan (Lahore Registry)</option>
                      <option value="IPO Pakistan (Islamabad Desk)">IPO Pakistan (Islamabad Desk)</option>
                      <option value="Patent Office of Pakistan (Karachi)">Patent Office of Pakistan (Karachi)</option>
                      <option value="IPO Pakistan (Designs Office Karachi)">Designs Office (Karachi)</option>
                      <option value="Copyright Office Pakistan (Karachi)">Copyright Office (Karachi)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Statutory Action / Task
                    </label>
                    <input
                      type="text"
                      value={manualTaskType}
                      onChange={(e) => setManualTaskType(e.target.value)}
                      placeholder="e.g. TM-11 Reply to Examiner Report"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Workflow Pipeline Stage
                    </label>
                    <select
                      value={manualStage}
                      onChange={(e) => setManualStage(e.target.value as FilingStage)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="new_instruction">New Instruction</option>
                      <option value="drafting">Drafting & Review</option>
                      <option value="office_action">Office Action / Examiner Objection</option>
                      <option value="hearing_opposition">Hearing / Opposition</option>
                      <option value="registered">Registered / Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={manualPriority}
                      onChange={(e) => setManualPriority(e.target.value as PriorityLevel)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 font-semibold"
                    >
                      <option value="urgent">Urgent (&lt;5 Days)</option>
                      <option value="high">High Priority</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                </div>

                {/* Due Date & Quick Offset Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Official Statutory Due Date *
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 mr-1">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => adjustDueDate(3)}
                        className="px-1.5 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-mono rounded"
                      >
                        +3d Urgent
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustDueDate(7)}
                        className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-mono rounded"
                      >
                        +7d
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustDueDate(14)}
                        className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-mono rounded"
                      >
                        +14d
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustDueDate(30)}
                        className="px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-mono rounded"
                      >
                        +30d (TM-11)
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustDueDate(60)}
                        className="px-1.5 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-mono rounded"
                      >
                        +60d (Opp.)
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={manualDueDate}
                    onChange={(e) => setManualDueDate(e.target.value)}
                    className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Feedback toast if added */}
              {manualSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{manualSuccessMsg}</span>
                </div>
              )}

              {/* Action Buttons for Manual Mode */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Adds directly to your live Kanban pipeline and Docket sheet.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleAddManualSelectionToDocket}
                    className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded shadow transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Add Selected Message to Docket</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BATCH AUTO-PARSE CHAT TRANSCRIPTS */}
          {activeMode === 'auto_batch' && (
            <div className="space-y-5">
              {/* Text Input Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Paste WhatsApp Multi-Message Transcript or Voice Note Text
                  </label>
                  <label className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload .txt chat export</span>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={6}
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Paste multi-message WhatsApp conversation here..."
                  className="w-full text-xs font-mono p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-800"
                />
              </div>

              {/* Extract Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleParse}
                  disabled={isProcessing || !chatText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Extracting IP Filings & Calculating Deadlines...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Parse WhatsApp Transcript & Generate Docket</span>
                    </>
                  )}
                </button>

                {chatText && (
                  <button
                    type="button"
                    onClick={() => {
                      setChatText('');
                      setParsedFilings([]);
                      setStatusMessage(null);
                      setError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Clear text
                  </button>
                )}
              </div>

              {/* Status / Error feedback */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {statusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Parsed Results Preview Cards */}
              {parsedFilings.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Extracted Matters Ready for Docketing ({parsedFilings.length})
                    </h3>
                    <span className="text-xs text-slate-500">
                      Review extracted items before docketing
                    </span>
                  </div>

                  <div className="space-y-3">
                    {parsedFilings.map((filing, index) => (
                      <div
                        key={index}
                        className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{filing.title} ({filing.appNumber})</span>
                          <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Due {filing.dueDate}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          {filing.client} · {filing.taskType} · {filing.niceClass} · {filing.jurisdiction}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={handleConfirmBatchImport}
                      className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Docket All ({parsedFilings.length}) to Pipeline</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
