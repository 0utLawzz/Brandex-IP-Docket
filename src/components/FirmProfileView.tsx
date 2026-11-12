import React, { useState, useEffect } from 'react';
import { FIRM_DETAILS } from '../data/seedData';
import { FilingItem } from '../types';
import { getDaysRemaining } from '../utils/dateUtils';
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
  Bell,
  BellRing,
  BellOff,
  AlertTriangle,
  ExternalLink,
  Users,
  Award,
} from 'lucide-react';

interface FirmProfileViewProps {
  filings?: FilingItem[];
  onOpenDetail?: (filing: FilingItem) => void;
}

const NOTIFICATION_STORAGE_KEY = 'brandex_browser_notifications_enabled';

export const FirmProfileView: React.FC<FirmProfileViewProps> = ({
  filings = [],
  onOpenDetail,
}) => {
  // Web Notifications API state
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (isSupported) {
      return Notification.permission;
    }
    return 'default';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (!isSupported) return false;
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return stored === 'true' && Notification.permission === 'granted';
  });

  const [notificationStatusMsg, setNotificationStatusMsg] = useState<string | null>(null);

  // Filings within 48 hours
  const filingsWithin48Hours = filings.filter(
    (f) => !f.completed && getDaysRemaining(f.dueDate) <= 2
  );

  // Sync state if browser permission changes
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      if (Notification.permission !== 'granted') {
        setNotificationsEnabled(false);
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
      }
    }
  }, [isSupported]);

  // Handler for toggling browser notifications
  const handleToggleNotifications = async () => {
    if (!isSupported) {
      setNotificationStatusMsg('Web Notifications API is not supported in this browser environment.');
      return;
    }

    if (notificationsEnabled) {
      // User is disabling notifications
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
      setNotificationStatusMsg('48-hour deadline alerts disabled.');
      setTimeout(() => setNotificationStatusMsg(null), 3500);
      return;
    }

    // User is enabling notifications - request permission
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'true');
        setNotificationStatusMsg('Browser notifications enabled! Alerting for deadlines within 48 hours.');

        // Dispatch initial scan notification
        if (filingsWithin48Hours.length > 0) {
          const sample = filingsWithin48Hours[0];
          const days = getDaysRemaining(sample.dueDate);
          const timeText = days < 0 ? `is overdue by ${Math.abs(days)} day(s)` : days === 0 ? 'is due TODAY' : `is due in ${days} day(s)`;

          new Notification('Brandex Law · Statutory Deadline Alert', {
            body: `CRITICAL: "${sample.title}" (${sample.appNumber}) ${timeText}! Total ${filingsWithin48Hours.length} matter(s) require urgent action.`,
            icon: 'https://brandex.pk/favicon.ico',
          });
        } else {
          new Notification('Brandex Law · Notifications Active', {
            body: 'You will receive immediate browser alerts whenever an IPO Pakistan filing deadline is within 48 hours.',
          });
        }
      } else if (result === 'denied') {
        setNotificationsEnabled(false);
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, 'false');
        setNotificationStatusMsg('Permission was denied. Please allow notifications in your browser settings.');
      }
    } catch (e: any) {
      setNotificationStatusMsg(`Failed to enable notifications: ${e?.message || 'Unknown error'}`);
    }

    setTimeout(() => setNotificationStatusMsg(null), 4000);
  };

  // Test notification trigger
  const handleSendTestNotification = () => {
    if (!isSupported) {
      alert('Notifications are not supported in this browser.');
      return;
    }

    if (Notification.permission !== 'granted') {
      handleToggleNotifications();
      return;
    }

    if (filingsWithin48Hours.length > 0) {
      const topMatter = filingsWithin48Hours[0];
      const days = getDaysRemaining(topMatter.dueDate);
      new Notification(`Brandex Law · Urgent Deadline Alert (48h)`, {
        body: `Filing "${topMatter.title}" [${topMatter.appNumber}] - ${topMatter.taskType} is due in ${days} days (${topMatter.dueDate}). Immediate submission required!`,
      });
      setNotificationStatusMsg(`Fired browser alert for "${topMatter.title}"! Check your OS desktop notifications.`);
    } else {
      new Notification('Brandex Law · 48-Hour Deadline Monitor', {
        body: 'Test Successful: All pending trademark and patent deadlines are currently in good order. You will be alerted 48 hours before statutory cutoffs.',
      });
      setNotificationStatusMsg('Test notification sent to browser!');
    }

    setTimeout(() => setNotificationStatusMsg(null), 4000);
  };

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
                <span>ESTABLISHED {FIRM_DETAILS.established}</span>
                <span aria-hidden="true">·</span>
                <span>20+ YEARS OF PREMIER IP EXCELLENCE</span>
                <span aria-hidden="true">·</span>
                <span>PAKISTAN & INTERNATIONAL IP ATTORNEYS</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                {FIRM_DETAILS.name}
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                {FIRM_DETAILS.legalName}
              </p>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {FIRM_DETAILS.experience}. Representing leading domestic brands, multinational corporations,
                pharmaceutical innovators, and textile conglomerates before the Intellectual Property Organization
                of Pakistan (IPO-Pakistan), High Courts, DRAP, SECP, and Customs Border Enforcement.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 text-xs text-slate-300 bg-slate-800/80 p-4 rounded border border-slate-700 min-w-[260px]">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
              Official Registry Desk
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <a
                href={`https://${FIRM_DETAILS.domain}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 underline font-medium"
              >
                https://{FIRM_DETAILS.domain}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{FIRM_DETAILS.docketEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{FIRM_DETAILS.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] pt-1 border-t border-slate-700">
              <span>WhatsApp Direct: {FIRM_DETAILS.whatsappHotline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Web Notifications API Toggle Section (48-Hour Deadline Alert) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                notificationsEnabled
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {notificationsEnabled ? (
                <BellRing className="w-5 h-5 text-emerald-700 animate-pulse" />
              ) : (
                <BellOff className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Automated Browser Deadline Alerts (Web Notifications API)
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    notificationsEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {notificationsEnabled ? 'Active (Monitoring <48h)' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically alerts you via browser notifications when any IPO Pakistan filing, TM-11 reply, or office action deadline is within <strong>48 hours</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Test alert button */}
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Test 48h Alert</span>
            </button>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Status Feedback toast */}
        {notificationStatusMsg && (
          <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{notificationStatusMsg}</span>
          </div>
        )}

        {/* Current 48-Hour Deadline Watchlist */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Current 48-Hour Statutory Deadline Watchlist:</span>
            </span>
            <span className="text-slate-500 font-mono">
              {filingsWithin48Hours.length} matter{filingsWithin48Hours.length === 1 ? '' : 's'} qualifying for &lt;48h alerts
            </span>
          </div>

          {filingsWithin48Hours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {filingsWithin48Hours.map((f) => {
                const days = getDaysRemaining(f.dueDate);
                return (
                  <div
                    key={f.id}
                    className="p-2.5 bg-rose-50/70 border border-rose-200 rounded flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-rose-950 truncate flex items-center gap-1.5">
                        <span>{f.title}</span>
                        <span className="font-mono text-[10px] text-slate-500 font-normal">
                          ({f.appNumber})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        {f.client} · {f.taskType}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          days < 0 ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {days < 0 ? `Overdue ${Math.abs(days)}d` : days === 0 ? 'Due Today' : `In ${days}d`}
                      </span>
                      {onOpenDetail && (
                        <button
                          onClick={() => onOpenDetail(f)}
                          className="text-[11px] text-blue-700 hover:text-blue-900 font-medium underline"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No filings are currently within 48 hours of their statutory cutoffs. All deadlines healthy!</span>
            </div>
          )}
        </div>
      </div>

      {/* Offices Strip from brandex.pk */}
      <div>
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-amber-600" />
          <span>Brandex Law Association · National Chambers & Registry Offices</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FIRM_DETAILS.offices.map((office, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{office.city}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-medium">{office.phone}</span>
              </div>
              <div className="text-[11px] font-semibold text-amber-800">
                {office.role}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{office.address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2 Column Details: Statutory Rules & Complete Brandex Practice Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IPO Pakistan Statutory Procedural Rules */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
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
                date of dispatch of examiner's letter. Non-compliance leads to abandonment under Section 28 of Trade Marks Ordinance 2001.
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
                to registration expiration date. Late renewal permissible within 4 months with statutory surcharge.
              </div>
            </div>
          </div>
        </div>

        {/* Practice Areas from brandex.pk */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Brandex Law Practice Areas & Legal Services (brandex.pk)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {FIRM_DETAILS.services.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-150 text-slate-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{service}</span>
              </div>
            ))}
          </div>

          {/* Statutory Forms Reference */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2">IPO Pakistan Statutory Forms Cheat-Sheet</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">TM-1: Application</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">TM-11: Reply to Examiner</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">TM-12: Notice of Opp.</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">TM-13: Counter Statement</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">TM-16: Renewal (10 Yrs)</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">TM-48: Power of Attorney</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">TM-55: Search Request</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">ID-1: Industrial Design</div>
              <div className="p-1.5 bg-slate-100 rounded text-slate-700 font-semibold">Form 2: Patent Complete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
