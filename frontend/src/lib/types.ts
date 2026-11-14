export type Role = 'resident' | 'director' | 'quality' | 'sst' | 'management';
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  role_label: string;
  is_superuser: boolean;
}
export interface Project { id: number; code: string; name: string }
export interface Front { id: number; name: string }
export interface Activity { id: number; code: string; name: string; unit: string; planned_quantity: string }
export interface Worker { id: number; name: string; identification: string }
export interface Supply { id: number; name: string; unit: string }
export interface Catalogs { fronts: Front[]; activities: Activity[]; workers: Worker[]; supplies: Supply[] }
export interface ActivityRow { activity: number; quantity: string }
export interface LaborRow { worker: number; hours: string }
export interface SupplyRow { supply: number; quantity: string }
export interface CutForm {
  request_id: string;
  project: number;
  front: number;
  period_start: string;
  period_end: string;
  notes: string;
  activities: ActivityRow[];
  labor: LaborRow[];
  supplies: SupplyRow[];
  version?: number;
  reason?: string;
}
export interface Snapshot {
  project: number;
  project_name: string;
  front: number;
  front_name: string;
  period_start: string;
  period_end: string;
  notes: string;
  status: Cut['status'];
  activities: (ActivityRow & { code: string; name: string; unit: string; planned_quantity: string;
    accumulated_at_save: string; progress_at_save: string })[];
  labor: (LaborRow & { name: string })[];
  supplies: (SupplyRow & { name: string; unit: string })[];
  total_hours: string;
}
export interface Cut {
  request_id: string;
  id: number;
  project: number;
  project_name: string;
  project_code: string;
  front: number;
  front_name: string;
  author_name: string;
  period_start: string;
  period_end: string;
  notes: string;
  status: 'review' | 'approved' | 'observed';
  status_label: string;
  version: number;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
  data: Snapshot;
}
export interface Revision {
  version: number;
  editor_name: string;
  editor_role: string;
  reason: string;
  created_at: string;
  snapshot: Snapshot;
}
