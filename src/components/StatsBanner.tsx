import React from 'react';
import { FilingItem } from '../types';
import { getDaysRemaining, CURRENT_DATE_STR, formatDatePretty } from '../utils/dateUtils';
import { AlertTriangle, CheckCircle2, Clock, FileText, Send, Sparkles } from 'lucide-react';

interface StatsBannerProps {
  filings: FilingItem[];
  onGenerateBossReport: () => void;
  onOpenWhatsAppModal: () => void;
  filterUrgentOnly: boolean;
  setFilterUrgentOnly: (val: boolean) => void;
  filterCompletedOnly: boolean;
  setFilterCompletedOnly: (val: boolean) => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  filings,
  onGenerateBossReport,
  onOpenWhatsAppModal,
  filterUrgentOnly,
  setFilterUrgentOnly,
  filterCompletedOnly,
  setFilterCompletedOnly,
}) => {
  const activeFilings = filings.filter((f) => !f.completed);
  const completedFilings = filings.filter((f) => f.completed);
  const urgentCount = activeFilings.filter((f) => getDaysRemaining(f.dueDate) <= 3).length;
  const overdueCount = activeFilings.filter((f) => getDaysRemaining(f.dueDate) < 0).length;
  const whatsappSourcedCount = filings.filter((f) => f.source === 'whatsapp').length;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title and date */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Brandex Docketing System</span>
              <span aria-hidden="true">·</span>
              <span>IPO Pakistan Reference Date: {formatDatePretty(CURRENT_DATE_STR)}</span>
              <span aria-hidden="true">·</span>
              <span>Trade Marks, Patents, Designs & Copyrights</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Intellectual Property Filing & Deadline Tracker
            </h1>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <button
              onClick={onGenerateBossReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors whitespace-nowrap"
              title="Generate a WhatsApp-ready daily filing report for your boss"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Boss WhatsApp Report</span>
            </button>
            <button
              onClick={onOpenWhatsAppModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors whitespace-nowrap"
              title="Paste boss WhatsApp message or drop chat export"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paste WhatsApp Task</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards in full width strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          {/* Active Filings */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Matters</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {activeFilings.length}
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          {/* Urgent Deadlines */}
          <button
            onClick={() => {
              setFilterUrgentOnly(!filterUrgentOnly);
              if (!filterUrgentOnly) setFilterCompletedOnly(false);
            }}
            className={`p-3 rounded border text-left transition-all ${
              filterUrgentOnly
                ? 'bg-rose-100 border-rose-300 ring-2 ring-rose-400'
                : 'bg-rose-50/70 border-rose-200 hover:bg-rose-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-rose-800 font-medium flex items-center gap-1">
                  <span>Urgent Deadlines</span>
                  {overdueCount > 0 && (
                    <span className="text-[10px] text-rose-700 font-bold bg-rose-200 px-1 rounded">
                      {overdueCount} Overdue
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-rose-900 tabular-nums mt-0.5">
                  {urgentCount}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Completed Filings */}
          <button
            onClick={() => {
              setFilterCompletedOnly(!filterCompletedOnly);
              if (!filterCompletedOnly) setFilterUrgentOnly(false);
            }}
            className={`p-3 rounded border text-left transition-all ${
              filterCompletedOnly
                ? 'bg-emerald-100 border-emerald-300 ring-2 ring-emerald-400'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-800 font-medium">Completed & Filed</div>
                <div className="text-2xl font-bold text-emerald-900 tabular-nums mt-0.5">
                  {completedFilings.length}
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* WhatsApp Sourced */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">WhatsApp Sync Log</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {whatsappSourcedCount}
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
