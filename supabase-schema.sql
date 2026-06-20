-- SQL Schema for Local Governance Platform
-- Target Database: Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONSTITUENCIES
CREATE TABLE constituencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    total_funds_received BIGINT NOT NULL DEFAULT 0,
    financial_year VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. VILLAGES
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    population INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PROFILES (Custom fields synced with Supabase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    aadhaar VARCHAR(12) UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor')),
    constituency UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    village UUID REFERENCES villages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CONTRACTORS
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    total_projects INT DEFAULT 0,
    complaints_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. FUND ALLOCATIONS
CREATE TABLE fund_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
    village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Roads', 'Water', 'Schools', 'Healthcare', 'Drainage', 'Streetlights', 'Other')),
    allocated_amount BIGINT NOT NULL DEFAULT 0,
    used_amount BIGINT NOT NULL DEFAULT 0,
    year VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Roads', 'Water', 'Schools', 'Healthcare', 'Drainage', 'Streetlights', 'Other')),
    description TEXT,
    budget_allocated BIGINT NOT NULL DEFAULT 0,
    amount_spent BIGINT NOT NULL DEFAULT 0,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'UNDER_WORK', 'COMPLETED', 'REJECTED')),
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    quality_rating INT CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. PROJECT PROOFS
CREATE TABLE project_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    proof_type VARCHAR(50) NOT NULL CHECK (proof_type IN ('before_photo', 'progress_photo', 'after_photo', 'invoice', 'completion_certificate')),
    file_url TEXT NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. ISSUES (Citizen reported civic issues)
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    constituency_id UUID REFERENCES constituencies(id) ON DELETE SET NULL,
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Roads', 'Water', 'Schools', 'Healthcare', 'Drainage', 'Streetlights', 'Other')),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    photo_url TEXT,
    urgency VARCHAR(50) NOT NULL CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'UNDER_WORK', 'COMPLETED', 'REJECTED')),
    upvote_count INT NOT NULL DEFAULT 0,
    escalation_status VARCHAR(100) NOT NULL DEFAULT 'NORMAL' CHECK (escalation_status IN ('NORMAL', 'ESCALATED', 'RESOLVED')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. ISSUE VOTES (Enforce one upvote per citizen per issue)
CREATE TABLE issue_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (issue_id, citizen_id)
);

-- 10. COMMENTS
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_target CHECK (
        (project_id IS NOT NULL AND issue_id IS NULL) OR
        (project_id IS NULL AND issue_id IS NOT NULL)
    )
);

-- 11. AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public / Authenticated read policies
CREATE POLICY "Allow public read on constituencies" ON constituencies FOR SELECT USING (true);
CREATE POLICY "Allow public read on villages" ON villages FOR SELECT USING (true);
CREATE POLICY "Allow public read on fund allocations" ON fund_allocations FOR SELECT USING (true);
CREATE POLICY "Allow public read on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read on project proofs" ON project_proofs FOR SELECT USING (true);
CREATE POLICY "Allow public read on issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Allow public read on issue votes" ON issue_votes FOR SELECT USING (true);
CREATE POLICY "Allow public read on contractors" ON contractors FOR SELECT USING (true);
CREATE POLICY "Allow public read on comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Profiles are readable by authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles update policy (Users can edit their own profiles)
CREATE POLICY "Allow profile owners to edit details" ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Issues policies
CREATE POLICY "Citizens can create issues" ON issues FOR INSERT
    WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Citizen can edit their own issues if pending" ON issues FOR UPDATE
    USING (auth.uid() = citizen_id AND status = 'PENDING');

-- Issue voting policies
CREATE POLICY "Citizens can vote" ON issue_votes FOR INSERT
    WITH CHECK (auth.uid() = citizen_id);

-- Comments policies
CREATE POLICY "Authenticated users can post comments" ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Contractor policies (Contractors can upload proof for their assigned projects)
CREATE POLICY "Contractors can insert project proofs" ON project_proofs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            JOIN contractors c ON p.contractor_id = c.id
            WHERE p.id = project_id AND c.profile_id = auth.uid()
        )
    );

-- MLA / Authority / Admin control policies
CREATE POLICY "MLA/Authority can insert projects" ON projects FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('MLA', 'Authority', 'Auditor')
        )
    );

CREATE POLICY "MLA/Authority can update projects" ON projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('MLA', 'Authority', 'Auditor')
        )
    );

CREATE POLICY "MLA/Authority can manage fund allocations" ON fund_allocations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('MLA', 'Authority', 'Auditor')
        )
    );

CREATE POLICY "Authority can update issues" ON issues FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('MLA', 'Authority', 'Auditor')
        )
    );

-- Audit log policies (Admin/Auditor only)
CREATE POLICY "Auditors can read audit logs" ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'Auditor'
        )
    );

CREATE POLICY "System can write audit logs" ON audit_logs FOR INSERT
    WITH CHECK (true);

-- Upvote and auto-escalation trigger function
CREATE OR REPLACE FUNCTION handle_issue_upvote() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update issues upvote count
    UPDATE issues
    SET upvote_count = (SELECT COUNT(*) FROM issue_votes WHERE issue_id = NEW.issue_id)
    WHERE id = NEW.issue_id;

    -- Escalate to authority automatically if upvotes >= 5 (defined threshold)
    UPDATE issues
    SET escalation_status = 'ESCALATED'
    WHERE id = NEW.issue_id AND upvote_count >= 5 AND escalation_status = 'NORMAL';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_issue_upvote
    AFTER INSERT ON issue_votes
    FOR EACH ROW
    EXECUTE FUNCTION handle_issue_upvote();

-- Trigger for syncing Supabase Auth profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, aadhaar, role, constituency, village)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'aadhaar',
        COALESCE(NEW.raw_user_meta_data->>'role', 'Citizen'),
        NULL,
        NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 🚀 MOCK DEMO SEED DATA INSERT QUERIES
-- ==========================================

-- 1. Constituencies
INSERT INTO constituencies (id, name, district, state, total_funds_received, financial_year)
VALUES ('11111111-1111-1111-1111-111111111111', 'Indore-4 Constituency', 'Indore', 'Madhya Pradesh', 1000000000, '2025-2026')
ON CONFLICT (id) DO NOTHING;

-- 2. Villages
INSERT INTO villages (id, constituency_id, name, population) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Ganga Village', 4500),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Narmada Village', 3200),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Yamuna Village', 5100),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Godavari Village', 2800),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Kaveri Village', 3900)
ON CONFLICT (id) DO NOTHING;

-- 3. Contractors (No profile assigned yet)
INSERT INTO contractors (id, profile_id, name, company_name, phone, rating, total_projects, complaints_count) VALUES
('77777777-7777-7777-7777-777777777777', NULL, 'Rakesh Patel', 'Patel Infrastructure', '+91 98270 12345', 4.2, 12, 1),
('88888888-8888-8888-8888-888888888888', NULL, 'Amit Sharma', 'Sharma Construction Co.', '+91 99770 67890', 4.8, 8, 0),
('99999999-9999-9999-9999-999999999999', NULL, 'Sanjay Verma', 'Vikas Developers Ltd.', '+91 94250 54321', 2.7, 15, 6)
ON CONFLICT (id) DO NOTHING;

-- 4. Fund Allocations
INSERT INTO fund_allocations (constituency_id, village_id, category, allocated_amount, used_amount, year) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Schools', 15000000, 12000000, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Streetlights', 3000000, 2500000, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Roads', 20000000, 20000000, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Water', 12000000, 11000000, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Healthcare', 8000000, 4500000, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Drainage', 10000000, 0, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Drainage', 9000000, 7500000, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Water', 2000000, 1500000, '2025-2026'),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Water', 10000000, 15000000, '2025-2026');

-- 5. Projects
INSERT INTO projects (id, constituency_id, village_id, title, category, description, budget_allocated, amount_spent, contractor_id, status, start_date, expected_end_date, actual_end_date, quality_rating) VALUES
('10101010-1010-1010-1010-101010101010', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Main Road Asphaltation', 'Roads', 'Re-laying and asphaltation of the main access road connecting Narmada village to State Highway 27.', 20000000, 20000000, '77777777-7777-7777-7777-777777777777', 'COMPLETED', '2025-05-10', '2025-09-30', '2025-09-28', 4),
('20202020-2020-2020-2020-202020202020', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Village School Expansion', 'Schools', 'Construction of 4 new smart classrooms and a science laboratory at Ganga Primary School.', 15000000, 12000000, '88888888-8888-8888-8888-888888888888', 'COMPLETED', '2025-06-01', '2025-12-15', '2025-12-10', 5),
('30303030-3030-3030-3030-303030303030', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Drinking Water Pipeline', 'Water', 'Setting up overhead water storage tank and laying pipelines to households across Kaveri village.', 10000000, 15000000, '99999999-9999-9999-9999-999999999999', 'COMPLETED', '2025-05-15', '2025-11-30', '2025-12-12', 3),
('40404040-4040-4040-4040-404040404040', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Primary Health Center Renovation', 'Healthcare', 'Renovation of clinic, adding emergency beds and solar power backup.', 8000000, 4500000, '88888888-8888-8888-8888-888888888888', 'UNDER_WORK', '2025-10-01', '2026-03-15', NULL, NULL);

