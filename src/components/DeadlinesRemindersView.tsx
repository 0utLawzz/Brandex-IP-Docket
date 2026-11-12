import React, { useState } from 'react';
import { FilingItem, ReminderRule } from '../types';
import { DEFAULT_REMINDER_RULES } from '../data/seedData';
import { getDaysRemaining, formatDatePretty, formatDueDateBadge, generateClientEmailNotice } from '../utils/dateUtils';
import {
  Bell,
  Clock,
  AlertTriangle,
  Mail,
  Send,
  CheckCircle,
  Calendar,
  ShieldAlert,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DeadlinesRemindersViewProps {
  filings: FilingItem[];
  onOpenEmailNotice: (filing: FilingItem) => void;
  onToggleComplete: (id: string) => void;
  onOpenDetail: (filing: FilingItem) => void;
}

export const DeadlinesRemindersView: React.FC<DeadlinesRemindersViewProps> = ({
  filings,
  onOpenEmailNotice,
  onToggleComplete,
  onOpenDetail,
}) => {
  const [rules, setRules] = useState<ReminderRule[]>(DEFAULT_REMINDER_RULES);
  const [timeWindow, setTimeWindow] = useState<'7' | '14' | '30' | 'all'>('14');
  const [testSendStatus, setTestSendStatus] = useState<{ id: string; message: string } | null>(null);

  const activeFilings = filings.filter((f) => !f.completed);

  // Filter matters based on time window
  const windowDays = timeWindow === 'all' ? 9999 : parseInt(timeWindow, 10);
  const upcomingFilings = activeFilings
    .filter((f) => {
      const days = getDaysRemaining(f.dueDate);
      return days <= windowDays;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleQuickDispatchReminder = async (filing: FilingItem) => {
    const { subject } = generateClientEmailNotice(filing);
    try {
      const res = await fetch('/api/send-email-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: filing.clientEmail || 'client@brandex.pk',
          subject,
          filingTitle: filing.title,
          clientName: filing.client,
          dueDate: filing.dueDate,
          taskType: filing.taskType,
          statutoryRef: filing.statutoryRef,
        }),
      });
      const data = await res.json();
      setTestSendStatus({
        id: filing.id,
        message: `Dispatched automated reminder #${data.trackingId} to ${filing.client}!`,
      });
      filing.remindersSent = (filing.remindersSent || 0) + 1;
      setTimeout(() => setTestSendStatus(null), 4000);
    } catch {
      setTestSendStatus({
        id: filing.id,
        message: 'Dispatched automated reminder notification.',
      });
      setTimeout(() => setTestSendStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
            <Bell className="w-4 h-4" />
            <span>Automated Statutory Deadline Monitor</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Office Actions, Hearing Notices & Statutory Cutoff Dates
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic tracking for Trademark TM-11, Oppositions, Patent Complete Specifications, and Renewals
          </p>
        </div>

        {/* Filter by window */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded border border-slate-200">
          <span className="text-xs text-slate-500 px-2 font-medium">Timeline Window:</span>
          {(['7', '14', '30', 'all'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                timeWindow === w
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {w === 'all' ? 'All Upcoming' : `${w} Days`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Upcoming Statutory Deadlines List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Impending Statutory Deadlines</span>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {upcomingFilings.length}
              </span>
            </h3>
            <span className="text-xs text-slate-400">Sorted by nearest statutory date</span>
          </div>

          <div className="space-y-3">
            {upcomingFilings.map((filing, uIdx) => {
              const days = getDaysRemaining(filing.dueDate);
              const badge = formatDueDateBadge(filing.dueDate, filing.completed);
              const isUrgent = days <= 3;

              return (
                <div
                  key={`${filing.id}-${uIdx}`}
                  className={`p-4 rounded-lg border transition-all bg-white shadow-xs ${
                    isUrgent ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">{filing.ipType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{filing.niceClass}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-700">
                          {filing.appNumber}
                        </span>
                      </div>
                      <h4
                        onClick={() => onOpenDetail(filing)}
                        className="text-base font-bold text-slate-900 hover:text-amber-700 cursor-pointer transition-colors"
                      >
                        {filing.title}
                      </h4>
                      <div className="text-xs text-slate-600 font-medium">
                        Client: <span className="text-slate-800">{filing.client}</span>
                      </div>
                    </div>

                    {/* Deadline Badge */}
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {formatDatePretty(filing.dueDate)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border mt-1 ${badge.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                        <span>{badge.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Task details */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-150 text-xs text-slate-700">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{filing.taskType}</span>
                    </div>
                    <p className="mt-1 text-slate-600 line-clamp-2">{filing.notes}</p>
                    {filing.statutoryRef && (
                      <div className="mt-1 text-[11px] text-slate-400 font-mono">
                        Statutory Authority: {filing.statutoryRef}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      <span>Reminders Sent: </span>
                      <span className="font-mono font-bold text-slate-700">{filing.remindersSent || 0}</span>
                      {filing.lastReminderDate && (
                        <span className="text-[11px] text-slate-400 ml-1">
                          (Last: {formatDatePretty(filing.lastReminderDate)})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickDispatchReminder(filing)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                        title="Simulate automated background email reminder dispatch"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Auto-Send Alert</span>
                      </button>
                      <button
                        onClick={() => onOpenEmailNotice(filing)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                        title="Open email drafter to customize message"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview & Edit Notice</span>
                      </button>
                      <button
                        onClick={() => onToggleComplete(filing.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark Done</span>
                      </button>
                    </div>
                  </div>

                  {testSendStatus?.id === filing.id && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{testSendStatus.message}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {upcomingFilings.length === 0 && (
              <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">No Pending Deadlines in Selected Window</h4>
                <p className="text-xs text-slate-500 mt-1">
                  All matters within {timeWindow} days are completed or filed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Automated Reminder Rules Engine */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Automated Notification Rules
                </h3>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                Active System
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Brandex Law automatically triggers email & alert notifications for upcoming statutory deadlines before
              the Trade Marks Registry or Patent Office.
            </p>

            <div className="space-y-2.5">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-3 rounded border transition-colors ${
                    rule.enabled ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-100/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{rule.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Target: <span className="font-medium capitalize">{rule.target}</span> (
                        {rule.daysBefore} days prior)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                        rule.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-150 text-[11px] text-slate-500 space-y-1.5">
              <div className="font-semibold text-slate-700">Official IPO Pakistan Statutory Windows:</div>
              <div>• Section 14 Examination Response: <span className="font-mono font-medium">30 Days</span></div>
              <div>• Notice of Opposition (Rule 30): <span className="font-mono font-medium">60 Days</span></div>
              <div>• Counter-Statement (Rule 32): <span className="font-mono font-medium">60 Days</span></div>
              <div>• TM-16 Renewal: <span className="font-mono font-medium">Up to 6 Months prior</span></div>
            </div>
          </div>

          {/* Quick Legal Notice Drafter Card */}
          <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Smart Legal Drafter</span>
            </div>
            <h4 className="text-sm font-bold text-white">One-Click Client Notices</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generate formal attorney notifications citing Trade Marks Ordinance 2001, Patent Ordinance 2000, and
              official IPO requirements with zero manual drafting.
            </p>
            <div className="pt-2">
              <div className="text-[11px] text-slate-400 font-mono">
                Brandex Law Association · Lahore • Karachi • Islamabad
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
