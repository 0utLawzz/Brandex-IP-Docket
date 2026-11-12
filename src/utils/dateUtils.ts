import { FilingItem } from '../types';

export const CURRENT_DATE_STR = '2026-11-06';

export function getDaysRemaining(dueDateStr: string): number {
  const current = new Date(CURRENT_DATE_STR + 'T00:00:00');
  const target = new Date(dueDateStr + 'T00:00:00');
  const diffTime = target.getTime() - current.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDueDateBadge(dueDateStr: string, completed: boolean) {
  if (completed) {
    return {
      text: 'Completed',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
      urgent: false,
    };
  }

  const days = getDaysRemaining(dueDateStr);
  if (days < 0) {
    return {
      text: `Overdue by ${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'}`,
      color: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
      dotColor: 'bg-rose-500',
      urgent: true,
    };
  } else if (days === 0) {
    return {
      text: 'Due Today (Statutory Deadline)',
      color: 'bg-red-50 text-red-700 border-red-300 font-semibold',
      dotColor: 'bg-red-500',
      urgent: true,
    };
  } else if (days <= 3) {
    return {
      text: `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
      color: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
      dotColor: 'bg-amber-500',
      urgent: true,
    };
  } else if (days <= 7) {
    return {
      text: `Due in ${days} days`,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
      urgent: false,
    };
  } else {
    return {
      text: `Due in ${days} days (${dueDateStr})`,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      dotColor: 'bg-slate-400',
      urgent: false,
    };
  }
}

export function formatDatePretty(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function generateWhatsAppBossReport(filings: FilingItem[]): string {
  const completedToday = filings.filter(f => f.completed);
  const urgentPending = filings.filter(f => !f.completed && getDaysRemaining(f.dueDate) <= 5);
  const upcomingHearings = filings.filter(f => !f.completed && f.stage === 'hearing_opposition');

  let text = `*BRANDEX LAW ASSOCIATION*\n`;
  text += `*Daily Filing & Docket Status Report*\n`;
  text += `_Date: ${formatDatePretty(CURRENT_DATE_STR)}_\n\n`;

  text += `📊 *SUMMARY OVERVIEW*\n`;
  text += `• Total Active Matters: ${filings.filter(f => !f.completed).length}\n`;
  text += `• Urgent Office Actions (<5 Days): ${urgentPending.length}\n`;
  text += `• Completed / Dispatched: ${completedToday.length}\n\n`;

  if (urgentPending.length > 0) {
    text += `⚠️ *URGENT STATUTORY DEADLINES:*\n`;
    urgentPending.forEach((f, idx) => {
      const days = getDaysRemaining(f.dueDate);
      const dayText = days < 0 ? `🚨 OVERDUE (${Math.abs(days)}d)` : days === 0 ? `🔥 DUE TODAY` : `⏰ ${days} days left`;
      text += `${idx + 1}. *${f.title}* (${f.appNumber}) - ${f.client}\n`;
      text += `   Task: ${f.taskType}\n`;
      text += `   Deadline: ${f.dueDate} [${dayText}]\n`;
      text += `   Forum: ${f.jurisdiction}\n\n`;
    });
  }

  if (upcomingHearings.length > 0) {
    text += `⚖️ *UPCOMING HEARINGS & OPPOSITIONS:*\n`;
    upcomingHearings.forEach((f, idx) => {
      text += `${idx + 1}. *${f.title}* - App #${f.appNumber}\n`;
      text += `   Client: ${f.client} | Date: ${f.dueDate}\n`;
      text += `   Forum: ${f.jurisdiction}\n\n`;
    });
  }

  if (completedToday.length > 0) {
    text += `✅ *RECENTLY COMPLETED WORK:*\n`;
    completedToday.slice(0, 5).forEach((f, idx) => {
      text += `${idx + 1}. *${f.title}* (${f.ipType}) - ${f.taskType} completed.\n`;
    });
    text += `\n`;
  }

  text += `All official challans, filings, and IPO acknowledgments are docketed in the Brandex Law management system.`;
  return text;
}

export function generateClientEmailNotice(filing: FilingItem): { subject: string; body: string } {
  const days = getDaysRemaining(filing.dueDate);
  const urgencyLabel = days <= 3 ? 'URGENT STATUTORY NOTICE' : 'STATUS UPDATE & FILING DEADLINE';

  const subject = `[${urgencyLabel}] ${filing.ipType}: "${filing.title}" (${filing.appNumber}) - Brandex Law Association`;

  const body = `Dear ${filing.client} Management & Legal Team,

Re: ${filing.ipType} Application: "${filing.title}"
Official Docket Reference: ${filing.appNumber}
Forum / Jurisdiction: ${filing.jurisdiction}
Nice Classification: ${filing.niceClass}
Statutory Deadline: ${formatDatePretty(filing.dueDate)} (${days <= 0 ? 'DUE TODAY' : `${days} days remaining`})

We are writing from Brandex Law Association (Advocates, Trademark & Patent Attorneys) regarding the current procedural status of the above-referenced matter.

The Intellectual Property Organization of Pakistan (IPO Pakistan) has issued the following requirement / milestone:
Action Required: ${filing.taskType}
Statutory Reference: ${filing.statutoryRef || 'Trade Marks Ordinance 2001 / Patents Ordinance 2000'}

Details & Instructions:
${filing.notes}

To preserve your legal priority and prevent statutory abandonment or adverse orders, please ensure all required supporting documents, notarized powers of attorney, or formal approvals reach our docket desk at least 48 hours prior to the statutory cutoff date.

If you have already furnished these particulars or require a detailed legal conference, please do not hesitate to contact our IP filing attorneys.

Respectfully submitted,

Docketing & Prosecution Division
BRANDEX LAW ASSOCIATION
Advocates, Trade Marks & Patent Attorneys
Website: https://brandex.pk | Email: docket@brandex.pk
Lahore • Karachi • Islamabad`;

  return { subject, body };
}
