// Neckarpiraten Governance Tool - Domain Types

// ============ Persons & Families ============

export interface Person {
  id: string;
  email: string;
  name: string;
  phone?: string;
  familyId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  joinedAt: Date;
  leftAt?: Date;
  createdAt: Date;
}

// ============ Circles & Roles ============

export interface Circle {
  id: string;
  name: string;
  purpose?: string;
  parentCircleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  purpose?: string;
  domains: string[];
  accountabilities: string[];
  circleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleAssignment {
  id: string;
  roleId: string;
  personId: string;
  validFrom: Date;
  validUntil?: Date;
  createdAt: Date;
}

// Extended Role with current holder info
export interface RoleWithHolder extends Role {
  holder?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    since: Date;
  };
  circle?: Circle;
}

// ============ Tensions ============

export type TensionStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
export type TensionPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Tension {
  id: string;
  title: string;
  description?: string;
  circleId: string;
  raisedBy: string;
  status: TensionStatus;
  priority: TensionPriority;
  nextAction?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  escalatedTo?: string;
  escalatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TensionWithDetails extends Tension {
  circle?: Circle;
  raisedByPerson?: Person;
  assignedToPerson?: Person;
}

// ============ Meetings ============

export type MeetingType = 'TACTICAL' | 'GOVERNANCE';

export interface Meeting {
  id: string;
  type: MeetingType;
  circleId: string;
  date: Date;
  facilitatorId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeetingAgendaItem {
  id: string;
  meetingId: string;
  tensionId?: string;
  position: number;
  notes?: string;
  createdAt: Date;
}

export interface MeetingWithDetails extends Meeting {
  circle?: Circle;
  facilitator?: Person;
  attendees?: Person[];
  agendaItems?: (MeetingAgendaItem & { tension?: Tension })[];
}

// ============ Checklists ============

export type ChecklistFrequency = 'MEETING' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface ChecklistItem {
  id: string;
  circleId: string;
  title: string;
  description?: string;
  frequency: ChecklistFrequency;
  isActive: boolean;
  createdAt: Date;
}

export interface ChecklistCompletion {
  id: string;
  checklistItemId: string;
  meetingId?: string;
  completedBy: string;
  completedAt: Date;
  notes?: string;
}

// ============ Notifications ============

export type NotificationType =
  | 'ROLE_ASSIGNED'
  | 'ROLE_UNASSIGNED'
  | 'TENSION_CREATED'
  | 'TENSION_ASSIGNED'
  | 'TENSION_RESOLVED';

export interface AppNotification {
  id: string;
  person_id: string;
  type: NotificationType;
  title: string;
  message: string;
  role_id?: string;
  tension_id?: string;
  circle_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// ============ Auth & Permissions ============

export type UserRole = 'member' | 'circleLeader' | 'vorstand' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  personId: string;
}

// ============ UI Helper Types ============

export const TENSION_STATUS_CONFIG = {
  NEW: { label: 'Neu', color: 'bg-[var(--status-new)] text-white' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'bg-[var(--status-in-progress)] text-gray-900' },
  RESOLVED: { label: 'Erledigt', color: 'bg-[var(--status-resolved)] text-white' },
  ESCALATED: { label: 'Eskaliert', color: 'bg-[var(--status-escalated)] text-white' },
} as const;

export const PRIORITY_CONFIG = {
  LOW: { label: 'Niedrig', color: 'text-gray-500' },
  MEDIUM: { label: 'Mittel', color: 'text-yellow-600' },
  HIGH: { label: 'Hoch', color: 'text-red-600' },
} as const;

export const CIRCLE_ICONS = {
  'Anker-Kreis': '⚓',
  'Betrieb': '🏠',
  'Gebäude & Garten': '🔧',
  'Gemeinschaft': '🎉',
  'Finanzen & Ressourcen': '💰',
} as const;
