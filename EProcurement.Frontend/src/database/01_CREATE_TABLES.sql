-- ============================================================================
-- e-Proposal Management System - Database Schema
-- PostgreSQL 14+
-- Generated: November 10, 2025
-- ============================================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS vendor_recommendations CASCADE;
DROP TABLE IF EXISTS proposal_history CASCADE;
DROP TABLE IF EXISTS proposal_tor_items CASCADE;
DROP TABLE IF EXISTS proposal_ter_items CASCADE;
DROP TABLE IF EXISTS proposal_vendors CASCADE;
DROP TABLE IF EXISTS proposal_documents CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS torter_matrix CASCADE;
DROP TABLE IF EXISTS torter_item_definitions CASCADE;
DROP TABLE IF EXISTS matrix_contract_conditions CASCADE;
DROP TABLE IF EXISTS category_sub_classifications CASCADE;
DROP TABLE IF EXISTS category_classifications CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS approval_matrix CASCADE;
DROP TABLE IF EXISTS vendor_capabilities CASCADE;
DROP TABLE IF EXISTS vendor_contacts CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS work_locations CASCADE;
DROP TABLE IF EXISTS contractual_types CASCADE;
DROP TABLE IF EXISTS contract_types CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS jobsites CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

-- Users Table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Store hashed password (bcrypt)
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(50),
  
  -- Profile
  role VARCHAR(100) NOT NULL,
  jobsite VARCHAR(100),
  department VARCHAR(100),
  
  -- Security
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  last_password_change DATE,
  failed_login_attempts INT DEFAULT 0,
  account_locked_until TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_jobsite ON users(jobsite);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

COMMENT ON TABLE users IS 'System users with authentication and profile information';
COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt (never store plain text)';
COMMENT ON COLUMN users.is_admin IS 'Administrator with super user privileges';

-- ============================================================================
-- 2. ROLES & PERMISSIONS
-- ============================================================================

-- Roles Table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'Creator', 'Approver', 'Sourcing', 'Admin'
  level INT, -- Hierarchy level (1-7)
  
  -- Permissions (JSON for flexibility)
  permissions JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE INDEX idx_roles_code ON roles(code);
CREATE INDEX idx_roles_category ON roles(category);
CREATE INDEX idx_roles_active ON roles(is_active);

COMMENT ON TABLE roles IS 'Role definitions with permissions and hierarchy';

-- User-Role Assignment (Many-to-Many)
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code VARCHAR(50) NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(50),
  
  UNIQUE(user_id, role_code)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_code);

-- ============================================================================
-- 3. SYSTEM REFERENCE DATA
-- ============================================================================

-- Jobsites
CREATE TABLE jobsites (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  abbreviation VARCHAR(10) NOT NULL,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobsites_code ON jobsites(code);
CREATE INDEX idx_jobsites_active ON jobsites(is_active);

COMMENT ON TABLE jobsites IS 'Jobsite locations (e.g., JAHO, ADMO MINING, SERA)';

-- Departments
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  abbreviation VARCHAR(10) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_active ON departments(is_active);

COMMENT ON TABLE departments IS 'Organizational departments (e.g., Plant, IT, Logistic)';

-- Work Locations
CREATE TABLE work_locations (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  jobsite_code VARCHAR(50) REFERENCES jobsites(code),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_locations_code ON work_locations(code);
CREATE INDEX idx_work_locations_jobsite ON work_locations(jobsite_code);

-- Contract Types
CREATE TABLE contract_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contract_types_code ON contract_types(code);

COMMENT ON TABLE contract_types IS 'Contract types (e.g., Tender, Single Vendor, Non-Contractual)';

-- Contractual Sub-Types
CREATE TABLE contractual_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  contract_type_code VARCHAR(50) REFERENCES contract_types(code),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contractual_types_code ON contractual_types(code);
CREATE INDEX idx_contractual_types_parent ON contractual_types(contract_type_code);

COMMENT ON TABLE contractual_types IS 'Contractual sub-types (e.g., Open Tender, Sole Agency)';

-- ============================================================================
-- 4. CATEGORY HIERARCHY
-- ============================================================================

-- Categories (Top Level)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_code ON categories(code);
CREATE INDEX idx_categories_active ON categories(is_active);

COMMENT ON TABLE categories IS 'Top-level categories (e.g., Goods, Services, Works)';

-- Classifications (Middle Level)
CREATE TABLE category_classifications (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category_code VARCHAR(50) NOT NULL REFERENCES categories(code) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classifications_code ON category_classifications(code);
CREATE INDEX idx_classifications_category ON category_classifications(category_code);

COMMENT ON TABLE category_classifications IS 'Mid-level classifications under categories';

-- Sub-Classifications (Bottom Level)
CREATE TABLE category_sub_classifications (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  classification_code VARCHAR(50) NOT NULL REFERENCES category_classifications(code) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sub_classifications_code ON category_sub_classifications(code);
CREATE INDEX idx_sub_classifications_classification ON category_sub_classifications(classification_code);

COMMENT ON TABLE category_sub_classifications IS 'Bottom-level sub-classifications';

-- ============================================================================
-- 5. APPROVAL MATRIX
-- ============================================================================

CREATE TABLE approval_matrix (
  id SERIAL PRIMARY KEY,
  
  -- Range criteria
  min_amount DECIMAL(20, 2) NOT NULL,
  max_amount DECIMAL(20, 2),
  
  -- Scope
  department VARCHAR(100), -- NULL = all departments
  jobsite VARCHAR(100),    -- NULL = all jobsites
  
  -- Approval levels (7 levels)
  level_1_role VARCHAR(100), -- Unit Head
  level_2_role VARCHAR(100), -- Section Head
  level_3_role VARCHAR(100), -- Department Head
  level_4_role VARCHAR(100), -- Division Head
  level_5_role VARCHAR(100), -- Director
  level_6_role VARCHAR(100), -- Chief Operation
  level_7_role VARCHAR(100), -- Procurement Division Head
  
  -- Flags
  requires_dept_head BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50),
  
  CONSTRAINT chk_amount_range CHECK (max_amount IS NULL OR max_amount > min_amount)
);

CREATE INDEX idx_approval_matrix_amount ON approval_matrix(min_amount, max_amount);
CREATE INDEX idx_approval_matrix_dept ON approval_matrix(department);
CREATE INDEX idx_approval_matrix_jobsite ON approval_matrix(jobsite);
CREATE INDEX idx_approval_matrix_active ON approval_matrix(is_active);

COMMENT ON TABLE approval_matrix IS 'Dynamic approval routing matrix based on amount and scope';
COMMENT ON COLUMN approval_matrix.max_amount IS 'NULL means unlimited (above threshold)';

-- ============================================================================
-- 6. MATRIX CONTRACT CONDITIONS
-- ============================================================================

CREATE TABLE matrix_contract_conditions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  threshold_type VARCHAR(50), -- 'currency', 'duration', 'manual', etc.
  threshold_value DECIMAL(20, 2),
  threshold_currency VARCHAR(10),
  is_auto_check BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matrix_conditions_code ON matrix_contract_conditions(code);
CREATE INDEX idx_matrix_conditions_active ON matrix_contract_conditions(is_active);

COMMENT ON TABLE matrix_contract_conditions IS 'Conditions for determining contract type (Contractual vs Non-Contractual)';

-- ============================================================================
-- 7. TOR/TER SYSTEM
-- ============================================================================

-- TOR/TER Item Definitions
CREATE TABLE torter_item_definitions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'TOR' or 'TER'
  label VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_type CHECK (type IN ('TOR', 'TER'))
);

CREATE INDEX idx_torter_defs_code ON torter_item_definitions(code);
CREATE INDEX idx_torter_defs_type ON torter_item_definitions(type);

COMMENT ON TABLE torter_item_definitions IS 'Template definitions for TOR/TER items';

-- TOR/TER Matrix (Auto-fill mapping)
CREATE TABLE torter_matrix (
  id SERIAL PRIMARY KEY,
  sub_classification_code VARCHAR(50) NOT NULL REFERENCES category_sub_classifications(code),
  description TEXT,
  
  -- Flags
  show_in_tor BOOLEAN DEFAULT false,
  show_in_ter BOOLEAN DEFAULT false,
  
  -- Item selections (JSONB for flexibility)
  tor_items JSONB DEFAULT '{}', -- {"quality": true, "delivery": true, ...}
  ter_items JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_torter_matrix_subclass ON torter_matrix(sub_classification_code);
CREATE INDEX idx_torter_matrix_active ON torter_matrix(is_active);

COMMENT ON TABLE torter_matrix IS 'Auto-fill mapping: sub-classification → TOR/TER items';

-- ============================================================================
-- 8. VENDOR DATABASE
-- ============================================================================

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  
  -- Company Info
  legal_name VARCHAR(200),
  tax_id VARCHAR(50),
  business_license VARCHAR(100),
  
  -- Contact
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Indonesia',
  phone VARCHAR(50),
  email VARCHAR(200),
  website VARCHAR(200),
  
  -- Business
  business_type VARCHAR(100),
  year_established INT,
  employee_count INT,
  
  -- Certifications (JSONB array)
  certifications JSONB DEFAULT '[]',
  
  -- Status
  vendor_status VARCHAR(50) DEFAULT 'Active',
  risk_level VARCHAR(20), -- 'Low', 'Medium', 'High'
  
  -- Financial
  annual_revenue DECIMAL(20, 2),
  credit_rating VARCHAR(20),
  
  -- Performance metrics
  performance_rating DECIMAL(3, 2), -- 0.00 to 5.00
  total_contracts INT DEFAULT 0,
  
  -- Audit
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE INDEX idx_vendors_code ON vendors(code);
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_status ON vendors(vendor_status);
CREATE INDEX idx_vendors_active ON vendors(is_active);

COMMENT ON TABLE vendors IS 'Vendor master database';

-- Vendor Contacts (Multiple contacts per vendor)
CREATE TABLE vendor_contacts (
  id SERIAL PRIMARY KEY,
  vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  position VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(200),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_contacts_vendor ON vendor_contacts(vendor_id);

-- Vendor Capabilities (Many-to-Many with sub-classifications)
CREATE TABLE vendor_capabilities (
  id SERIAL PRIMARY KEY,
  vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Can link to categories, classifications, or sub-classifications
  category_code VARCHAR(50),
  classification_code VARCHAR(50),
  sub_classification_code VARCHAR(50),
  
  -- Experience
  years_experience INT,
  project_count INT,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_at_least_one_capability CHECK (
    category_code IS NOT NULL OR 
    classification_code IS NOT NULL OR 
    sub_classification_code IS NOT NULL
  )
);

CREATE INDEX idx_vendor_capabilities_vendor ON vendor_capabilities(vendor_id);
CREATE INDEX idx_vendor_capabilities_category ON vendor_capabilities(category_code);
CREATE INDEX idx_vendor_capabilities_classification ON vendor_capabilities(classification_code);
CREATE INDEX idx_vendor_capabilities_subclass ON vendor_capabilities(sub_classification_code);

COMMENT ON TABLE vendor_capabilities IS 'Vendor expertise mapping to category hierarchy';

-- ============================================================================
-- 9. PROPOSALS
-- ============================================================================

CREATE TABLE proposals (
  id VARCHAR(50) PRIMARY KEY,
  
  -- Proposal Numbering
  number INT NOT NULL,
  kode_jobsite VARCHAR(10) NOT NULL,
  nama_departemen VARCHAR(50) NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  full_code VARCHAR(50) UNIQUE NOT NULL, -- 001/40AB/PLANT/XI/2025
  proposal_no VARCHAR(50) UNIQUE NOT NULL, -- Legacy support
  
  -- Basic Information
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Category Selection (Multiple)
  categories JSONB DEFAULT '[]', -- Array of category objects with codes
  classifications JSONB DEFAULT '[]',
  sub_classifications JSONB DEFAULT '[]',
  
  -- Legacy single selection (for backward compatibility)
  category VARCHAR(100),
  classification VARCHAR(100),
  sub_classification VARCHAR(100),
  
  -- Scope
  scope_of_work TEXT,
  procurement_objective TEXT,
  
  -- Location
  jobsite VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  work_location VARCHAR(200),
  
  -- Creator Info
  creator_name VARCHAR(200) NOT NULL,
  creator_id VARCHAR(50) NOT NULL REFERENCES users(id),
  creator_jobsite VARCHAR(100), -- For approval routing
  creator_department VARCHAR(100), -- For approval routing
  
  -- Financial
  estimated_cost DECIMAL(20, 2),
  amount DECIMAL(20, 2),
  currency VARCHAR(10) DEFAULT 'IDR',
  
  -- Contract Details
  contract_type VARCHAR(100),
  contractual_sub_type VARCHAR(100),
  duration_months DECIMAL(5, 2),
  
  -- Funding
  funding_budget BOOLEAN DEFAULT false,
  funding_non_budget BOOLEAN DEFAULT false,
  
  -- Analysis
  analysis TEXT,
  
  -- Matrix Contract Evaluation
  matrix_condition_values JSONB DEFAULT '{}',
  is_transaction_value_exceeded BOOLEAN DEFAULT false,
  is_duration_exceeded BOOLEAN DEFAULT false,
  
  -- Status & Workflow
  status VARCHAR(100) NOT NULL,
  current_approval_level INT,
  
  -- Dates
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_date TIMESTAMP,
  approved_date TIMESTAMP,
  rejected_date TIMESTAMP,
  
  -- Audit
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique numbering per context
  UNIQUE(number, kode_jobsite, nama_departemen, month, year)
);

-- Indexes for proposals
CREATE INDEX idx_proposals_full_code ON proposals(full_code);
CREATE INDEX idx_proposals_creator ON proposals(creator_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_jobsite ON proposals(jobsite);
CREATE INDEX idx_proposals_department ON proposals(department);
CREATE INDEX idx_proposals_created_date ON proposals(created_date);
CREATE INDEX idx_proposals_amount ON proposals(amount);
CREATE INDEX idx_proposals_context ON proposals(kode_jobsite, nama_departemen, month, year);

COMMENT ON TABLE proposals IS 'Proposal master data with dynamic numbering and approval workflow';
COMMENT ON COLUMN proposals.full_code IS 'Format: [Seq]/[Jobsite]/[Dept]/[Month Roman]/[Year]';
COMMENT ON COLUMN proposals.creator_jobsite IS 'Used for approval routing (vs jobsite = work location)';

-- ============================================================================
-- 10. PROPOSAL RELATED TABLES
-- ============================================================================

-- Proposal TOR Items
CREATE TABLE proposal_tor_items (
  id SERIAL PRIMARY KEY,
  proposal_id VARCHAR(50) NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  item_code VARCHAR(50) NOT NULL,
  label VARCHAR(200),
  enabled BOOLEAN DEFAULT false,
  parameter TEXT,
  requirement TEXT,
  description TEXT,
  remarks TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proposal_tor_proposal ON proposal_tor_items(proposal_id);

-- Proposal TER Items
CREATE TABLE proposal_ter_items (
  id SERIAL PRIMARY KEY,
  proposal_id VARCHAR(50) NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  item_code VARCHAR(50) NOT NULL,
  label VARCHAR(200),
  enabled BOOLEAN DEFAULT false,
  parameter TEXT,
  requirement TEXT,
  description TEXT,
  remarks TEXT,
  
  -- File upload support
  uploaded_file_name VARCHAR(255),
  uploaded_file_path VARCHAR(500),
  uploaded_file_type VARCHAR(50),
  uploaded_file_size BIGINT,
  
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proposal_ter_proposal ON proposal_ter_items(proposal_id);

-- Proposal Vendors (Selected vendors for proposal)
CREATE TABLE proposal_vendors (
  id SERIAL PRIMARY KEY,
  proposal_id VARCHAR(50) NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  vendor_id INT REFERENCES vendors(id),
  vendor_name VARCHAR(200) NOT NULL, -- Allow manual entry
  sort_order INT DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(50)
);

CREATE INDEX idx_proposal_vendors_proposal ON proposal_vendors(proposal_id);
CREATE INDEX idx_proposal_vendors_vendor ON proposal_vendors(vendor_id);

COMMENT ON TABLE proposal_vendors IS 'Vendors selected for each proposal';

-- Proposal Documents (Supporting files)
CREATE TABLE proposal_documents (
  id SERIAL PRIMARY KEY,
  proposal_id VARCHAR(50) NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  description TEXT,
  uploaded_by VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proposal_docs_proposal ON proposal_documents(proposal_id);

-- Proposal History (Approval trail)
CREATE TABLE proposal_history (
  id SERIAL PRIMARY KEY,
  proposal_id VARCHAR(50) NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  action VARCHAR(100) NOT NULL,
  by_user VARCHAR(200) NOT NULL,
  by_user_id VARCHAR(50),
  role VARCHAR(200),
  comments TEXT,
  
  -- Additional context
  from_status VARCHAR(100),
  to_status VARCHAR(100),
  approval_level INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proposal_history_proposal ON proposal_history(proposal_id);
CREATE INDEX idx_proposal_history_date ON proposal_history(date);
CREATE INDEX idx_proposal_history_user ON proposal_history(by_user_id);

COMMENT ON TABLE proposal_history IS 'Complete audit trail of all proposal actions';

-- ============================================================================
-- 11. VENDOR RECOMMENDATIONS (Sourcing Team)
-- ============================================================================

CREATE TABLE vendor_recommendations (
  id SERIAL PRIMARY KEY,
  proposal_id VARCHAR(50) NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  
  -- Recommended vendors (JSONB array)
  recommended_vendors JSONB DEFAULT '[]',
  
  -- Sourcing info
  recommendation_notes TEXT,
  recommendation_date TIMESTAMP,
  recommended_by VARCHAR(200),
  recommended_by_id VARCHAR(50) REFERENCES users(id),
  
  -- Approval
  approved_by VARCHAR(200),
  approved_by_id VARCHAR(50) REFERENCES users(id),
  approved_date TIMESTAMP,
  approval_notes TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'Draft',
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(proposal_id)
);

CREATE INDEX idx_vendor_recs_proposal ON vendor_recommendations(proposal_id);
CREATE INDEX idx_vendor_recs_status ON vendor_recommendations(status);
CREATE INDEX idx_vendor_recs_recommender ON vendor_recommendations(recommended_by_id);

COMMENT ON TABLE vendor_recommendations IS 'Vendor recommendations from Sourcing team for proposals';

-- ============================================================================
-- CONSTRAINTS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobsites_updated_at BEFORE UPDATE ON jobsites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_matrix_updated_at BEFORE UPDATE ON approval_matrix
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_recs_updated_at BEFORE UPDATE ON vendor_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Total tables: 31';
  RAISE NOTICE '🔑 Indexes created for optimal performance';
  RAISE NOTICE '⚡ Triggers enabled for auto-updates';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run: 02_INSERT_MASTER_DATA.sql';
  RAISE NOTICE '   2. Run: 03_INSERT_SAMPLE_DATA.sql';
  RAISE NOTICE '   3. Run: 04_CREATE_VIEWS.sql';
END $$;
