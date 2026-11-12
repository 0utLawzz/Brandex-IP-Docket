import React from 'react';
import { FIRM_DETAILS } from '../data/seedData';
import {
  Scale,
  Building,
  Mail,
  Phone,
  Globe,
  FileText,
  ShieldCheck,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const FirmProfileView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Brand & Firm Header Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide">
                <span>ESTABLISHED 1998</span>
                <span aria-hidden="true">·</span>
                <span>PAKISTAN & INTERNATIONAL IP ATTORNEYS</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                {FIRM_DETAILS.name}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Premier Intellectual Property, Patent & Corporate Law Consultants. Representing multinational corporations,
                textile leaders, pharmaceutical manufacturers, and innovators before the Intellectual Property Organization
                of Pakistan (IPO-Pakistan) and High Courts.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 text-xs text-slate-300 bg-slate-800/80 p-3.5 rounded border border-slate-700">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <a
                href="https://brandex.pk"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 underline"
              >
                https://brandex.pk
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>docket@brandex.pk</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>+92 42 3724 8891 / +92 300 8452911</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offices Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FIRM_DETAILS.offices.map((office, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{office.city}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{office.address}</p>
          </div>
        ))}
      </div>

      {/* 2 Column Details: Statutory Timelines & Standard IPO Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IPO Pakistan Statutory Procedural Rules */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Deadlines & Procedural Rules (IPO Pakistan)
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="font-bold text-slate-900">
                1. Examination Report & Official Citations (Form TM-11)
              </div>
              <div className="text-slate-600 mt-1">
                Statutory Response Period: <span className="font-mono font-bold text-rose-700">30 Days</span> from
                date of dispatch of examiner's letter. Non-compliance leads to abandonment under Section 28.
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="font-bold text-slate-900">
                2. Trademark Journal Publication & Oppositions (Form TM-12)
              </div>
              <div className="text-slate-600 mt-1">
                Notice of Opposition must be lodged within <span className="font-mono font-bold text-rose-700">2 Months (60 Days)</span> from
                the publication date in the official Trade Marks Journal. No statutory extension is permissible.
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="font-bold text-slate-900">
                3. Counter-Statement to Opposition (Form TM-13)
              </div>
              <div className="text-slate-600 mt-1">
                Applicant must file counter-statement within <span className="font-mono font-bold text-rose-700">2 Months (60 Days)</span> of
                receiving notice copy from the Registrar. Failure results in deemed abandonment of application.
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="font-bold text-slate-900">
                4. Patent Complete Specification (Form 2)
              </div>
              <div className="text-slate-600 mt-1">
                Complete specification must be filed within <span className="font-mono font-bold text-rose-700">12 Months</span> of
                provisional application date, extendable up to 15 months upon petition Form 4.
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="font-bold text-slate-900">
                5. 10-Year Trademark Renewal (Form TM-16)
              </div>
              <div className="text-slate-600 mt-1">
                Application for renewal can be filed within <span className="font-mono font-bold text-slate-800">6 Months</span> prior
                to registration expiration date. Late renewal permissible within 4 months with surcharge.
              </div>
            </div>
          </div>
        </div>

        {/* Practice Areas and Core Services */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Brandex Law IP Practice Areas & Services
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {FIRM_DETAILS.services.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded border border-slate-150 text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{service}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Statutory Forms Cheat-Sheet</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-1.5 bg-slate-100 rounded text-slate-700">TM-1: Application</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700">TM-11: Reply to Examiner</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700">TM-12: Notice of Opp.</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700">TM-13: Counter Statement</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700">TM-16: Renewal (10 Yrs)</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700">TM-48: Power of Attorney</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
