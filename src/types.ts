export type IPType = 'Trademark' | 'Patent' | 'Copyright' | 'Industrial Design';

export type FilingStage = 
  | 'new_instruction' 
  | 'drafting' 
  | 'office_action' 
  | 'hearing_opposition' 
  | 'registered';

export type PriorityLevel = 'urgent' | 'high' | 'normal';

export type NavigationTab = 'kanban' | 'docket' | 'dashboard' | 'whatsapp' | 'deadlines' | 'profile';

export type ThemeVibe = 'chancery' | 'tech' | 'oxblood' | 'cobalt';

export interface ThemeConfig {
  id: ThemeVibe;
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  canvasBg: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface FilingItem {
  id: string;
  title: string; // Mark name or Invention title
  client: string; // Client/Company name
  ipType: IPType;
  appNumber: string; // e.g. "TM-598412" or "Pending"
  niceClass: string; // e.g. "Class 5" or "Class 9"
  jurisdiction: string; // e.g. "IPO Pakistan (Lahore)"
  taskType: string; // e.g. "TM-11 Reply to Examiner Report"
  stage: FilingStage;
  dueDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
  completed: boolean;
  completedAt?: string;
  notes: string;
  statutoryRef?: string; // e.g. "Section 14(2) Trade Marks Ordinance 2001"
  assignedLawyer: string;
  source: 'whatsapp' | 'manual';
  rawWhatsAppText?: string;
  remindersSent: number;
  lastReminderDate?: string;
  createdAt: string;
  subtasks: Subtask[];
  clientEmail?: string;
}

export interface ReminderRule {
  id: string;
  daysBefore: number;
  label: string;
  target: 'client' | 'lawyer' | 'both';
  enabled: boolean;
}
