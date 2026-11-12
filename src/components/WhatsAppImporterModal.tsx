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
} from 'lucide-react';

interface WhatsAppImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFilings: (newFilings: FilingItem[]) => void;
}

const SAMPLE_CHATS = [
  {
    label: 'Single Urgent TM-11 Reply',
    text: `[10:15 AM, 11/05/2026] Boss Brandex: Ali, urgent matter! IPO Karachi issued examination report for "SWIFTEX LOGISTICS" App No 634819 in Class 39. Client is Swiftex Freight Services Ltd. Examiner raised objection under Section 14 citing prior mark SWIFT-CARGO. Statutory reply TM-11 is due before 12th November. Draft detailed submissions on trade channel distinction and attach client invoice history.`,
  },
  {
    label: 'Multi-Task Boss Instruction (3 Filings)',
    text: `[09:20 AM, 11/06/2026] Boss Brandex: Good morning team, work for today:
1) Prepare TM-1 application for "ZENITH BEVERAGES" in Class 32 for client Pak Drinks Corporation. Logo is approved, file before 17th Nov.
2) Patent filing: Client AgroBio Pak needs complete specification drafted under Patent Form 2 for "SOLAR INSECT TRAP" App P-2025/1442. 12 month deadline ends on 28th Nov.
3) Attend hearing for opposition of "ROYAL CEMENT" App 549102 before Registrar IPO Lahore on 15th Nov. Opponent is Bestway. Urgent!`,
  },
  {
    label: 'Renewal & Design Action',
    text: `[02:40 PM, 11/06/2026] Boss Brandex: Please docket renewal TM-16 for "FALCON BATTERIES" (App 490122, Class 9) for Falcon Power Ltd. Expiry is in 20 days (26th Nov). Also follow up with Al-Karam on the industrial design drawing queries.`,
  },
];

export const WhatsAppImporterModal: React.FC<WhatsAppImporterModalProps> = ({
  isOpen,
  onClose,
  onImportFilings,
}) => {
  const [chatText, setChatText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedFilings, setParsedFilings] = useState<FilingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleUpdateParsedField = (index: number, field: keyof FilingItem, value: any) => {
    setParsedFilings((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveParsedItem = (index: number) => {
    setParsedFilings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmImport = () => {
    if (parsedFilings.length === 0) return;
    // Map with guaranteed fresh IDs before adding to docket
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
      <div className="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">WhatsApp Chat & Voice-Note Importer</h2>
              <p className="text-xs text-slate-300">
                Transform messy boss messages into structured IP docket filings with statutory deadlines
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Sample quick paste shortcuts for non-coders */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Quick Test: Choose a realistic WhatsApp instruction sent by the boss:
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CHATS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setChatText(sample.text)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Paste WhatsApp Message Transcript or Voice Note Text
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
              rows={5}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Example: Ali, urgent! File reply to examiner report for trademark 'VERTEX GLOW' app no 584920 before 15th Nov, client is Alpha Foods Ltd..."
              className="w-full text-sm font-mono p-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-800"
            />
          </div>

          {/* Extract Button */}
          <div className="flex items-center justify-between">
            <button
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
                  <span>Parse WhatsApp Message & Generate Docket</span>
                </>
              )}
            </button>

            {chatText && (
              <button
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
                  Review and adjust any fields before saving
                </span>
              </div>

              <div className="space-y-3">
                {parsedFilings.map((filing, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded flex items-center justify-center text-[11px] font-bold">
                          {index + 1}
                        </span>
                        <span>{filing.ipType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500">{filing.appNumber}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveParsedItem(index)}
                        className="text-xs text-rose-600 hover:text-rose-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Mark / Invention Title
                        </label>
                        <input
                          type="text"
                          value={filing.title}
                          onChange={(e) => handleUpdateParsedField(index, 'title', e.target.value)}
                          className="w-full text-xs font-bold p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Client / Applicant
                        </label>
                        <input
                          type="text"
                          value={filing.client}
                          onChange={(e) => handleUpdateParsedField(index, 'client', e.target.value)}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Statutory Due Date
                        </label>
                        <input
                          type="date"
                          value={filing.dueDate}
                          onChange={(e) => handleUpdateParsedField(index, 'dueDate', e.target.value)}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Task / Office Action
                        </label>
                        <input
                          type="text"
                          value={filing.taskType}
                          onChange={(e) => handleUpdateParsedField(index, 'taskType', e.target.value)}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Workflow Stage
                        </label>
                        <select
                          value={filing.stage}
                          onChange={(e) => handleUpdateParsedField(index, 'stage', e.target.value as FilingStage)}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="new_instruction">New Instruction</option>
                          <option value="drafting">Drafting & Prep</option>
                          <option value="office_action">Office Action / Objection</option>
                          <option value="hearing_opposition">Hearing & Opposition</option>
                          <option value="registered">Completed / Registered</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Priority Urgency
                        </label>
                        <select
                          value={filing.priority}
                          onChange={(e) => handleUpdateParsedField(index, 'priority', e.target.value as PriorityLevel)}
                          className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="urgent">Urgent (&lt;5 days)</option>
                          <option value="high">High Priority</option>
                          <option value="normal">Normal</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Boss Notes & Raw Excerpt
                      </label>
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                        "{filing.rawWhatsAppText || filing.notes}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedFilings.length > 0 ? (
              <span>Ready to add {parsedFilings.length} filings to Brandex Law docket</span>
            ) : (
              <span>Paste chat text above and click Parse</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={parsedFilings.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded shadow transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Docket All ({parsedFilings.length}) to Pipeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
