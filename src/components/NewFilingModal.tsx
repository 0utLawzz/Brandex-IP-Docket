import React, { useState } from 'react';
import { FilingItem, FilingStage, IPType, PriorityLevel } from '../types';
import { CURRENT_DATE_STR } from '../utils/dateUtils';
import { Plus, Scale, X } from 'lucide-react';

interface NewFilingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFiling: (filing: FilingItem) => void;
  defaultStage?: FilingStage;
}

export const NewFilingModal: React.FC<NewFilingModalProps> = ({
  isOpen,
  onClose,
  onAddFiling,
  defaultStage = 'new_instruction',
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [ipType, setIpType] = useState<IPType>('Trademark');
  const [appNumber, setAppNumber] = useState('');
  const [niceClass, setNiceClass] = useState('Class 35');
  const [taskType, setTaskType] = useState('TM-1 Application Preparation & Filing');
  const [stage, setStage] = useState<FilingStage>(defaultStage);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [jurisdiction, setJurisdiction] = useState('IPO Pakistan (Lahore Registry)');
  const [notes, setNotes] = useState('');
  const [statutoryRef, setStatutoryRef] = useState('Trade Marks Ordinance 2001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) return;

    const newFilingId = `bla-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newFiling: FilingItem = {
      id: newFilingId,
      title: title.trim(),
      client: client.trim(),
      ipType,
      appNumber: appNumber.trim() || `${ipType === 'Trademark' ? 'TM' : 'P'}-Draft`,
      niceClass: niceClass.trim(),
      jurisdiction,
      taskType: taskType.trim(),
      stage,
      dueDate,
      priority,
      completed: false,
      notes: notes.trim(),
      statutoryRef: statutoryRef.trim(),
      assignedLawyer: 'Ali Raza, Advocate High Court',
      source: 'manual',
      remindersSent: 0,
      createdAt: CURRENT_DATE_STR,
      subtasks: [
        { id: `${newFilingId}-st-1`, title: 'Prepare Form & client verification', completed: false },
        { id: `${newFilingId}-st-2`, title: 'Collect official filing fee / challan receipt', completed: false },
        { id: `${newFilingId}-st-3`, title: 'Lodge at IPO Pakistan Registry', completed: false },
      ],
    };

    onAddFiling(newFiling);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Docket New IP Filing / Matter</h2>
              <p className="text-xs text-slate-300">
                Register application details, statutory dates, and procedural steps
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Mark / Invention Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ULTRA GLOW, SOLARMAX"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Client / Applicant <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alpha Foods Ltd"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">IP Category</label>
              <select
                value={ipType}
                onChange={(e) => {
                  const val = e.target.value as IPType;
                  setIpType(val);
                  if (val === 'Patent') {
                    setNiceClass('IPC B60K');
                    setTaskType('Patent Form 1 & Complete Specification Form 2');
                    setStatutoryRef('Patents Ordinance 2000');
                  } else if (val === 'Copyright') {
                    setNiceClass('Literary/Software');
                    setTaskType('Copyright Form 1 & Deposit of Work');
                    setStatutoryRef('Copyright Ordinance 1962');
                  } else if (val === 'Industrial Design') {
                    setNiceClass('Class 06-01');
                    setTaskType('Design Application Form ID-1');
                    setStatutoryRef('Registered Designs Ordinance 2000');
                  } else {
                    setNiceClass('Class 35');
                    setTaskType('TM-1 Application Preparation & Filing');
                    setStatutoryRef('Trade Marks Ordinance 2001');
                  }
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900"
              >
                <option value="Trademark">Trademark</option>
                <option value="Patent">Patent</option>
                <option value="Copyright">Copyright</option>
                <option value="Industrial Design">Industrial Design</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Application / Filing Reference</label>
              <input
                type="text"
                placeholder="e.g. TM-614920 or P-2025/1102"
                value={appNumber}
                onChange={(e) => setAppNumber(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nice / IPC Classification</label>
              <input
                type="text"
                placeholder="e.g. Class 5 (Pharma) or Class 30"
                value={niceClass}
                onChange={(e) => setNiceClass(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Statutory Deadline</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-slate-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Filing Workflow Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as FilingStage)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900"
              >
                <option value="new_instruction">New Instruction</option>
                <option value="drafting">Drafting & Prep</option>
                <option value="office_action">Office Action / Objection</option>
                <option value="hearing_opposition">Hearing & Opposition</option>
                <option value="registered">Completed / Registered</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Urgency</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900"
              >
                <option value="urgent">Urgent (&lt;5 Days)</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Specific Task / Office Action</label>
            <input
              type="text"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              placeholder="e.g. TM-11 Reply to Examiner Report under Sec 14"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Forum / Jurisdiction</label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Docket Notes / Boss Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter specific instructions, required documents, or client brief..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white"
            />
          </div>

          {/* Footer inside form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add to Brandex Docket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
