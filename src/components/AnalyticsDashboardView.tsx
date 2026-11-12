import React, { useMemo } from 'react';
import { FilingItem } from '../types';
import { getDaysRemaining } from '../utils/dateUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Building2,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Calendar,
  FileCheck,
  TrendingUp,
} from 'lucide-react';

interface AnalyticsDashboardViewProps {
  filings: FilingItem[];
  onOpenDetail?: (filing: FilingItem) => void;
}

const JURISDICTION_COLORS = ['#0f172a', '#2563eb', '#d97706', '#059669', '#7c3aed', '#db2777'];
const IP_TYPE_COLORS: Record<string, string> = {
  Trademark: '#2563eb',
  Patent: '#059669',
  'Industrial Design': '#d97706',
  Copyright: '#7c3aed',
};
const STAGE_LABELS: Record<string, string> = {
  new_instruction: 'New Instruction',
  drafting: 'Drafting',
  office_action: 'Office Action',
  hearing_opposition: 'Hearing/Opposition',
  registered: 'Registered',
};

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  filings,
  onOpenDetail,
}) => {
  // 1. KPI Calculations
  const stats = useMemo(() => {
    const total = filings.length;
    const completed = filings.filter((f) => f.completed).length;
    const active = total - completed;
    const urgent48h = filings.filter((f) => !f.completed && getDaysRemaining(f.dueDate) <= 2).length;
    const overdue = filings.filter((f) => !f.completed && getDaysRemaining(f.dueDate) < 0).length;

    return { total, completed, active, urgent48h, overdue };
  }, [filings]);

  // 2. Distribution by Jurisdiction
  const jurisdictionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filings.forEach((f) => {
      // simplify registry name for clean chart labels
      let name = f.jurisdiction || 'Other / Unassigned';
      if (name.includes('Karachi')) name = 'IPO Karachi';
      else if (name.includes('Lahore')) name = 'IPO Lahore';
      else if (name.includes('Islamabad')) name = 'IPO Islamabad';
      else if (name.includes('Patent Office')) name = 'Patent Office';
      else if (name.includes('Copyright Office')) name = 'Copyright Office';
      else if (name.includes('Designs Office')) name = 'Designs Office';

      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([jurisdiction, count]) => ({
        jurisdiction,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filings]);

  // 3. Distribution by Nice Class
  const niceClassData = useMemo(() => {
    const counts: Record<string, number> = {};
    filings.forEach((f) => {
      const cls = f.niceClass?.trim() || 'Unclassified';
      counts[cls] = (counts[cls] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([niceClass, count]) => ({
        niceClass,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 classes for clear visualization
  }, [filings]);

  // 4. Distribution by IP Category
  const ipTypeData = useMemo(() => {
    const counts: Record<string, number> = {
      Trademark: 0,
      Patent: 0,
      'Industrial Design': 0,
      Copyright: 0,
    };
    filings.forEach((f) => {
      counts[f.ipType] = (counts[f.ipType] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [filings]);

  // 5. Distribution by Procedural Stage
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {
      new_instruction: 0,
      drafting: 0,
      office_action: 0,
      hearing_opposition: 0,
      registered: 0,
    };
    filings.forEach((f) => {
      if (counts[f.stage] !== undefined) {
        counts[f.stage] += 1;
      }
    });

    return Object.entries(counts).map(([stageKey, count]) => ({
      stage: STAGE_LABELS[stageKey] || stageKey,
      count,
    }));
  }, [filings]);

  // Matters needing immediate action (< 48h)
  const urgent48hList = useMemo(() => {
    return filings
      .filter((f) => !f.completed && getDaysRemaining(f.dueDate) <= 2)
      .sort((a, b) => getDaysRemaining(a.dueDate) - getDaysRemaining(b.dueDate));
  }, [filings]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Brandex Law Association · Executive Analytics</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Filing Distribution & Statutory Docket Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visualization of intellectual property matters across Pakistani & International registries, Nice classes, and procedural stages.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded border border-slate-200 font-mono">
            Active Dataset: <strong>{filings.length} Filings</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500">Total IP Matters</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-700 font-mono">{stats.urgent48h}</div>
            <div className="text-xs font-medium text-slate-500">
              Critical &lt;48h Deadlines
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500">Active Prosecutions</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700 font-mono">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500">Completed / Registered</div>
          </div>
        </div>
      </div>

      {/* Critical 48-Hour Deadline Alert Banner if matters exist */}
      {urgent48hList.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-950">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Attention Required: {urgent48hList.length} Statutory Action{urgent48hList.length === 1 ? '' : 's'} Due Within 48 Hours or Overdue</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {urgent48hList.map((f) => {
              const days = getDaysRemaining(f.dueDate);
              return (
                <div
                  key={f.id}
                  onClick={() => onOpenDetail && onOpenDetail(f)}
                  className="p-2.5 bg-white rounded border border-rose-200 hover:border-rose-400 cursor-pointer transition-colors shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                    <span className="truncate">{f.title}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        days < 0 ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {days < 0 ? `Overdue ${Math.abs(days)}d` : days === 0 ? 'Due Today' : `Due in ${days}d`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>{f.taskType}</span>
                    <span className="font-mono text-slate-500">{f.appNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2 Primary Analytical Charts: Jurisdiction & Nice Class */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribution by Jurisdiction */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Filing Distribution by Registry / Jurisdiction
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">IPO Pakistan Desks</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jurisdictionData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="jurisdiction"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Filings`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {jurisdictionData.map((_, index) => (
                    <Cell
                      key={`jurisdiction-cell-${index}`}
                      fill={JURISDICTION_COLORS[index % JURISDICTION_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-600">
            {jurisdictionData.map((d, i) => (
              <div key={d.jurisdiction} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: JURISDICTION_COLORS[i % JURISDICTION_COLORS.length] }}
                />
                <span className="font-medium text-slate-700">{d.jurisdiction}</span>
                <span className="text-slate-400 font-mono">({d.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Distribution by Nice Class */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Filing Distribution by Nice Class & Classification
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Top Active Classes</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={niceClassData} layout="vertical" margin={{ top: 10, right: 20, left: 25, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="niceClass"
                  type="category"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} Filings`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-1">
            Standard Nice Classification (Goods & Services, 12th Edition) & Patent IPC
          </div>
        </div>
      </div>

      {/* 2 Secondary Analytical Charts: IP Category Breakdown & Procedural Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: IP Category Breakdown (Donut) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">IP Category Portfolio Share</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Trademarks, Patents, Designs</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ipTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ipTypeData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={IP_TYPE_COLORS[entry.name] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} Filings`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-700 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Procedural Stages Breakdown */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-900">Procedural Stages & Funnel</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Statutory Lifecycle</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  interval={0}
                  textAnchor="middle"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Matters`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-1">
            Filing progression from initial WhatsApp instruction through final registration certificate
          </div>
        </div>
      </div>
    </div>
  );
};
