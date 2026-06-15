# Database Schema - Internal Request Management System

## Core Tables

### 1. Users & Authentication
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    department_id INT REFERENCES departments(id),
    manager_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    status ENUM('active', 'inactive', 'suspended'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE,
    head_id INT REFERENCES users(id),
    budget DECIMAL(15, 2),
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE department_managers (
    id SERIAL PRIMARY KEY,
    department_id INT NOT NULL REFERENCES departments(id),
    user_id INT NOT NULL REFERENCES users(id),
    role ENUM('manager', 'head', 'approver'),
    approval_level INT,
    UNIQUE(department_id, user_id, role)
);
```

### 2. Request Management
```sql
CREATE TABLE request_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(30) UNIQUE,
    description TEXT,
    department_id INT NOT NULL REFERENCES departments(id),
    form_schema JSONB,
    requires_attachment BOOLEAN DEFAULT FALSE,
    cost_field BOOLEAN DEFAULT FALSE,
    default_sla_hours INT,
    auto_approve BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    request_type_id INT NOT NULL REFERENCES request_types(id),
    requester_id INT NOT NULL REFERENCES users(id),
    primary_department_id INT NOT NULL REFERENCES departments(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    request_data JSONB,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('draft', 'submitted', 'routing', 'approved', 'rejected', 'completed', 'cancelled'),
    estimated_cost DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    due_date TIMESTAMP,
    completed_date TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_requester (requester_id),
    INDEX idx_department (primary_department_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

CREATE TABLE request_approvals (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    approval_level INT NOT NULL,
    approver_id INT NOT NULL REFERENCES users(id),
    department_id INT NOT NULL REFERENCES departments(id),
    required BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'approved', 'rejected', 'escalated') DEFAULT 'pending',
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    comments TEXT,
    reminder_count INT DEFAULT 0,
    last_reminder TIMESTAMP,
    sla_due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_request (request_id),
    INDEX idx_approver (approver_id),
    INDEX idx_status (status)
);

CREATE TABLE request_comments (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    attachment_urls JSONB,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE request_attachments (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url TEXT,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE request_history (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    action VARCHAR(100),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INT REFERENCES users(id),
    change_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_request (request_id),
    INDEX idx_created (created_at)
);
```

### 3. Workflows & Rules
```sql
CREATE TABLE routing_rules (
    id SERIAL PRIMARY KEY,
    request_type_id INT NOT NULL REFERENCES request_types(id),
    rule_name VARCHAR(100),
    rule_condition JSONB,
    target_department_id INT NOT NULL REFERENCES departments(id),
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_rules (
    id SERIAL PRIMARY KEY,
    request_type_id INT NOT NULL REFERENCES request_types(id),
    approval_level INT NOT NULL,
    department_id INT REFERENCES departments(id),
    required BOOLEAN DEFAULT TRUE,
    condition JSONB,
    sla_hours INT,
    approver_role VARCHAR(50),
    approver_id INT REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE escalation_policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id),
    condition ENUM('sla_breach', 'pending_days', 'priority', 'cost_threshold'),
    condition_value INT,
    escalate_to_id INT NOT NULL REFERENCES users(id),
    notification_method ENUM('email', 'teams', 'both'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auto_approval_rules (
    id SERIAL PRIMARY KEY,
    request_type_id INT NOT NULL REFERENCES request_types(id),
    condition JSONB,
    approval_level INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Tracking & Analytics
```sql
CREATE TABLE sla_tracking (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL UNIQUE REFERENCES requests(id) ON DELETE CASCADE,
    target_completion_date TIMESTAMP NOT NULL,
    breach_date TIMESTAMP,
    is_breached BOOLEAN DEFAULT FALSE,
    breach_department VARCHAR(100),
    warning_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cost_tracking (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(id),
    category VARCHAR(100),
    estimated_cost DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    cost_code VARCHAR(50),
    budget_status ENUM('within_budget', 'over_budget', 'pending'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE department_metrics (
    id SERIAL PRIMARY KEY,
    department_id INT NOT NULL REFERENCES departments(id),
    date_period DATE NOT NULL,
    total_requests INT DEFAULT 0,
    completed_requests INT DEFAULT 0,
    avg_completion_time INT,
    sla_compliance_rate DECIMAL(5, 2),
    employee_satisfaction_score DECIMAL(3, 2),
    bottleneck_approvals INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, date_period)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INT NOT NULL REFERENCES users(id),
    request_id INT REFERENCES requests(id),
    notification_type VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    channel ENUM('email', 'teams', 'in_app'),
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recipient (recipient_id),
    INDEX idx_read (read_at)
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Audit & Compliance
```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(255),
    resource_type VARCHAR(100),
    resource_id INT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);
```

## Key Indexes for Performance

```sql
CREATE INDEX idx_requests_status_dept ON requests(status, primary_department_id);
CREATE INDEX idx_requests_requester_created ON requests(requester_id, created_at);
CREATE INDEX idx_approvals_approver_status ON request_approvals(approver_id, status);
CREATE INDEX idx_approvals_request_level ON request_approvals(request_id, approval_level);
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, read_at);
```

## Views for Common Queries

```sql
-- Active pending requests by department
CREATE VIEW pending_requests_by_dept AS
SELECT 
    d.name as department,
    COUNT(r.id) as pending_count,
    AVG(EXTRACT(DAY FROM NOW() - r.created_at)) as avg_days_pending
FROM requests r
JOIN departments d ON r.primary_department_id = d.id
WHERE r.status = 'approved'
GROUP BY d.id, d.name;

-- SLA compliance dashboard
CREATE VIEW sla_compliance AS
SELECT 
    d.name as department,
    COUNT(CASE WHEN st.is_breached THEN 1 END) as breached,
    COUNT(st.id) as total,
    ROUND(100.0 * (COUNT(st.id) - COUNT(CASE WHEN st.is_breached THEN 1 END)) / COUNT(st.id), 2) as compliance_percentage
FROM sla_tracking st
JOIN requests r ON st.request_id = r.id
JOIN departments d ON r.primary_department_id = d.id
WHERE r.completed_date >= NOW() - INTERVAL '30 days'
GROUP BY d.id, d.name;

-- Approver bottlenecks
CREATE VIEW approver_bottlenecks AS
SELECT 
    u.first_name || ' ' || u.last_name as approver,
    d.name as department,
    COUNT(ra.id) as pending_approvals,
    AVG(EXTRACT(DAY FROM NOW() - ra.created_at)) as avg_pending_days
FROM request_approvals ra
JOIN users u ON ra.approver_id = u.id
JOIN departments d ON ra.department_id = d.id
WHERE ra.status = 'pending'
GROUP BY ra.approver_id, u.first_name, u.last_name, d.id, d.name
HAVING COUNT(ra.id) > 5;
```

## Migration Scripts

### Initial Setup
```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enums
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE request_status AS ENUM ('draft', 'submitted', 'routing', 'approved', 'rejected', 'completed', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');
CREATE TYPE notification_channel AS ENUM ('email', 'teams', 'in_app');
```

### Seed Data
```sql
-- Insert departments
INSERT INTO departments (name, code, budget, status) VALUES
('HR', 'HR', 500000, 'active'),
('Finance', 'FIN', 1000000, 'active'),
('IT', 'IT', 750000, 'active'),
('Legal', 'LEG', 300000, 'active'),
('Procurement', 'PROC', 600000, 'active'),
('Facilities', 'FAC', 400000, 'active'),
('Security', 'SEC', 350000, 'active'),
('Sales', 'SALES', 1200000, 'active'),
('Operations', 'OPS', 800000, 'active'),
('Executive', 'EXEC', 200000, 'active');

-- Insert request types
INSERT INTO request_types (name, code, description, department_id, default_sla_hours, cost_field) VALUES
('Onboarding', 'ONBOARD', 'New employee onboarding', 1, 48, false),
('Equipment Request', 'EQUIP', 'Request for IT equipment', 3, 72, true),
('Travel Approval', 'TRAVEL', 'Travel request approval', 9, 24, true),
('Expense Reimbursement', 'REIMBURSE', 'Expense reimbursement request', 2, 120, true),
('Vendor Procurement', 'VENDOR', 'New vendor or procurement', 5, 168, true),
('Contract Review', 'CONTRACT', 'Legal contract review', 4, 240, true),
('Facilities Issue', 'FACILITIES', 'Facilities maintenance or issue', 6, 48, false),
('Access Card', 'ACCESS', 'Building or security access request', 7, 24, false),
('Discount Approval', 'DISCOUNT', 'Sales discount approval', 8, 4, true),
('Executive Escalation', 'ESCALATION', 'Executive level escalation', 10, 2, false);
```

## Performance Optimization

### Connection Pooling
- Use pgbouncer for connection pooling
- Min pool: 10, Max pool: 50

### Query Optimization
- Use prepared statements
- Add indexes on frequently filtered columns
- Partition large tables (requests, audit_log)

### Caching
- Cache department and role data (TTL: 1 hour)
- Cache approval rules (TTL: 30 minutes)
- Cache request summaries (TTL: 5 minutes)

### Monitoring
- Monitor slow queries (> 1 second)
- Monitor table bloat
- Monitor index health
