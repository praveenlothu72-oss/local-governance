// TypeScript interfaces for Local Governance Platform data models

export type UserRole = 'Citizen' | 'MLA' | 'Authority' | 'Contractor' | 'Auditor';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  constituency: string | null; // constituency ID
  village: string | null; // village ID
  created_at: string;
}

export interface Constituency {
  id: string;
  name: string;
  district: string;
  state: string;
  total_funds_received: number; // in INR
  financial_year: string;
  created_at: string;
}

export interface Village {
  id: string;
  constituency_id: string;
  name: string;
  population: number;
  created_at: string;
}

export interface FundAllocation {
  id: string;
  constituency_id: string;
  village_id: string;
  category: 'Roads' | 'Water' | 'Schools' | 'Healthcare' | 'Drainage' | 'Streetlights' | 'Other';
  allocated_amount: number; // in INR
  used_amount: number; // in INR
  year: string;
  created_at: string;
}

export type ProjectStatus = 'PENDING' | 'ACCEPTED' | 'UNDER_WORK' | 'COMPLETED' | 'REJECTED';

export interface Project {
  id: string;
  constituency_id: string;
  village_id: string;
  title: string;
  category: 'Roads' | 'Water' | 'Schools' | 'Healthcare' | 'Drainage' | 'Streetlights' | 'Other';
  description: string;
  budget_allocated: number; // in INR
  amount_spent: number; // in INR
  contractor_id: string | null;
  status: ProjectStatus;
  start_date: string | null;
  expected_end_date: string | null;
  actual_end_date: string | null;
  quality_rating: number | null; // 1-5
  rejection_reason: string | null;
  created_at: string;
}

export type ProofType = 'before_photo' | 'progress_photo' | 'after_photo' | 'invoice' | 'completion_certificate';

export interface ProjectProof {
  id: string;
  project_id: string;
  proof_type: ProofType;
  file_url: string;
  description: string;
  uploaded_by: string; // profile_id
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Issue {
  id: string;
  citizen_id: string;
  constituency_id: string;
  village_id: string;
  title: string;
  description: string;
  category: 'Roads' | 'Water' | 'Schools' | 'Healthcare' | 'Drainage' | 'Streetlights' | 'Other';
  location_lat: number;
  location_lng: number;
  photo_url: string | null;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: ProjectStatus; // PENDING -> ACCEPTED -> UNDER_WORK -> COMPLETED / REJECTED
  upvote_count: number;
  escalation_status: 'NORMAL' | 'ESCALATED' | 'RESOLVED';
  rejection_reason: string | null;
  created_at: string;
}

export interface IssueVote {
  id: string;
  issue_id: string;
  citizen_id: string;
  created_at: string;
}

export interface Contractor {
  id: string;
  profile_id: string | null;
  name: string;
  company_name: string;
  phone: string;
  rating: number; // 0.0 - 5.0
  total_projects: number;
  complaints_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string | null;
  issue_id: string | null;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  created_at: string;
}
