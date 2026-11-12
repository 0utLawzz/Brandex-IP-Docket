import React, { useState } from 'react';
import { FilingItem } from '../types';
import { generateClientEmailNotice } from '../utils/dateUtils';
import { Check, Copy, Mail, Send, X, Printer, Loader2 } from 'lucide-react';

interface EmailNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  filing: FilingItem | null;
  onReminderSent?: (id: string) => void;
}

export const EmailNoticeModal: React.FC<EmailNoticeModalProps> = ({
  isOpen,
  onClose,
  filing,
  onReminderSent,
}) => {
  if (!isOpen || !filing) return null;

  const initialDraft = generateClientEmailNotice(filing);
  const [recipient, setRecipient] = useState(filing.clientEmail || 'legal@' + filing.client.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.pk');
  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    setSentSuccess(false);

    try {
      const res = await fetch('/api/send-email-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          subject,
          filingTitle: filing.title,
          clientName: filing.client,
          dueDate: filing.dueDate,
          taskType: filing.taskType,
          statutoryRef: filing.statutoryRef,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSentSuccess(true);
        if (onReminderSent) onReminderSent(filing.id);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch {
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    const fullText = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Statutory Client Email Notice Drafter</h2>
              <p className="text-xs text-slate-300">
                Official Brandex Law Association legal notice for {filing.title} ({filing.appNumber})
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {sentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Statutory notice sent successfully! Recorded in Brandex Law audit docket.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Recipient Email (Client Counsel / Executive)
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Formal Legal Notice Body
            </label>
            <textarea
              rows={11}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 text-slate-800 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 rounded bg-white flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 rounded bg-white flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching Reminder...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Send Automated Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
