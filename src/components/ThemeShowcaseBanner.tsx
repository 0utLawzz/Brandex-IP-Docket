import React, { useState } from 'react';
import { ThemeVibe } from '../types';
import { THEME_VIBES } from '../data/seedData';
import { Palette, Check, Sparkles, ChevronDown, ChevronUp, Scale, Shield, Building, Globe } from 'lucide-react';

interface ThemeShowcaseBannerProps {
  currentTheme: ThemeVibe;
  onSelectTheme: (theme: ThemeVibe) => void;
}

export const ThemeShowcaseBanner: React.FC<ThemeShowcaseBannerProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const mockCards: Record<ThemeVibe, { title: string; client: string; appNo: string; classNo: string; task: string; status: string }> = {
    chancery: {
      title: 'VERTEX GLOW',
      client: 'Alpha Foods Ltd',
      appNo: 'TM-614920',
      classNo: 'Class 30',
      task: 'TM-11 Reply to Examiner',
      status: 'Due in 4 Days',
    },
    tech: {
      title: 'SOLARMAX HYBRID',
      client: 'Vertex Power Systems',
      appNo: 'P-2025/1102',
      classNo: 'IPC B60K',
      task: 'Complete Patent Spec Form 2',
      status: 'Drafting Phase',
    },
    oxblood: {
      title: 'GLUCOSHIELD FORTE',
      client: 'Horizon Pharma Pak',
      appNo: 'TM-588210',
      classNo: 'Class 5',
      task: 'Opposition Hearing IPO',
      status: 'Hearing Nov 14',
    },
    cobalt: {
      title: 'AL-KARAM MOTIF',
      client: 'Al-Karam Textile Mills',
      appNo: 'ID-2026/894',
      classNo: 'Class 05-05',
      task: 'Design Form ID-1 Compliance',
      status: 'Overdue 1 Day',
    },
  };

  const themeIcons: Record<ThemeVibe, React.ReactNode> = {
    chancery: <Scale className="w-4 h-4 text-amber-400" />,
    tech: <Shield className="w-4 h-4 text-emerald-400" />,
    oxblood: <Building className="w-4 h-4 text-amber-300" />,
    cobalt: <Globe className="w-4 h-4 text-blue-300" />,
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Toggle Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-500/15 text-amber-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Visual Design Theme Showcase
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  4 Distinct Law Firm Aesthetics
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Preview live UI mockups side-by-side. Click any vibe to instantly transform headers, buttons, cards, and docket badges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden md:inline">
              Active Vibe:{' '}
              <strong className="text-slate-800 capitalize font-mono">
                {THEME_VIBES.find((t) => t.id === currentTheme)?.name}
              </strong>
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <span>{isExpanded ? 'Collapse Previews' : 'Expand 4 Themes'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Visualizer Cards Strip */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-3 pt-3 border-t border-slate-150">
            {THEME_VIBES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              const mock = mockCards[theme.id];

              return (
                <div
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`rounded-lg border-2 text-left cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-400/30 shadow-md bg-white'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  {/* Miniature Header Bar Preview */}
                  <div
                    className="px-3 py-2 flex items-center justify-between text-white border-b"
                    style={{ backgroundColor: theme.primaryColor, borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]"
                        style={{ backgroundColor: theme.accentColor, color: theme.id === 'tech' || theme.id === 'cobalt' ? '#fff' : '#0f172a' }}
                      >
                        {themeIcons[theme.id]}
                      </div>
                      <span className="text-[11px] font-bold tracking-tight truncate">Brandex Law</span>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/70">Preview</span>
                    )}
                  </div>

                  {/* Vibe Details & Live Mock Card */}
                  <div className="p-3 space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900">{theme.name}</h3>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: theme.primaryColor }}
                            title={`Primary: ${theme.primaryColor}`}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: theme.accentColor }}
                            title={`Accent: ${theme.accentColor}`}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300"
                            style={{ backgroundColor: theme.canvasBg }}
                            title={`Canvas: ${theme.canvasBg}`}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{theme.tagline}</p>
                    </div>

                    {/* Miniature Filing Card Representation */}
                    <div
                      className="p-2.5 rounded border text-[11px] shadow-2xs space-y-1.5 transition-colors"
                      style={{ backgroundColor: theme.canvasBg, borderColor: '#cbd5e1' }}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{mock.classNo}</span>
                        <span className="bg-white/80 px-1 py-0.2 rounded border border-slate-200">{mock.appNo}</span>
                      </div>
                      <div className="font-bold text-slate-900 truncate">{mock.title}</div>
                      <div className="text-[10px] text-slate-600 truncate">{mock.client}</div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                        <span className="text-[10px] text-slate-700 truncate max-w-[120px]">{mock.task}</span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: theme.accentColor,
                            color: theme.id === 'tech' || theme.id === 'cobalt' ? '#fff' : '#0f172a',
                          }}
                        >
                          {mock.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                      {theme.description}
                    </p>
                  </div>

                  {/* Bottom Action */}
                  <div className="p-2 bg-slate-100/70 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {theme.id.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTheme(theme.id);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ Selected Vibe' : 'Select This Vibe'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
