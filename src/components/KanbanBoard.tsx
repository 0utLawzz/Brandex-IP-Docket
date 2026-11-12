import React, { useState } from 'react';
import { FilingItem, FilingStage } from '../types';
import { formatDueDateBadge, getDaysRemaining } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Circle,
  Copy,
  ExternalLink,
  GripVertical,
  Mail,
  MoreVertical,
  Plus,
  Trash2,
  FileCheck2,
} from 'lucide-react';

interface KanbanBoardProps {
  filings: FilingItem[];
  onUpdateStage: (id: string, newStage: FilingStage) => void;
  onToggleComplete: (id: string) => void;
  onOpenDetail: (filing: FilingItem) => void;
  onOpenEmailNotice: (filing: FilingItem) => void;
  onDeleteFiling: (id: string) => void;
  onQuickAdd: (stage: FilingStage) => void;
}

interface ColumnConfig {
  id: FilingStage;
  title: string;
  description: string;
  accent: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'new_instruction',
    title: 'New Instruction',
    description: 'Fresh WhatsApp briefs & availability search',
    accent: 'border-t-slate-500',
  },
  {
    id: 'drafting',
    title: 'Drafting & Prep',
    description: 'Forms TM-1, Specs, Power of Attorney',
    accent: 'border-t-blue-500',
  },
  {
    id: 'office_action',
    title: 'Office Action / Objection',
    description: 'Examiner reports, Section 14 citations',
    accent: 'border-t-amber-500',
  },
  {
    id: 'hearing_opposition',
    title: 'Hearing & Opposition',
    description: 'Oppositions, TM-13 counter, hearings',
    accent: 'border-t-purple-500',
  },
  {
    id: 'registered',
    title: 'Completed / Registered',
    description: 'Filed, certificate issued, work dispatched',
    accent: 'border-t-emerald-500',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  filings,
  onUpdateStage,
  onToggleComplete,
  onOpenDetail,
  onOpenEmailNotice,
  onDeleteFiling,
  onQuickAdd,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<FilingStage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: FilingStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: FilingStage) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      onUpdateStage(id, targetStage);
      if (targetStage === 'registered') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }
    setDraggedId(null);
  };

  const handleCopySummary = (e: React.MouseEvent, filing: FilingItem) => {
    e.stopPropagation();
    const text = `Brandex Docket: ${filing.title} (${filing.appNumber}) | ${filing.client} | Action: ${filing.taskType} | Due: ${filing.dueDate}`;
    navigator.clipboard.writeText(text);
    setCopiedId(filing.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="min-w-[1240px] grid grid-cols-5 gap-4">
        {COLUMNS.map((column) => {
          const columnFilings = filings.filter((f) => f.stage === column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col bg-slate-100/80 rounded-lg border transition-all min-h-[580px] ${
                column.accent
              } border-t-4 ${
                isOver ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-300' : 'border-slate-200'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 bg-white/70 rounded-t flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800">{column.title}</h3>
                    <span className="text-xs font-mono tabular-nums px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-semibold">
                      {columnFilings.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{column.description}</p>
                </div>
                <button
                  onClick={() => onQuickAdd(column.id)}
                  title={`Add matter to ${column.title}`}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 flex-1 flex flex-col">
                {columnFilings.map((filing, fIdx) => {
                  const badge = formatDueDateBadge(filing.dueDate, filing.completed);
                  const isDragging = draggedId === filing.id;
                  const totalSubtasks = filing.subtasks?.length || 0;
                  const completedSubtasks = filing.subtasks?.filter((s) => s.completed).length || 0;

                  return (
                    <div
                      key={`${filing.id}-${fIdx}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, filing.id)}
                      onClick={() => onOpenDetail(filing)}
                      className={`group relative bg-white rounded-md border border-slate-200 p-3 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer ${
                        isDragging ? 'opacity-40 scale-95 border-amber-400' : ''
                      } ${filing.completed ? 'bg-slate-50/80 text-slate-500' : ''}`}
                    >
                      {/* Top Bar: Mark Type + App Number */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                        <div className="flex items-center gap-1 font-medium">
                          <span
                            className={
                              filing.ipType === 'Trademark'
                                ? 'text-blue-700'
                                : filing.ipType === 'Patent'
                                ? 'text-purple-700'
                                : filing.ipType === 'Copyright'
                                ? 'text-amber-700'
                                : 'text-teal-700'
                            }
                          >
                            {filing.ipType}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{filing.niceClass}</span>
                        </div>
                        <span className="font-mono tabular-nums text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-[10px]">
                          {filing.appNumber}
                        </span>
                      </div>

                      {/* Title & Client */}
                      <h4
                        className={`text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 ${
                          filing.completed ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {filing.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                        {filing.client}
                      </p>

                      {/* Task / Action */}
                      <div className="mt-2 text-xs font-medium text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-150 line-clamp-2">
                        {filing.taskType}
                      </div>

                      {/* Subtask progress if any */}
                      {totalSubtasks > 0 && (
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {completedSubtasks}/{totalSubtasks} tasks
                            </span>
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Due Date & Urgency Indicator */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border ${badge.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                          <span>{badge.text}</span>
                        </div>

                        {/* Complete Toggle Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(filing.id);
                            if (!filing.completed) {
                              confetti({ particleCount: 30, spread: 50 });
                            }
                          }}
                          className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                            filing.completed ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
                          }`}
                          title={filing.completed ? 'Mark pending' : 'Mark completed'}
                        >
                          {filing.completed ? (
                            <CheckCircle className="w-4 h-4 fill-emerald-100" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Quick Hover Action Bar */}
                      <div
                        className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs opacity-75 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleCopySummary(e, filing)}
                            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Copy summary for WhatsApp"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEmailNotice(filing)}
                            className="p-1 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Draft statutory email notice for client"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFiling(filing.id)}
                            className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete filing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Move stage buttons */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          {column.id !== 'registered' && (
                            <button
                              onClick={() => {
                                const order: FilingStage[] = [
                                  'new_instruction',
                                  'drafting',
                                  'office_action',
                                  'hearing_opposition',
                                  'registered',
                                ];
                                const currentIndex = order.indexOf(column.id);
                                if (currentIndex < order.length - 1) {
                                  onUpdateStage(filing.id, order[currentIndex + 1]);
                                }
                              }}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 rounded border border-slate-200 transition-colors"
                              title="Advance to next filing stage"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>

                      {copiedId === filing.id && (
                        <div className="absolute inset-0 bg-slate-900/90 text-white text-xs flex items-center justify-center rounded font-medium z-10">
                          Copied to Clipboard for WhatsApp!
                        </div>
                      )}
                    </div>
                  );
                })}

                {columnFilings.length === 0 && (
                  <div className="border border-dashed border-slate-300 rounded p-4 text-center my-auto">
                    <p className="text-xs text-slate-400">Drag filings here or click +</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
