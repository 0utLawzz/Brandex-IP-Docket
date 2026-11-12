import React from 'react';
import { ThemeVibe } from '../types';
import { THEME_VIBES } from '../data/seedData';
import { Palette, Check, Sparkles, X } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeVibe;
  onSelectTheme: (theme: ThemeVibe) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Select Legal Firm Aesthetic (4 Curated Vibes)</h2>
              <p className="text-xs text-slate-300">
                Choose the design atmosphere that best fits your practice style and client presentation
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {THEME_VIBES.map((theme) => {
              const isSelected = currentTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                  }}
                  className={`p-4 rounded-lg border-2 text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-400/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Color Swatch Bar */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-7 h-7 rounded shadow-xs border border-white/20 flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <span className="text-[10px] font-bold">H</span>
                      </div>
                      <div
                        className="w-7 h-7 rounded shadow-xs border border-white/20"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <div
                        className="w-7 h-7 rounded shadow-xs border border-slate-200"
                        style={{ backgroundColor: theme.canvasBg }}
                      />
                      <div className="ml-auto">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Select</span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{theme.name}</h3>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">{theme.tagline}</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
                      {theme.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-150 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Canvas: {theme.canvasBg}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTheme(theme.id);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active Vibe' : 'Apply Vibe'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your selection is instantly applied across all navigation bars, Kanban stages, deadline badges, and docket tables.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Selected: <strong className="text-slate-800 capitalize">{currentTheme}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
