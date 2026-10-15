-- ==============================================================================
-- College Digital Ecosystem: Student Portal Schema (PostgreSQL)
-- ==============================================================================

-- 1. Institutions
CREATE TABLE IF NOT EXISTS institutions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Authentication & Authorization)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id VARCHAR(36) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    program VARCHAR(100) NOT NULL,
    current_year INT NOT NULL,
    current_semester INT NOT NULL,
    section VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    cgpa NUMERIC(4, 2) DEFAULT 0.0,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(255),
    profile_photo_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_dept_sec ON student_profiles(institution_id, department, section);
CREATE INDEX IF NOT EXISTS idx_students_roll ON student_profiles(roll_no);

-- 4. Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    semester INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(100),
    icon VARCHAR(20) DEFAULT '📘',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_dept_sem ON subjects(institution_id, department, semester);

-- 5. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id VARCHAR(36) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    period_number INT NOT NULL,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE, ON_DUTY
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_att_student_date ON attendance_records(student_id, session_date);

-- 6. Timetable Slots
CREATE TABLE IF NOT EXISTS timetable_slots (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(20) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL, -- MONDAY, TUESDAY, etc.
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE SET NULL,
    subject_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    faculty_name VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_tt_dept_sec ON timetable_slots(institution_id, department, semester, section);

-- 7. Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    subject_id VARCHAR(36) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    internal_marks NUMERIC(5, 2),
    external_marks NUMERIC(5, 2),
    total_marks NUMERIC(5, 2) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    credits INT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    exam_session VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_results_student_sem ON exam_results(student_id, semester);

-- 8. Assignments & Submissions
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(36) PRIMARY KEY,
    subject_id VARCHAR(36) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    max_marks INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(36) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_url VARCHAR(500),
    remarks TEXT,
    marks_obtained NUMERIC(5, 2),
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- PENDING, SUBMITTED, GRADED
    CONSTRAINT uq_assignment_student UNIQUE (assignment_id, student_id)
);

-- 9. Projects & Innovation
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    student_id VARCHAR(36) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    description TEXT,
    guide_name VARCHAR(100),
    team_members TEXT,
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'PROPOSED', -- PROPOSED, IN_PROGRESS, SUBMITTED, APPROVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_student ON projects(student_id);

-- 10. Placement Drives & Applications
CREATE TABLE IF NOT EXISTS placement_drives (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    job_role VARCHAR(255) NOT NULL,
    package_lpa VARCHAR(50) NOT NULL,
    min_cgpa NUMERIC(4, 2) DEFAULT 0.0,
    eligible_branches VARCHAR(255),
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS placement_applications (
    id VARCHAR(36) PRIMARY KEY,
    drive_id VARCHAR(36) NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
    student_id VARCHAR(36) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'APPLIED', -- APPLIED, SHORTLISTED, INTERVIEW, OFFERED, REJECTED
    CONSTRAINT uq_drive_student UNIQUE (drive_id, student_id)
);

-- 11. Notices & Notifications
CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(36) PRIMARY KEY,
    institution_id VARCHAR(36) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- ACADEMIC, EXAM, PLACEMENT, GENERAL
    priority VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, HIGH, URGENT
    target_dept VARCHAR(100),
    target_year INT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Service Requests & Fee Records
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    request_type VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_REVIEW, RESOLVED, REJECTED
    resolution_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_records (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DUE', -- PAID, DUE, OVERDUE
    receipt_no VARCHAR(100),
    paid_at TIMESTAMP
);
