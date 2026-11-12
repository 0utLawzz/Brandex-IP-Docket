import React, { useState, useEffect } from 'react';
import { FilingItem, FilingStage, NavigationTab, ThemeVibe } from './types';
import { INITIAL_FILINGS } from './data/seedData';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { KanbanBoard } from './components/KanbanBoard';
import { DocketTableView } from './components/DocketTableView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { DeadlinesRemindersView } from './components/DeadlinesRemindersView';
import { FirmProfileView } from './components/FirmProfileView';
import { WhatsAppImporterModal } from './components/WhatsAppImporterModal';
import { BossReportModal } from './components/BossReportModal';
import { EmailNoticeModal } from './components/EmailNoticeModal';
import { FilingDetailModal } from './components/FilingDetailModal';
import { NewFilingModal } from './components/NewFilingModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { ThemeShowcaseBanner } from './components/ThemeShowcaseBanner';
import { getDaysRemaining } from './utils/dateUtils';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'brandex_law_ip_filings_v1';

// Helper to guarantee no duplicate filing or subtask IDs exist across the app
export const sanitizeAndDeduplicateFilings = (items: FilingItem[]): FilingItem[] => {
  const seenIds = new Set<string>();
  const sanitized: FilingItem[] = [];

  for (const item of items) {
    if (!item) continue;
    const itemId = item.id;
    if (itemId && seenIds.has(itemId)) {
      // Exact duplicate entry detected in storage - skip duplicate
      continue;
    }
    const finalId = itemId || `bla-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    seenIds.add(finalId);

    // Also deduplicate subtask IDs
    const seenSubtaskIds = new Set<string>();
    const sanitizedSubtasks = (item.subtasks || []).map((st, sIdx) => {
      let stId = st.id;
      if (!stId || seenSubtaskIds.has(stId)) {
        stId = `st-${finalId}-${sIdx}-${Math.random().toString(36).slice(2, 6)}`;
      }
      seenSubtaskIds.add(stId);
      return { ...st, id: stId };
    });

    sanitized.push({
      ...item,
      id: finalId,
      subtasks: sanitizedSubtasks,
    });
  }

  return sanitized;
};

export default function App() {
  // Initialize filings from localStorage or fallback to realistic initial seed data
  const [filings, setFilings] = useState<FilingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeAndDeduplicateFilings(parsed);
        }
      }
    } catch {
      // fallback
    }
    return sanitizeAndDeduplicateFilings(INITIAL_FILINGS);
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('kanban');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [filterCompletedOnly, setFilterCompletedOnly] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Theme vibe state (persisted to localStorage)
  const [currentTheme, setCurrentTheme] = useState<ThemeVibe>(() => {
    try {
      const savedTheme = localStorage.getItem('brandex_law_theme_vibe');
      if (savedTheme && ['chancery', 'tech', 'oxblood', 'cobalt'].includes(savedTheme)) {
        return savedTheme as ThemeVibe;
      }
    } catch {
      // fallback
    }
    return 'chancery';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply theme data attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    try {
      localStorage.setItem('brandex_law_theme_vibe', currentTheme);
    } catch {
      // ignore
    }
  }, [currentTheme]);

  // Modal controls
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isBossReportModalOpen, setIsBossReportModalOpen] = useState(false);
  const [isNewFilingModalOpen, setIsNewFilingModalOpen] = useState(false);
  const [newFilingDefaultStage, setNewFilingDefaultStage] = useState<FilingStage>('new_instruction');
  const [selectedDetailFiling, setSelectedDetailFiling] = useState<FilingItem | null>(null);
  const [selectedEmailFiling, setSelectedEmailFiling] = useState<FilingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist filings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filings));
    } catch (e) {
      console.warn('Failed to persist filings to localStorage', e);
    }
  }, [filings]);

  // If user clicks "whatsapp" tab in header, open importer modal or show importer view
  useEffect(() => {
    if (activeTab === 'whatsapp') {
      setIsWhatsAppModalOpen(true);
      setActiveTab('kanban');
    }
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stage update handler (Drag & Drop or Next button)
  const handleUpdateStage = (id: string, newStage: FilingStage) => {
    setFilings((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const isRegistered = newStage === 'registered';
          return {
            ...f,
            stage: newStage,
            completed: isRegistered ? true : f.completed,
            completedAt: isRegistered ? new Date().toISOString().split('T')[0] : f.completedAt,
          };
        }
        return f;
      })
    );
  };

  // Toggle completed status
  const handleToggleComplete = (id: string) => {
    setFilings((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newCompleted = !f.completed;
          return {
            ...f,
            completed: newCompleted,
            completedAt: newCompleted ? new Date().toISOString().split('T')[0] : undefined,
            stage: newCompleted ? 'registered' : f.stage === 'registered' ? 'drafting' : f.stage,
          };
        }
        return f;
      })
    );
  };

  // Add filings imported from WhatsApp
  const handleImportFilings = (newFilings: FilingItem[]) => {
    setFilings((prev) => sanitizeAndDeduplicateFilings([...newFilings, ...prev]));
    confetti({ particleCount: 60, spread: 70 });
    showToast(`Successfully docketed ${newFilings.length} filings from WhatsApp!`);
  };

  // Add new manual filing
  const handleAddFiling = (newFiling: FilingItem) => {
    setFilings((prev) => sanitizeAndDeduplicateFilings([newFiling, ...prev]));
    showToast(`Added "${newFiling.title}" to Brandex Law docket!`);
  };

  // Update existing filing
  const handleUpdateFiling = (updated: FilingItem) => {
    setFilings((prev) =>
      sanitizeAndDeduplicateFilings(prev.map((f) => (f.id === updated.id ? updated : f)))
    );
    showToast(`Updated particulars for ${updated.title}`);
  };

  // Delete filing
  const handleDeleteFiling = (id: string) => {
    setFilings((prev) => prev.filter((f) => f.id !== id));
    showToast('Filing removed from docket');
  };

  // Open quick add for a specific column
  const handleQuickAdd = (stage: FilingStage) => {
    setNewFilingDefaultStage(stage);
    setIsNewFilingModalOpen(true);
  };

  // Filter filings across all views by applicant name, file reference number, or title
  const globallyFilteredFilings = filings.filter((f) => {
    if (!globalSearchQuery.trim()) return true;
    const q = globalSearchQuery.toLowerCase().trim();
    return (
      f.client.toLowerCase().includes(q) ||
      f.appNumber.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q) ||
      f.taskType.toLowerCase().includes(q) ||
      f.niceClass.toLowerCase().includes(q) ||
      f.jurisdiction.toLowerCase().includes(q)
    );
  });

  // Filtered filings for Kanban
  const visibleFilings = globallyFilteredFilings.filter((f) => {
    if (filterUrgentOnly) {
      return !f.completed && getDaysRemaining(f.dueDate) <= 3;
    }
    if (filterCompletedOnly) {
      return f.completed;
    }
    return true;
  });

  const urgentCount = filings.filter((f) => !f.completed && getDaysRemaining(f.dueDate) <= 3).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Header with Global Search */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewFiling={() => {
          setNewFilingDefaultStage('new_instruction');
          setIsNewFilingModalOpen(true);
        }}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        urgentCount={urgentCount}
        currentTheme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        searchQuery={globalSearchQuery}
        onSearchChange={setGlobalSearchQuery}
        matchingCount={globalSearchQuery.trim() ? globallyFilteredFilings.length : undefined}
      />

      {/* 4 Curated Design Vibes Visualizer Showcase */}
      <ThemeShowcaseBanner
        currentTheme={currentTheme}
        onSelectTheme={(t) => {
          setCurrentTheme(t);
          showToast(`Applied ${t.toUpperCase()} theme vibe!`);
        }}
      />

      {/* KPI Stats & Quick Action Strip */}
      <StatsBanner
        filings={globallyFilteredFilings}
        onGenerateBossReport={() => setIsBossReportModalOpen(true)}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        filterUrgentOnly={filterUrgentOnly}
        setFilterUrgentOnly={setFilterUrgentOnly}
        filterCompletedOnly={filterCompletedOnly}
        setFilterCompletedOnly={setFilterCompletedOnly}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Global Search Active Banner */}
        {globalSearchQuery.trim() && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs flex items-center justify-between text-blue-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold">Global Search Active:</span>
              <span>
                Showing <strong className="font-mono font-bold text-blue-950">{globallyFilteredFilings.length}</strong> matter{globallyFilteredFilings.length === 1 ? '' : 's'} matching "{globalSearchQuery}" (searched applicant name & file ref # across all views)
              </span>
            </div>
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="text-blue-700 hover:text-blue-900 font-semibold underline text-xs"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Active Filter Bar if active */}
        {(filterUrgentOnly || filterCompletedOnly) && (
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs flex items-center justify-between text-amber-900">
            <span className="font-medium">
              Active Filter:{' '}
              {filterUrgentOnly ? 'Showing Urgent & Overdue Filings Only' : 'Showing Completed Filings Only'}
            </span>
            <button
              onClick={() => {
                setFilterUrgentOnly(false);
                setFilterCompletedOnly(false);
              }}
              className="text-amber-800 underline font-semibold hover:text-amber-950"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'kanban' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Interactive Filing Pipeline (Drag & Drop)
                </h2>
                <p className="text-xs text-slate-500">
                  Move cards across statutory stages: New Instruction → Drafting → Office Action → Hearing → Registered
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded font-medium"
                >
                  + Import WhatsApp Task
                </button>
              </div>
            </div>

            <KanbanBoard
              filings={visibleFilings}
              onUpdateStage={handleUpdateStage}
              onToggleComplete={handleToggleComplete}
              onOpenDetail={(filing) => setSelectedDetailFiling(filing)}
              onOpenEmailNotice={(filing) => setSelectedEmailFiling(filing)}
              onDeleteFiling={handleDeleteFiling}
              onQuickAdd={handleQuickAdd}
            />
          </div>
        )}

        {activeTab === 'docket' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Docket Sheet & Status Register</h2>
              <p className="text-xs text-slate-500">
                Complete audit ledger of all Trademark, Patent, Design, and Copyright applications with statutory due dates
              </p>
            </div>
            <DocketTableView
              filings={globallyFilteredFilings}
              onToggleComplete={handleToggleComplete}
              onOpenDetail={(filing) => setSelectedDetailFiling(filing)}
              onOpenEmailNotice={(filing) => setSelectedEmailFiling(filing)}
              filterUrgentOnly={filterUrgentOnly}
              filterCompletedOnly={filterCompletedOnly}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <AnalyticsDashboardView
            filings={globallyFilteredFilings}
            onOpenDetail={(filing) => setSelectedDetailFiling(filing)}
          />
        )}

        {activeTab === 'deadlines' && (
          <DeadlinesRemindersView
            filings={globallyFilteredFilings}
            onOpenEmailNotice={(filing) => setSelectedEmailFiling(filing)}
            onToggleComplete={handleToggleComplete}
            onOpenDetail={(filing) => setSelectedDetailFiling(filing)}
          />
        )}

        {activeTab === 'profile' && (
          <FirmProfileView
            filings={globallyFilteredFilings}
            onOpenDetail={(filing) => setSelectedDetailFiling(filing)}
          />
        )}
      </main>

      {/* Modals */}
      <WhatsAppImporterModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onImportFilings={handleImportFilings}
      />

      <BossReportModal
        isOpen={isBossReportModalOpen}
        onClose={() => setIsBossReportModalOpen(false)}
        filings={filings}
      />

      <EmailNoticeModal
        isOpen={Boolean(selectedEmailFiling)}
        onClose={() => setSelectedEmailFiling(null)}
        filing={selectedEmailFiling}
        onReminderSent={(id) => {
          setFilings((prev) =>
            prev.map((f) =>
              f.id === id
                ? {
                    ...f,
                    remindersSent: (f.remindersSent || 0) + 1,
                    lastReminderDate: new Date().toISOString().split('T')[0],
                  }
                : f
            )
          );
        }}
      />

      <FilingDetailModal
        isOpen={Boolean(selectedDetailFiling)}
        onClose={() => setSelectedDetailFiling(null)}
        filing={selectedDetailFiling}
        onUpdateFiling={handleUpdateFiling}
        onDeleteFiling={handleDeleteFiling}
      />

      <NewFilingModal
        isOpen={isNewFilingModalOpen}
        onClose={() => setIsNewFilingModalOpen(false)}
        onAddFiling={handleAddFiling}
        defaultStage={newFilingDefaultStage}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(t) => {
          setCurrentTheme(t);
          showToast(`Applied ${t.toUpperCase()} theme vibe!`);
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Brandex Law Association</span>
            <span aria-hidden="true">·</span>
            <span>Trade Marks, Patents, Designs & Copyright Attorneys</span>
            <span aria-hidden="true">·</span>
            <a href="https://brandex.pk" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 underline">
              brandex.pk
            </a>
          </div>
          <div>
            IPO Pakistan Filing Reference Date: <span className="font-mono text-slate-700 font-semibold">2026-11-06</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
