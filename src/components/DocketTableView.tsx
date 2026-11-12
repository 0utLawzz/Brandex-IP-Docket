import React, { useState, useMemo } from 'react';
import { FilingItem, IPType, PriorityLevel } from '../types';
import { formatDueDateBadge, formatDatePretty, getDaysRemaining } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  Search,
  Filter,
  CheckCircle,
  Circle,
  Download,
  Mail,
  Copy,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface DocketTableViewProps {
  filings: FilingItem[];
  onToggleComplete: (id: string) => void;
  onOpenDetail: (filing: FilingItem) => void;
  onOpenEmailNotice: (filing: FilingItem) => void;
  filterUrgentOnly: boolean;
  filterCompletedOnly: boolean;
}

export const DocketTableView: React.FC<DocketTableViewProps> = ({
  filings,
  onToggleComplete,
  onOpenDetail,
  onOpenEmailNotice,
  filterUrgentOnly,
  filterCompletedOnly,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIpType, setSelectedIpType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'urgent'>(
    filterUrgentOnly ? 'urgent' : filterCompletedOnly ? 'completed' : 'all'
  );
  const [sortBy, setSortBy] = useState<'dueDate' | 'title' | 'client' | 'priority'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered and sorted filings
  const filteredFilings = useMemo(() => {
    return filings
      .filter((f) => {
        // Search term filter
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          !query ||
          f.title.toLowerCase().includes(query) ||
          f.client.toLowerCase().includes(query) ||
          f.appNumber.toLowerCase().includes(query) ||
          f.niceClass.toLowerCase().includes(query) ||
          f.taskType.toLowerCase().includes(query);

        // IP Type filter
        const matchesIp = selectedIpType === 'all' || f.ipType === selectedIpType;

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'pending') {
          matchesStatus = !f.completed;
        } else if (statusFilter === 'completed') {
          matchesStatus = f.completed;
        } else if (statusFilter === 'urgent') {
          matchesStatus = !f.completed && getDaysRemaining(f.dueDate) <= 5;
        }

        return matchesSearch && matchesIp && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'dueDate') {
          comp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        } else if (sortBy === 'client') {
          comp = a.client.localeCompare(b.client);
        } else if (sortBy === 'priority') {
          const priorityScore = { urgent: 3, high: 2, normal: 1 };
          comp = priorityScore[b.priority] - priorityScore[a.priority];
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [filings, searchTerm, selectedIpType, statusFilter, sortBy, sortOrder]);

  const [csvDownloaded, setCsvDownloaded] = useState(false);

  const exportCSV = () => {
    const headers = [
      'Application Reference',
      'Matter / Mark Title',
      'Client / Applicant Name',
      'IP Category',
      'Nice / IPC Classification',
      'Statutory Milestone / Task',
      'Workflow Stage',
      'Statutory Due Date',
      'Status',
      'Days Remaining',
      'Forum / Registry Jurisdiction',
      'Priority Urgency',
      'Statutory Reference',
      'Assigned Counsel',
      'Reminders Dispatched',
      'Client Email',
      'Docket Notes & Brief',
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredFilings.map((f) => {
      const days = getDaysRemaining(f.dueDate);
      const statusText = f.completed
        ? 'Completed & Filed'
        : days < 0
        ? `Overdue (${Math.abs(days)} days)`
        : days === 0
        ? 'Due Today'
        : `Pending (${days} days left)`;

      return [
        escapeCSV(f.appNumber),
        escapeCSV(f.title),
        escapeCSV(f.client),
        escapeCSV(f.ipType),
        escapeCSV(f.niceClass),
        escapeCSV(f.taskType),
        escapeCSV(f.stage),
        escapeCSV(f.dueDate),
        escapeCSV(statusText),
        escapeCSV(days),
        escapeCSV(f.jurisdiction),
        escapeCSV(f.priority.toUpperCase()),
        escapeCSV(f.statutoryRef || 'Trade Marks Ordinance 2001'),
        escapeCSV(f.assignedLawyer),
        escapeCSV(f.remindersSent || 0),
        escapeCSV(f.clientEmail || 'docket@brandex.pk'),
        escapeCSV(f.notes || ''),
      ].join(',');
    });

    // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Brandex_Law_IP_Docket_Archive_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Mark, Client, App No, or Task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white text-slate-900"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* IP Category Filter */}
          <select
            value={selectedIpType}
            onChange={(e) => setSelectedIpType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All IP Types</option>
            <option value="Trademark">Trademarks</option>
            <option value="Patent">Patents</option>
            <option value="Copyright">Copyrights</option>
            <option value="Industrial Design">Industrial Designs</option>
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({filings.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({filings.filter((f) => !f.completed).length})
            </button>
            <button
              onClick={() => setStatusFilter('urgent')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'urgent'
                  ? 'bg-rose-50 text-rose-800 shadow-xs font-bold'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Urgent ({filings.filter((f) => !f.completed && getDaysRemaining(f.dueDate) <= 5).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Completed ({filings.filter((f) => f.completed).length})
            </button>
          </div>

          {/* CSV Export Button */}
          <button
            onClick={exportCSV}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all whitespace-nowrap shadow-xs ${
              csvDownloaded
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
            title="Download filing records as a CSV archive for external reporting or archive purposes"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{csvDownloaded ? 'Exported CSV!' : `Export to CSV (${filteredFilings.length})`}</span>
          </button>
        </div>
      </div>

      {/* Table Surface */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-10 text-center">Done</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => {
                    setSortBy('title');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Matter / Mark Name
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => {
                    setSortBy('client');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Client / Applicant
                </th>
                <th className="py-2.5 px-3">IP Category & Class</th>
                <th className="py-2.5 px-3">App Reference</th>
                <th className="py-2.5 px-3">Statutory Milestone / Task</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => {
                    setSortBy('dueDate');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Statutory Due Date
                </th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredFilings.map((filing, rIdx) => {
                const badge = formatDueDateBadge(filing.dueDate, filing.completed);

                return (
                  <tr
                    key={`${filing.id}-${rIdx}`}
                    onClick={() => onOpenDetail(filing)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                      filing.completed ? 'bg-slate-50/40 text-slate-400' : ''
                    }`}
                  >
                    {/* Completion Checkbox */}
                    <td
                      className="py-2.5 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(filing.id);
                        if (!filing.completed) confetti({ particleCount: 25, spread: 45 });
                      }}
                    >
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-slate-200 transition-colors inline-flex"
                      >
                        {filing.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 hover:text-emerald-600" />
                        )}
                      </button>
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-3">
                      <div
                        className={`font-bold text-slate-900 group-hover:text-amber-700 transition-colors ${
                          filing.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {filing.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{filing.jurisdiction}</div>
                    </td>

                    {/* Client */}
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{filing.client}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {filing.clientEmail || 'Legal Department'}
                      </div>
                    </td>

                    {/* Category & Class */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <span>{filing.ipType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums text-slate-500">{filing.niceClass}</span>
                      </div>
                    </td>

                    {/* App Reference */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono tabular-nums bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                        {filing.appNumber}
                      </span>
                    </td>

                    {/* Task */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-800 truncate">{filing.taskType}</div>
                      {filing.statutoryRef && (
                        <div className="text-[10px] text-slate-400 font-mono truncate">{filing.statutoryRef}</div>
                      )}
                    </td>

                    {/* Due Date & Badge */}
                    <td className="py-2.5 px-3">
                      <div className="font-mono tabular-nums text-slate-900 font-medium">
                        {formatDatePretty(filing.dueDate)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] border mt-0.5 ${badge.color}`}
                      >
                        <span className={`w-1 h-1 rounded-full ${badge.dotColor}`} />
                        <span>{badge.text}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEmailNotice(filing)}
                          className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Draft statutory email reminder for client"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenDetail(filing)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="View complete docket file"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredFilings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No filing matters match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            Showing <span className="font-mono font-semibold">{filteredFilings.length}</span> of{' '}
            <span className="font-mono font-semibold">{filings.length}</span> total matters in Brandex Law docket
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Click any row to open filing particulars, statutory forms, and lawyer notes
            </span>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
              title="Download filing records as a CSV archive"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export to CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
