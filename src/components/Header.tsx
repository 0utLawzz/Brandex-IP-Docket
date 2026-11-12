import React from 'react';
import { Scale, MessageSquareCode, Plus, Palette } from 'lucide-react';
import { ThemeVibe } from '../types';
import { THEME_VIBES } from '../data/seedData';

interface HeaderProps {
  activeTab: 'kanban' | 'docket' | 'whatsapp' | 'deadlines' | 'profile';
  setActiveTab: (tab: 'kanban' | 'docket' | 'whatsapp' | 'deadlines' | 'profile') => void;
  onOpenNewFiling: () => void;
  onOpenWhatsAppModal: () => void;
  urgentCount: number;
  currentTheme: ThemeVibe;
  onOpenThemeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewFiling,
  onOpenWhatsAppModal,
  urgentCount,
  currentTheme,
  onOpenThemeModal,
}) => {
  const currentThemeObj = THEME_VIBES.find((t) => t.id === currentTheme) || THEME_VIBES[0];

  return (
    <header
      className="sticky top-0 z-30 border-b text-white shadow-sm transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-header-bg, #0b192c)',
        borderColor: 'var(--theme-header-border, #1e293b)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-bold shadow-inner transition-colors"
              style={{ backgroundColor: 'var(--theme-crest, #f59e0b)' }}
            >
              <Scale className="w-5 h-5 text-slate-950" />
            </div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('kanban');
              }}
              className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
            >
              Brandex Law Association
            </a>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'kanban' ? 'border-b-2 font-semibold' : ''
              }`}
              style={activeTab === 'kanban' ? { color: 'var(--theme-crest)', borderColor: 'var(--theme-crest)' } : {}}
            >
              Filing Pipeline
            </button>
            <button
              onClick={() => setActiveTab('docket')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'docket' ? 'border-b-2 font-semibold' : ''
              }`}
              style={activeTab === 'docket' ? { color: 'var(--theme-crest)', borderColor: 'var(--theme-crest)' } : {}}
            >
              Docket Sheet
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'whatsapp' ? 'border-b-2 font-semibold' : ''
              }`}
              style={activeTab === 'whatsapp' ? { color: 'var(--theme-crest)', borderColor: 'var(--theme-crest)' } : {}}
            >
              <span>WhatsApp Importer</span>
            </button>
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'deadlines' ? 'border-b-2 font-semibold' : ''
              }`}
              style={activeTab === 'deadlines' ? { color: 'var(--theme-crest)', borderColor: 'var(--theme-crest)' } : {}}
            >
              <span>Deadlines & Reminders</span>
              {urgentCount > 0 && (
                <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.2 bg-rose-500 text-white rounded">
                  {urgentCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'profile' ? 'border-b-2 font-semibold' : ''
              }`}
              style={activeTab === 'profile' ? { color: 'var(--theme-crest)', borderColor: 'var(--theme-crest)' } : {}}
            >
              Firm Profile
            </button>
          </nav>

          {/* Zone 3: 1 primary action + design selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Vibe Selector Button */}
            <button
              onClick={onOpenThemeModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded transition-colors whitespace-nowrap shrink-0"
              title="Switch between 4 legal firm aesthetics"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: 'var(--theme-crest)' }} />
              <span className="hidden sm:inline">Vibe:</span>
              <span className="font-bold text-white">{currentThemeObj.name.split(' ')[0]}</span>
            </button>

            <button
              onClick={onOpenWhatsAppModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800 rounded hover:bg-emerald-900 transition-colors whitespace-nowrap shrink-0"
              title="Paste boss WhatsApp message to auto-docket"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Import WhatsApp</span>
            </button>

            <button
              onClick={onOpenNewFiling}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded transition-all whitespace-nowrap shrink-0 shadow-sm hover:opacity-95"
              style={{
                backgroundColor: 'var(--theme-accent, #d97706)',
                color: 'var(--theme-accent-fg, #0f172a)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>New Filing</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
