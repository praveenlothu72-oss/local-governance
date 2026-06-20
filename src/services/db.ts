import { createClient } from '@supabase/supabase-js';
import type { 
  Constituency, Village, FundAllocation, Project, ProjectProof, 
  Issue, Contractor, Comment, AuditLog, UserRole, Profile, ProjectStatus
} from '../types';

// Read env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// SEED DATA FOR SIMULATION MODE (LOCALSTORAGE)
// ==========================================

const SEED_CONSTITUENCY: Constituency = {
  id: 'indore-constituency-id',
  name: 'Indore-4 Constituency',
  district: 'Indore',
  state: 'Madhya Pradesh',
  total_funds_received: 1000000000, // 100 Crores
  financial_year: '2025-2026',
  created_at: new Date('2025-04-01T08:00:00Z').toISOString()
};

const SEED_VILLAGES: Village[] = [
  { id: 'v-ganga', constituency_id: 'indore-constituency-id', name: 'Ganga Village', population: 4500, created_at: new Date('2025-04-02').toISOString() },
  { id: 'v-narmada', constituency_id: 'indore-constituency-id', name: 'Narmada Village', population: 3200, created_at: new Date('2025-04-02').toISOString() },
  { id: 'v-yamuna', constituency_id: 'indore-constituency-id', name: 'Yamuna Village', population: 5100, created_at: new Date('2025-04-02').toISOString() },
  { id: 'v-godavari', constituency_id: 'indore-constituency-id', name: 'Godavari Village', population: 2800, created_at: new Date('2025-04-02').toISOString() },
  { id: 'v-kaveri', constituency_id: 'indore-constituency-id', name: 'Kaveri Village', population: 3900, created_at: new Date('2025-04-02').toISOString() }
];

const SEED_CONTRACTORS: Contractor[] = [
  { id: 'c-patel', profile_id: 'u-contractor-patel', name: 'Rakesh Patel', company_name: 'Patel Infrastructure', phone: '+91 98270 12345', rating: 4.2, total_projects: 12, complaints_count: 1, created_at: new Date('2025-01-10').toISOString() },
  { id: 'c-sharma', profile_id: 'u-contractor-sharma', name: 'Amit Sharma', company_name: 'Sharma Construction Co.', phone: '+91 99770 67890', rating: 4.8, total_projects: 8, complaints_count: 0, created_at: new Date('2025-02-15').toISOString() },
  { id: 'c-vikas', profile_id: 'u-contractor-vikas', name: 'Sanjay Verma', company_name: 'Vikas Developers Ltd.', phone: '+91 94250 54321', rating: 2.7, total_projects: 15, complaints_count: 6, created_at: new Date('2025-03-20').toISOString() } // Flagged (Low rating & high complaints)
];

const SEED_FUND_ALLOCATIONS: FundAllocation[] = [
  { id: 'f-1', constituency_id: 'indore-constituency-id', village_id: 'v-ganga', category: 'Schools', allocated_amount: 15000000, used_amount: 12000000, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-2', constituency_id: 'indore-constituency-id', village_id: 'v-ganga', category: 'Streetlights', allocated_amount: 3000000, used_amount: 2500000, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-3', constituency_id: 'indore-constituency-id', village_id: 'v-narmada', category: 'Roads', allocated_amount: 20000000, used_amount: 20000000, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-4', constituency_id: 'indore-constituency-id', village_id: 'v-narmada', category: 'Water', allocated_amount: 12000000, used_amount: 11000000, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-5', constituency_id: 'indore-constituency-id', village_id: 'v-yamuna', category: 'Healthcare', allocated_amount: 8000000, used_amount: 4500000, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-6', constituency_id: 'indore-constituency-id', village_id: 'v-yamuna', category: 'Drainage', allocated_amount: 10000000, used_amount: 0, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-7', constituency_id: 'indore-constituency-id', village_id: 'v-godavari', category: 'Drainage', allocated_amount: 9000000, used_amount: 7500000, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-8', constituency_id: 'indore-constituency-id', village_id: 'v-godavari', category: 'Water', allocated_amount: 2000000, used_amount: 1500000, year: '2025-2026', created_at: new Date().toISOString() },
  { id: 'f-9', constituency_id: 'indore-constituency-id', village_id: 'v-kaveri', category: 'Water', allocated_amount: 10000000, used_amount: 15000000, year: '2025-2026', created_at: new Date().toISOString() } // Overspent!
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'p-1',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-narmada',
    title: 'Main Road Asphaltation',
    category: 'Roads',
    description: 'Re-laying and asphaltation of the main access road connecting Narmada village to State Highway 27. Features improved side gutters for monsoon runoff.',
    budget_allocated: 20000000, // 2 Crores
    amount_spent: 20000000,
    contractor_id: 'c-patel',
    status: 'COMPLETED',
    start_date: '2025-05-10',
    expected_end_date: '2025-09-30',
    actual_end_date: '2025-09-28',
    quality_rating: 4,
    rejection_reason: null,
    created_at: new Date('2025-04-15').toISOString()
  },
  {
    id: 'p-2',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-ganga',
    title: 'Village School Expansion',
    category: 'Schools',
    description: 'Construction of 4 new smart classrooms, a science laboratory, and a clean drinking water station at the Ganga Government Primary School.',
    budget_allocated: 15000000, // 1.5 Crores
    amount_spent: 12000000,
    contractor_id: 'c-sharma',
    status: 'COMPLETED',
    start_date: '2025-06-01',
    expected_end_date: '2025-12-15',
    actual_end_date: '2025-12-10',
    quality_rating: 5,
    rejection_reason: null,
    created_at: new Date('2025-04-15').toISOString()
  },
  {
    id: 'p-3',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-kaveri',
    title: 'Drinking Water Pipeline',
    category: 'Water',
    description: 'Setting up a main overhead water storage tank and laying secondary supply pipelines to individual households across Kaveri village.',
    budget_allocated: 10000000, // 1 Crore
    amount_spent: 15000000, // Anomaly: Budget overspent by 50%!
    contractor_id: 'c-vikas',
    status: 'COMPLETED',
    start_date: '2025-05-15',
    expected_end_date: '2025-11-30',
    actual_end_date: '2025-12-12',
    quality_rating: 3,
    rejection_reason: null,
    created_at: new Date('2025-04-15').toISOString()
  },
  {
    id: 'p-4',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-yamuna',
    title: 'Primary Health Center Renovation',
    category: 'Healthcare',
    description: 'Renovation of the existing village clinic, adding emergency beds, maternity care units, and installing a direct solar power backup system.',
    budget_allocated: 8000000, // 80 Lakhs
    amount_spent: 4500000,
    contractor_id: 'c-sharma',
    status: 'UNDER_WORK',
    start_date: '2025-10-01',
    expected_end_date: '2026-03-15', // Anomaly: Delayed (Current is June 2026)
    actual_end_date: null,
    quality_rating: null,
    rejection_reason: null,
    created_at: new Date('2025-08-20').toISOString()
  },
  {
    id: 'p-5',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-godavari',
    title: 'Drainage Canal Construction',
    category: 'Drainage',
    description: 'Excavation and brick lining of the primary village drainage channel to mitigate local waterlogging during the monsoon season.',
    budget_allocated: 9000000, // 90 Lakhs
    amount_spent: 7500000,
    contractor_id: 'c-vikas',
    status: 'COMPLETED',
    start_date: '2025-05-01',
    expected_end_date: '2025-10-15',
    actual_end_date: '2025-10-10',
    quality_rating: 2, // Anomaly: Low citizen/inspector quality rating!
    rejection_reason: null,
    created_at: new Date('2025-04-15').toISOString()
  },
  {
    id: 'p-6',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-ganga',
    title: 'Solar Streetlight Installation',
    category: 'Streetlights',
    description: 'Installation of 120 smart solar-powered LED streetlights equipped with auto-dimming sensors along all primary paths in Ganga village.',
    budget_allocated: 3000000, // 30 Lakhs
    amount_spent: 2500000,
    contractor_id: 'c-patel',
    status: 'COMPLETED',
    start_date: '2025-07-01',
    expected_end_date: '2025-10-31',
    actual_end_date: '2025-10-25',
    quality_rating: 5,
    rejection_reason: null,
    created_at: new Date('2025-05-10').toISOString()
  },
  {
    id: 'p-7',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-narmada',
    title: 'Smart Classroom Setup',
    category: 'Schools',
    description: 'Implementing projector systems, computers, and digital libraries across 3 village high schools.',
    budget_allocated: 3500000,
    amount_spent: 1500000,
    contractor_id: 'c-sharma',
    status: 'UNDER_WORK',
    start_date: '2026-02-01',
    expected_end_date: '2026-08-30',
    actual_end_date: null,
    quality_rating: null,
    rejection_reason: null,
    created_at: new Date('2026-01-10').toISOString()
  },
  {
    id: 'p-8',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-yamuna',
    title: 'Sewer Line Upgrades',
    category: 'Drainage',
    description: 'Upgrading village pipes to high-density polyethylene pipelines to prevent underground leaks.',
    budget_allocated: 10000000,
    amount_spent: 0,
    contractor_id: 'c-patel',
    status: 'PENDING',
    start_date: null,
    expected_end_date: null,
    actual_end_date: null,
    quality_rating: null,
    rejection_reason: null,
    created_at: new Date('2026-05-01').toISOString()
  },
  {
    id: 'p-9',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-godavari',
    title: 'Public Park Borewell',
    category: 'Water',
    description: 'Drilling a deep borewell in the village community park to supply clean ground water to park taps.',
    budget_allocated: 2000000,
    amount_spent: 1500000,
    contractor_id: 'c-vikas',
    status: 'COMPLETED',
    start_date: '2025-08-01',
    expected_end_date: '2025-10-15',
    actual_end_date: '2025-10-12',
    quality_rating: 1, // Anomaly: Low contractor rating & quality score
    rejection_reason: null,
    created_at: new Date('2025-07-01').toISOString()
  },
  {
    id: 'p-10',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-narmada',
    title: 'Water Filtration Plant',
    category: 'Water',
    description: 'Setting up a Reverse Osmosis (RO) community water purification plant with a capacity of 10,000 liters per day.',
    budget_allocated: 12000000,
    amount_spent: 11000000,
    contractor_id: 'c-patel',
    status: 'COMPLETED',
    start_date: '2025-05-15',
    expected_end_date: '2025-11-15',
    actual_end_date: '2025-11-12',
    quality_rating: 4,
    rejection_reason: null,
    created_at: new Date('2025-04-20').toISOString()
  }
];

const SEED_PROJECT_PROOFS: ProjectProof[] = [
  {
    id: 'proof-p1-before',
    project_id: 'p-1',
    proof_type: 'before_photo',
    file_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
    description: 'Severe potholes and erosion along the main approach road to Narmada village before project initialization.',
    uploaded_by: 'u-mla-1',
    latitude: 22.7196,
    longitude: 75.8577,
    created_at: new Date('2025-04-15').toISOString()
  },
  {
    id: 'proof-p1-after',
    project_id: 'p-1',
    proof_type: 'after_photo',
    file_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=600&auto=format&fit=crop',
    description: 'Successfully asphalted road segment with brick-lined side gutters completed ahead of timeline.',
    uploaded_by: 'u-contractor-patel',
    latitude: 22.7197,
    longitude: 75.8578,
    created_at: new Date('2025-09-28').toISOString()
  },
  {
    id: 'proof-p1-invoice',
    project_id: 'p-1',
    proof_type: 'invoice',
    file_url: '#mock-invoice-p1', // Represents visual invoice details
    description: 'Invoice #PAT-2025-089 covering materials, bitumen, machinery rental, and labor costs. Total: Rs. 2,00,00,000.',
    uploaded_by: 'u-contractor-patel',
    latitude: null,
    longitude: null,
    created_at: new Date('2025-09-29').toISOString()
  },
  {
    id: 'proof-p2-before',
    project_id: 'p-2',
    proof_type: 'before_photo',
    file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop',
    description: 'Old school building with collapsing plaster and insufficient space for students.',
    uploaded_by: 'u-mla-1',
    latitude: 22.8105,
    longitude: 75.9012,
    created_at: new Date('2025-04-15').toISOString()
  },
  {
    id: 'proof-p2-after',
    project_id: 'p-2',
    proof_type: 'after_photo',
    file_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop',
    description: 'Newly completed double-story academic wing with painted facade, student desks, and ventilation.',
    uploaded_by: 'u-contractor-sharma',
    latitude: 22.8106,
    longitude: 75.9013,
    created_at: new Date('2025-12-10').toISOString()
  },
  {
    id: 'proof-p3-before',
    project_id: 'p-3',
    proof_type: 'before_photo',
    file_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop',
    description: 'Dry community well where villagers had to stand in long queues daily for water.',
    uploaded_by: 'u-mla-1',
    latitude: 22.6504,
    longitude: 75.7201,
    created_at: new Date('2025-04-15').toISOString()
  },
  {
    id: 'proof-p3-after',
    project_id: 'p-3',
    proof_type: 'after_photo',
    file_url: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?q=80&w=600&auto=format&fit=crop',
    description: 'Completed 1,00,000-liter overhead storage tank providing pressurized flow to households.',
    uploaded_by: 'u-contractor-vikas',
    latitude: 22.6505,
    longitude: 75.7202,
    created_at: new Date('2025-12-12').toISOString()
  }
];

const SEED_ISSUES: Issue[] = [
  {
    id: 'i-1',
    citizen_id: 'u-citizen-1',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-narmada',
    title: 'Main Road Water Logging',
    description: 'Every time it rains, water pools outside the village clinic because there are no drain holes. It is blocking patient access and breeding mosquitoes.',
    category: 'Drainage',
    location_lat: 22.7199,
    location_lng: 75.8580,
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
    urgency: 'HIGH',
    status: 'ACCEPTED',
    upvote_count: 3,
    escalation_status: 'NORMAL',
    rejection_reason: null,
    created_at: new Date('2026-05-15T10:00:00Z').toISOString()
  },
  {
    id: 'i-2',
    citizen_id: 'u-citizen-2',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-ganga',
    title: 'Unsafe Drinking Water Color',
    description: 'The tap water supplied from the river intake is appearing yellow and brown. Over 15 children have fallen sick with stomach bugs in the past week.',
    category: 'Water',
    location_lat: 22.8110,
    location_lng: 75.9020,
    photo_url: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=600&auto=format&fit=crop',
    urgency: 'CRITICAL',
    upvote_count: 12, // Escaped threshold (>= 5)
    escalation_status: 'ESCALATED',
    status: 'UNDER_WORK',
    rejection_reason: null,
    created_at: new Date('2026-05-20T11:30:00Z').toISOString()
  },
  {
    id: 'i-3',
    citizen_id: 'u-citizen-3',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-kaveri',
    title: 'Primary School Roof Leaking',
    description: 'The ceiling of Classroom 3 is dripping rainwater directly onto the electric wiring. We had to move kids to the hallway.',
    category: 'Schools',
    location_lat: 22.6508,
    location_lng: 75.7208,
    photo_url: 'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?q=80&w=600&auto=format&fit=crop',
    urgency: 'HIGH',
    status: 'PENDING',
    upvote_count: 4,
    escalation_status: 'NORMAL',
    rejection_reason: null,
    created_at: new Date('2026-06-01T09:00:00Z').toISOString()
  },
  {
    id: 'i-4',
    citizen_id: 'u-citizen-4',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-godavari',
    title: 'Frequent Power Cuts & Broken Streetlights',
    description: 'Streetlights along the main village square have been broken for 3 months. It gets pitch dark at night and women feel unsafe walking back from work.',
    category: 'Streetlights',
    location_lat: 22.7540,
    location_lng: 75.7900,
    photo_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=600&auto=format&fit=crop',
    urgency: 'MEDIUM',
    status: 'PENDING',
    upvote_count: 2,
    escalation_status: 'NORMAL',
    rejection_reason: null,
    created_at: new Date('2026-06-10T14:20:00Z').toISOString()
  },
  {
    id: 'i-5',
    citizen_id: 'u-citizen-1',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-yamuna',
    title: 'Clogged Sewer Pipeline',
    description: 'Black sewer water is overflowing into residential lanes of Sector 2. The stench is unbearable and children are playing right next to it.',
    category: 'Drainage',
    location_lat: 22.6901,
    location_lng: 75.8111,
    photo_url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=600&auto=format&fit=crop',
    urgency: 'HIGH',
    status: 'ACCEPTED',
    upvote_count: 8, // Escaped threshold
    escalation_status: 'ESCALATED',
    rejection_reason: null,
    created_at: new Date('2026-06-12T08:10:00Z').toISOString()
  },
  {
    id: 'i-6',
    citizen_id: 'u-citizen-2',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-narmada',
    title: 'Damaged Road near Hospital',
    description: 'The newly asphalted stretch has caved in near the village hospital entrance. Potholes are very deep and ambulances are experiencing delays.',
    category: 'Roads',
    location_lat: 22.7198,
    location_lng: 75.8579,
    photo_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop',
    urgency: 'HIGH',
    status: 'PENDING',
    upvote_count: 1, // Target for demo upvoting and escalation
    escalation_status: 'NORMAL',
    rejection_reason: null,
    created_at: new Date('2026-06-18T16:00:00Z').toISOString()
  },
  {
    id: 'i-7',
    citizen_id: 'u-citizen-3',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-yamuna',
    title: 'Lack of Medicines at Yamuna Clinic',
    description: 'No paracetamol, insulin, or basic bandaging material is available at the clinic since two weeks. Patients are forced to travel 18km to the city.',
    category: 'Healthcare',
    location_lat: 22.6905,
    location_lng: 75.8115,
    photo_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    urgency: 'HIGH',
    status: 'UNDER_WORK',
    upvote_count: 6, // Escaped threshold
    escalation_status: 'ESCALATED',
    rejection_reason: null,
    created_at: new Date('2026-06-15T09:15:00Z').toISOString()
  },
  {
    id: 'i-8',
    citizen_id: 'u-citizen-4',
    constituency_id: 'indore-constituency-id',
    village_id: 'v-ganga',
    title: 'Absence of Dustbins in Market Area',
    description: 'There are no waste bins at the village weekly bazaar. Vegetable waste is piling up on the paths and inviting stray cattle.',
    category: 'Other',
    location_lat: 22.8120,
    location_lng: 75.9030,
    photo_url: null,
    urgency: 'LOW',
    status: 'REJECTED',
    upvote_count: 0,
    escalation_status: 'NORMAL',
    rejection_reason: 'Duplicate complaint, resolved via municipal waste collector updates.',
    created_at: new Date('2026-06-16T12:00:00Z').toISOString()
  }
];

const SEED_COMMENTS: Comment[] = [
  { id: 'com-1', project_id: 'p-1', issue_id: null, user_id: 'u-citizen-1', user_name: 'Amit Patel', comment: 'This is a fantastic improvement! Earlier this road was unusable in monsoon.', created_at: new Date('2025-10-01').toISOString() },
  { id: 'com-2', project_id: 'p-3', issue_id: null, user_id: 'u-citizen-2', user_name: 'Rajesh Solanki', comment: 'The water flow is good but there was a leak in the lane 4 connection yesterday.', created_at: new Date('2025-12-15').toISOString() },
  { id: 'com-3', project_id: 'p-5', issue_id: null, user_id: 'u-citizen-3', user_name: 'Sumitra Sen', comment: 'Quality is very poor! Cement started chipping within three weeks. Contractor Sanjay Verma did not use right materials.', created_at: new Date('2025-10-20').toISOString() },
  { id: 'com-4', project_id: null, issue_id: 'i-2', user_id: 'u-citizen-1', user_name: 'Amit Patel', comment: 'Yes, my children are also sick. This needs urgent correction!', created_at: new Date('2026-05-21').toISOString() },
  { id: 'com-5', project_id: null, issue_id: 'i-6', user_id: 'u-citizen-3', user_name: 'Sumitra Sen', comment: 'I almost fell off my bicycle here. Very dangerous pot hole.', created_at: new Date('2026-06-19').toISOString() }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'a-1', user_id: 'u-mla-1', user_name: 'MLA Praveen Lothu', action: 'ALLOCATED_FUNDS', entity_type: 'fund_allocations', entity_id: 'f-3', old_value: null, new_value: { amount: 20000000, category: 'Roads', village: 'Narmada' }, created_at: new Date('2025-04-10T10:00:00Z').toISOString() },
  { id: 'a-2', user_id: 'u-mla-1', user_name: 'MLA Praveen Lothu', action: 'ASSIGNED_PROJECT', entity_type: 'projects', entity_id: 'p-1', old_value: null, new_value: { contractor: 'Patel Infrastructure', title: 'Main Road Asphaltation' }, created_at: new Date('2025-04-15T11:30:00Z').toISOString() }
];

// Simulated Users
export const SIMULATED_USERS: { id: string; name: string; role: UserRole; constituencyId: string; villageId: string; phone: string }[] = [
  { id: 'u-citizen-1', name: 'Amit Patel (Citizen)', role: 'Citizen', constituencyId: 'indore-constituency-id', villageId: 'v-narmada', phone: '+91 91111 22222' },
  { id: 'u-mla-1', name: 'Praveen Lothu (MLA / Admin)', role: 'MLA', constituencyId: 'indore-constituency-id', villageId: '', phone: '+91 90000 00001' },
  { id: 'u-authority-1', name: 'Divisional Commissioner (Authority)', role: 'Authority', constituencyId: 'indore-constituency-id', villageId: '', phone: '+91 90000 00002' },
  { id: 'u-contractor-patel', name: 'Rakesh Patel (Contractor)', role: 'Contractor', constituencyId: 'indore-constituency-id', villageId: '', phone: '+91 98270 12345' },
  { id: 'u-auditor-1', name: 'State Auditor General (Auditor)', role: 'Auditor', constituencyId: 'indore-constituency-id', villageId: '', phone: '+91 90000 00003' }
];

// Active user tracking in Simulation Mode
let activeUserId = SIMULATED_USERS[0].id; // Default to Amit Patel (Citizen)

// Get state helper
const getStore = <T>(key: string, seed: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch {
    return seed;
  }
};

const saveStore = <T>(key: string, val: T): void => {
  localStorage.setItem(key, JSON.stringify(val));
};

// ==========================================
// DB SERVICE METHODS
// ==========================================

export const db = {
  // Authentication & Session Simulator
  getCurrentUser: async (): Promise<Profile | null> => {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile;
    } else {
      const user = SIMULATED_USERS.find(u => u.id === activeUserId);
      if (!user) return null;
      return {
        id: user.id,
        full_name: user.name,
        role: user.role,
        constituency: user.constituencyId || null,
        village: user.villageId || null,
        created_at: new Date('2026-01-01').toISOString()
      };
    }
  },

  switchSimulatedUser: (userId: string): Profile => {
    const user = SIMULATED_USERS.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    activeUserId = userId;
    return {
      id: user.id,
      full_name: user.name,
      role: user.role,
      constituency: user.constituencyId || null,
      village: user.villageId || null,
      created_at: new Date('2026-01-01').toISOString()
    };
  },

  // Constituency
  getConstituency: async (): Promise<Constituency> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('constituencies')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    } else {
      return getStore('gov_constituency', SEED_CONSTITUENCY);
    }
  },

  // Villages
  getVillages: async (): Promise<Village[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('villages').select('*');
      if (error) throw error;
      return data || [];
    } else {
      return getStore('gov_villages', SEED_VILLAGES);
    }
  },

  // Fund Allocations
  getFundAllocations: async (): Promise<FundAllocation[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('fund_allocations').select('*');
      if (error) throw error;
      return data || [];
    } else {
      return getStore('gov_fund_allocations', SEED_FUND_ALLOCATIONS);
    }
  },

  updateFundAllocation: async (alloc: FundAllocation): Promise<FundAllocation> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('fund_allocations')
        .upsert(alloc)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const allocations = getStore('gov_fund_allocations', SEED_FUND_ALLOCATIONS);
      const idx = allocations.findIndex(a => a.id === alloc.id);
      if (idx > -1) {
        allocations[idx] = alloc;
      } else {
        allocations.push(alloc);
      }
      saveStore('gov_fund_allocations', allocations);
      return alloc;
    }
  },

  // Contractors
  getContractors: async (): Promise<Contractor[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('contractors').select('*');
      if (error) throw error;
      return data || [];
    } else {
      return getStore('gov_contractors', SEED_CONTRACTORS);
    }
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('projects').select('*');
      if (error) throw error;
      return data || [];
    } else {
      return getStore('gov_projects', SEED_PROJECTS);
    }
  },

  createProject: async (project: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    const newProject: Project = {
      ...project,
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('projects')
        .insert(newProject)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const projects = getStore('gov_projects', SEED_PROJECTS);
      projects.push(newProject);
      saveStore('gov_projects', projects);

      // Log Audit
      await db.addAuditLog('CREATED_PROJECT', 'projects', newProject.id, null, newProject);
      return newProject;
    }
  },

  updateProjectStatus: async (projectId: string, status: ProjectStatus, reason?: string): Promise<Project> => {
    if (isSupabaseConfigured) {
      const payload: any = { status };
      if (reason) payload.rejection_reason = reason;
      if (status === 'COMPLETED') payload.actual_end_date = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase!
        .from('projects')
        .update(payload)
        .eq('id', projectId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const projects = getStore('gov_projects', SEED_PROJECTS);
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');
      
      const oldVal = { ...project };
      project.status = status;
      if (reason) project.rejection_reason = reason;
      if (status === 'COMPLETED') project.actual_end_date = new Date().toISOString().split('T')[0];
      saveStore('gov_projects', projects);

      // Log Audit
      await db.addAuditLog('UPDATE_PROJECT_STATUS', 'projects', projectId, oldVal, project);
      return project;
    }
  },

  rateProjectQuality: async (projectId: string, rating: number): Promise<Project> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('projects')
        .update({ quality_rating: rating })
        .eq('id', projectId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const projects = getStore('gov_projects', SEED_PROJECTS);
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Project not found');

      project.quality_rating = rating;
      saveStore('gov_projects', projects);

      // Re-calculate contractor rating
      if (project.contractor_id) {
        const contractors = getStore('gov_contractors', SEED_CONTRACTORS);
        const contractor = contractors.find(c => c.id === project.contractor_id);
        if (contractor) {
          const contractorProjects = projects.filter(p => p.contractor_id === contractor.id && p.quality_rating !== null);
          const totalRating = contractorProjects.reduce((acc, curr) => acc + (curr.quality_rating || 0), 0);
          contractor.rating = parseFloat((totalRating / contractorProjects.length).toFixed(2));
          saveStore('gov_contractors', contractors);
        }
      }
      return project;
    }
  },

  // Project Proofs
  getProjectProofs: async (projectId?: string): Promise<ProjectProof[]> => {
    if (isSupabaseConfigured) {
      let query = supabase!.from('project_proofs').select('*');
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } else {
      const proofs = getStore('gov_project_proofs', SEED_PROJECT_PROOFS);
      return projectId ? proofs.filter(p => p.project_id === projectId) : proofs;
    }
  },

  addProjectProof: async (proof: Omit<ProjectProof, 'id' | 'created_at'>): Promise<ProjectProof> => {
    const newProof: ProjectProof = {
      ...proof,
      id: 'proof-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('project_proofs')
        .insert(newProof)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const proofs = getStore('gov_project_proofs', SEED_PROJECT_PROOFS);
      proofs.push(newProof);
      saveStore('gov_project_proofs', proofs);

      // If proof is a completion certificate, update project status to UNDER_WORK -> COMPLETED (or wait authority approval)
      // In the mock, uploading a completion certificate moves the status to UNDER_WORK -> COMPLETED to mock contractor flow
      if (newProof.proof_type === 'completion_certificate') {
        const projects = getStore('gov_projects', SEED_PROJECTS);
        const proj = projects.find(p => p.id === proof.project_id);
        if (proj) {
          proj.status = 'COMPLETED';
          proj.actual_end_date = new Date().toISOString().split('T')[0];
          saveStore('gov_projects', projects);
        }
      }
      return newProof;
    }
  },

  // Issues
  getIssues: async (): Promise<Issue[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('issues').select('*');
      if (error) throw error;
      return data || [];
    } else {
      return getStore('gov_issues', SEED_ISSUES);
    }
  },

  createIssue: async (issue: Omit<Issue, 'id' | 'created_at' | 'upvote_count' | 'escalation_status' | 'status' | 'rejection_reason'>): Promise<Issue> => {
    const newIssue: Issue = {
      ...issue,
      id: 'i-' + Math.random().toString(36).substr(2, 9),
      status: 'PENDING',
      upvote_count: 0,
      escalation_status: 'NORMAL',
      rejection_reason: null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('issues')
        .insert(newIssue)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const issues = getStore('gov_issues', SEED_ISSUES);
      issues.push(newIssue);
      saveStore('gov_issues', issues);

      // Audit Log
      await db.addAuditLog('RAISED_ISSUE', 'issues', newIssue.id, null, newIssue);
      return newIssue;
    }
  },

  upvoteIssue: async (issueId: string, citizenId: string): Promise<{ success: boolean; upvoteCount: number; escalated: boolean }> => {
    if (isSupabaseConfigured) {
      // Trigger in postgres handles upvote count & escalation automatically.
      // We insert to issue_votes table.
      const { error } = await supabase!
        .from('issue_votes')
        .insert({ issue_id: issueId, citizen_id: citizenId });
      if (error) {
        // If unique constraint violation, already upvoted
        if (error.code === '23505') {
          return { success: false, upvoteCount: 0, escalated: false };
        }
        throw error;
      }
      // Re-fetch issue upvotes
      const { data: issue } = await supabase!
        .from('issues')
        .select('upvote_count, escalation_status')
        .eq('id', issueId)
        .single();
      return {
        success: true,
        upvoteCount: issue?.upvote_count || 0,
        escalated: issue?.escalation_status === 'ESCALATED'
      };
    } else {
      const votesKey = 'gov_issue_votes';
      const votes = getStore<any[]>(votesKey, []);
      const exists = votes.some(v => v.issue_id === issueId && v.citizen_id === citizenId);
      if (exists) {
        return { success: false, upvoteCount: 0, escalated: false };
      }

      votes.push({
        id: 'v-' + Math.random().toString(36).substr(2, 9),
        issue_id: issueId,
        citizen_id: citizenId,
        created_at: new Date().toISOString()
      });
      saveStore(votesKey, votes);

      // Update issue
      const issues = getStore('gov_issues', SEED_ISSUES);
      const issue = issues.find(i => i.id === issueId);
      if (!issue) throw new Error('Issue not found');

      issue.upvote_count = votes.filter(v => v.issue_id === issueId).length;
      
      let escalated = false;
      if (issue.upvote_count >= 5 && issue.escalation_status === 'NORMAL') {
        issue.escalation_status = 'ESCALATED';
        escalated = true;
      }
      saveStore('gov_issues', issues);

      return {
        success: true,
        upvoteCount: issue.upvote_count,
        escalated
      };
    }
  },

  updateIssueStatus: async (issueId: string, status: ProjectStatus, remark?: string, assignedDepartment?: string, allocatedBudget?: number): Promise<Issue> => {
    if (isSupabaseConfigured) {
      const payload: any = { status };
      if (status === 'REJECTED') payload.rejection_reason = remark;
      if (status === 'COMPLETED') payload.escalation_status = 'RESOLVED';
      const { data, error } = await supabase!
        .from('issues')
        .update(payload)
        .eq('id', issueId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const issues = getStore('gov_issues', SEED_ISSUES);
      const issue = issues.find(i => i.id === issueId);
      if (!issue) throw new Error('Issue not found');

      const oldVal = { ...issue };
      issue.status = status;
      if (status === 'REJECTED') issue.rejection_reason = remark || 'Rejected by authority';
      if (status === 'COMPLETED') issue.escalation_status = 'RESOLVED';
      
      saveStore('gov_issues', issues);

      // If accepted, we simulate creating a new project automatically!
      if (status === 'ACCEPTED') {
        const projectTitle = `Issue Resolution: ${issue.title}`;
        await db.createProject({
          constituency_id: issue.constituency_id,
          village_id: issue.village_id,
          title: projectTitle,
          category: issue.category,
          description: `Project launched to address reported citizen issue: ${issue.description}. Assigned department: ${assignedDepartment || 'Municipal Council'}.`,
          budget_allocated: allocatedBudget || 500000,
          amount_spent: 0,
          contractor_id: 'c-patel', // Default assignee for mock
          status: 'ACCEPTED',
          start_date: new Date().toISOString().split('T')[0],
          expected_end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          actual_end_date: null,
          quality_rating: null,
          rejection_reason: null
        });
      }

      // Log Audit
      await db.addAuditLog('UPDATE_ISSUE_STATUS', 'issues', issueId, oldVal, issue);
      return issue;
    }
  },

  // Comments
  getComments: async (entityId: string, type: 'project' | 'issue'): Promise<Comment[]> => {
    if (isSupabaseConfigured) {
      const filterField = type === 'project' ? 'project_id' : 'issue_id';
      const { data, error } = await supabase!
        .from('comments')
        .select('*')
        .eq(filterField, entityId);
      if (error) throw error;
      return data || [];
    } else {
      const comments = getStore('gov_comments', SEED_COMMENTS);
      return comments.filter(c => type === 'project' ? c.project_id === entityId : c.issue_id === entityId);
    }
  },

  addComment: async (comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> => {
    const newComment: Comment = {
      ...comment,
      id: 'com-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('comments')
        .insert(newComment)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const comments = getStore('gov_comments', SEED_COMMENTS);
      comments.push(newComment);
      saveStore('gov_comments', comments);
      return newComment;
    }
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase!.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getStore('gov_audit_logs', SEED_AUDIT_LOGS).reverse();
    }
  },

  addAuditLog: async (action: string, entityType: string, entityId: string, oldVal: any, newVal: any): Promise<AuditLog> => {
    const activeUser = SIMULATED_USERS.find(u => u.id === activeUserId);
    const newLog: AuditLog = {
      id: 'a-' + Math.random().toString(36).substr(2, 9),
      user_id: activeUserId,
      user_name: activeUser ? activeUser.name : 'Unknown User',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldVal,
      new_value: newVal,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase!
        .from('audit_logs')
        .insert({
          user_id: activeUserId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_value: oldVal,
          new_value: newVal
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const logs = getStore('gov_audit_logs', SEED_AUDIT_LOGS);
      logs.push(newLog);
      saveStore('gov_audit_logs', logs);
      return newLog;
    }
  },

  // Reset local storage back to seed data
  resetSimulationData: (): void => {
    localStorage.removeItem('gov_constituency');
    localStorage.removeItem('gov_villages');
    localStorage.removeItem('gov_fund_allocations');
    localStorage.removeItem('gov_projects');
    localStorage.removeItem('gov_project_proofs');
    localStorage.removeItem('gov_issues');
    localStorage.removeItem('gov_issue_votes');
    localStorage.removeItem('gov_comments');
    localStorage.removeItem('gov_audit_logs');
    localStorage.removeItem('gov_contractors');
    
    // Seed fresh copy
    getStore('gov_constituency', SEED_CONSTITUENCY);
    getStore('gov_villages', SEED_VILLAGES);
    getStore('gov_fund_allocations', SEED_FUND_ALLOCATIONS);
    getStore('gov_projects', SEED_PROJECTS);
    getStore('gov_project_proofs', SEED_PROJECT_PROOFS);
    getStore('gov_issues', SEED_ISSUES);
    getStore('gov_comments', SEED_COMMENTS);
    getStore('gov_audit_logs', SEED_AUDIT_LOGS);
    getStore('gov_contractors', SEED_CONTRACTORS);
  }
};
