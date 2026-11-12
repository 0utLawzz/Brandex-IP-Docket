import React, { useState } from 'react';
import { FilingItem } from '../types';
import { generateWhatsAppBossReport } from '../utils/dateUtils';
import { Check, Copy, ExternalLink, MessageSquare, Send, X } from 'lucide-react';

interface BossReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filings: FilingItem[];
}

export const BossReportModal: React.FC<BossReportModalProps> = ({ isOpen, onClose, filings }) => {
  const initialText = generateWhatsAppBossReport(filings);
  const [reportText, setReportText] = useState(initialText);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(reportText);
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Boss WhatsApp Daily Docket Report</h2>
              <p className="text-xs text-slate-300">
                1-click status summary to keep your Managing Partner updated on all filings
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded">
            <strong>Pro Tip:</strong> This formatted text includes WhatsApp bold markdown (*text*) and lists all completed filings today, urgent office action deadlines, and upcoming IPO hearings.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              WhatsApp Message Preview (Editable)
            </label>
            <textarea
              rows={12}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 text-slate-800 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Open in WhatsApp Web</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
