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
