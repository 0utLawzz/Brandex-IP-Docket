import React from 'react';
import { Scale, MessageSquareCode, Plus, Palette, Search, X } from 'lucide-react';
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewFiling,
  onOpenWhatsAppModal,
  urgentCount,
  currentTheme,
  onOpenThemeModal,
  searchQuery,
  onSearchChange,
  matchingCount,
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
        <div className="flex items-center justify-between gap-4 sm:gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
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

          {/* Global Search Bar (Applicant Name or File Ref # across all views) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none transition-colors group-focus-within:text-slate-800" />
              <input
                type="text"
                placeholder="Search applicant name or file ref # (e.g. 614920, Alpha Foods)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs rounded border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-500 focus:ring-2 focus:ring-amber-400 transition-all font-sans"
              />
              {searchQuery && (
                <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                  {typeof matchingCount === 'number' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 group-focus-within:bg-amber-100 group-focus-within:text-amber-800 rounded font-semibold">
                      {matchingCount} found
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="text-slate-400 hover:text-white group-focus-within:text-slate-600 p-0.5 rounded"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Zone 2: Concise Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-300 shrink-0">
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
              <span>Deadlines</span>
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

          {/* Zone 3: Vibe switcher + Quick actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Theme Vibe Selector Button */}
            <button
              onClick={onOpenThemeModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded transition-colors whitespace-nowrap shrink-0"
              title="Click to view and select from the 4 legal firm aesthetics"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: 'var(--theme-crest)' }} />
              <span className="hidden sm:inline">Vibe:</span>
              <span className="font-bold text-white">{currentThemeObj.name.split(' ')[0]}</span>
            </button>

            <button
              onClick={onOpenWhatsAppModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800 rounded hover:bg-emerald-900 transition-colors whitespace-nowrap shrink-0"
              title="Paste boss WhatsApp message to auto-docket"
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Import WhatsApp</span>
            </button>

            <button
              onClick={onOpenNewFiling}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-all whitespace-nowrap shrink-0 shadow-sm hover:opacity-95"
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

        {/* Mobile Search Bar (visible on narrow screens) */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative group">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search applicant or file ref # across all views..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded border border-white/20 bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-amber-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
