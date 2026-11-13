import React, { useState, useEffect } from 'react';
import { FilingItem, FilingStage, InternalComment, IPType, Subtask } from '../types';
import { formatDatePretty, formatDueDateBadge } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Circle,
  Clock,
  MessageSquare,
  Plus,
  Scale,
  StickyNote,
  Trash2,
  User,
  X,
  FileCheck,
} from 'lucide-react';

interface FilingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  filing: FilingItem | null;
  onUpdateFiling: (updated: FilingItem) => void;
  onDeleteFiling: (id: string) => void;
}

const formatCommentTimestamp = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const FilingDetailModal: React.FC<FilingDetailModalProps> = ({
  isOpen,
  onClose,
  filing,
  onUpdateFiling,
  onDeleteFiling,
}) => {
  const [formData, setFormData] = useState<FilingItem | null>(filing ? { ...filing } : null);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [quickNoteText, setQuickNoteText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(
    filing?.assignedLawyer || 'Ali Raza, Advocate High Court'
  );

  useEffect(() => {
    if (filing) {
      setFormData({ ...filing });
      setCommentAuthor(filing.assignedLawyer || 'Ali Raza, Advocate High Court');
      setQuickNoteText('');
      setNewSubtaskText('');
    } else {
      setFormData(null);
    }
  }, [filing]);

  if (!isOpen || !filing || !formData) return null;

  const badge = formatDueDateBadge(formData.dueDate, formData.completed);

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (formData.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const updated = { ...formData, subtasks: updatedSubtasks };
    setFormData(updated);
    onUpdateFiling(updated);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: newSubtaskText.trim(),
      completed: false,
    };
    const updated = {
      ...formData,
      subtasks: [...(formData.subtasks || []), newSt],
    };
    setFormData(updated);
    onUpdateFiling(updated);
    setNewSubtaskText('');
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updated = {
      ...formData,
      subtasks: (formData.subtasks || []).filter((s) => s.id !== subtaskId),
    };
    setFormData(updated);
    onUpdateFiling(updated);
  };

  const handleAddQuickNote = () => {
    const trimmed = quickNoteText.trim();
    if (!trimmed) return;

    const newComment: InternalComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: trimmed,
      author: commentAuthor.trim() || formData.assignedLawyer || 'Attorney (Brandex Law)',
      timestamp: new Date().toISOString(),
    };

    const updated: FilingItem = {
      ...formData,
      internalComments: [newComment, ...(formData.internalComments || [])],
    };

    setFormData(updated);
    onUpdateFiling(updated);
    setQuickNoteText('');
  };

  const handleDeleteQuickNote = (commentId: string) => {
    const updated: FilingItem = {
      ...formData,
      internalComments: (formData.internalComments || []).filter((c) => c.id !== commentId),
    };
    setFormData(updated);
    onUpdateFiling(updated);
  };

  const handleToggleCompleted = () => {
    const newCompleted = !formData.completed;
    const updated = {
      ...formData,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString().split('T')[0] : undefined,
      stage: newCompleted ? ('registered' as FilingStage) : formData.stage,
    };
    setFormData(updated);
    onUpdateFiling(updated);
    if (newCompleted) {
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const handleSave = () => {
    let finalData = formData;
    if (quickNoteText.trim()) {
      const pendingComment: InternalComment = {
        id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: quickNoteText.trim(),
        author: commentAuthor.trim() || formData.assignedLawyer || 'Attorney (Brandex Law)',
        timestamp: new Date().toISOString(),
      };
      finalData = {
        ...formData,
        internalComments: [pendingComment, ...(formData.internalComments || [])],
      };
      setQuickNoteText('');
    }
    onUpdateFiling(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <span>{formData.ipType}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{formData.appNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{formData.niceClass}</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">{formData.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCompleted}
              className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
                formData.completed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-200 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              {formData.completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span>{formData.completed ? 'Filed & Completed' : 'Mark as Completed'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Status and Urgency Strip */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Statutory Cutoff:</span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {formatDatePretty(formData.dueDate)}
              </span>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${badge.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                <span>{badge.text}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Pipeline Stage:</span>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as FilingStage })}
                className="bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800"
              >
                <option value="new_instruction">New Instruction</option>
                <option value="drafting">Drafting & Prep</option>
                <option value="office_action">Office Action / Objection</option>
                <option value="hearing_opposition">Hearing & Opposition</option>
                <option value="registered">Completed / Registered</option>
              </select>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Matter / Mark Name</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client / Applicant</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">IP Category</label>
              <select
                value={formData.ipType}
                onChange={(e) => setFormData({ ...formData, ipType: e.target.value as IPType })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
              >
                <option value="Trademark">Trademark</option>
                <option value="Patent">Patent</option>
                <option value="Copyright">Copyright</option>
                <option value="Industrial Design">Industrial Design</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Application / Docket Number</label>
              <input
                type="text"
                value={formData.appNumber}
                onChange={(e) => setFormData({ ...formData, appNumber: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Statutory Task / Action</label>
              <input
                type="text"
                value={formData.taskType}
                onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Statutory Authority / Citation</label>
              <input
                type="text"
                value={formData.statutoryRef || ''}
                onChange={(e) => setFormData({ ...formData, statutoryRef: e.target.value })}
                placeholder="e.g. Section 14(2) Trade Marks Ordinance 2001"
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Statutory Deadline</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registry Forum / Jurisdiction</label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
          </div>

          {/* Notes and instructions */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Legal Notes & Instructions</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-white border border-slate-300 rounded text-slate-800 leading-relaxed"
            />
          </div>

          {/* Raw WhatsApp text if imported */}
          {formData.rawWhatsAppText && (
            <div className="p-3 bg-emerald-50/70 rounded border border-emerald-200">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Original WhatsApp Message from Boss</span>
              </div>
              <p className="text-slate-700 font-mono text-[11px] leading-relaxed italic">
                "{formData.rawWhatsAppText}"
              </p>
            </div>
          )}

          {/* Subtasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-slate-600" />
                <span>Action Checklist & IPO Steps</span>
                <span className="text-[11px] font-mono text-slate-500 font-normal">
                  ({(formData.subtasks || []).filter((s) => s.completed).length}/
                  {(formData.subtasks || []).length} completed)
                </span>
              </label>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
              {(formData.subtasks || []).map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between gap-2 p-1.5 bg-white rounded border border-slate-200"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(subtask.id)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span
                      className={`text-xs ${
                        subtask.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="text-slate-300 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add subtask input */}
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="text"
                  placeholder="Add procedural step (e.g., Pay fee challan PKR 3,000)..."
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Note — Timestamped Internal Attorney Comments */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-amber-600" />
                <span>Quick Note (Internal Attorney Comments)</span>
                <span className="text-[11px] font-mono text-slate-500 font-normal">
                  ({(formData.internalComments || []).length})
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                Internal log · Not shared with clients
              </span>
            </div>

            <div className="bg-amber-50/50 p-3 rounded border border-amber-200/80 space-y-3">
              {/* Quick Note Input Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 shrink-0">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">Attorney:</span>
                  </div>
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="Attorney name"
                    className="flex-1 text-xs px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="flex items-start gap-2">
                  <textarea
                    rows={2}
                    placeholder="Type a Quick Note (e.g., Spoke with IPO Examiner regarding Sec 14 citation; client affidavit confirmed)..."
                    value={quickNoteText}
                    onChange={(e) => setQuickNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleAddQuickNote();
                      }
                    }}
                    className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuickNote}
                    disabled={!quickNoteText.trim()}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                </div>
              </div>

              {/* Timestamped Comments Log */}
              {(formData.internalComments || []).length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(formData.internalComments || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2.5 bg-white rounded border border-amber-200/80 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 font-semibold text-slate-800">
                          <span>{comment.author}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-500 font-normal">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {formatCommentTimestamp(comment.timestamp)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuickNote(comment.id)}
                          className="text-slate-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                          title="Delete internal comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic py-1">
                  No internal attorney comments recorded yet. Add a Quick Note above to log a timestamped update.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this filing from the docket?')) {
                onDeleteFiling(formData.id);
                onClose();
              }
            }}
            className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Matter</span>
          </button>
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
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs transition-colors"
            >
              Save Docket Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
