# CampusConnect — College Digital Ecosystem (Student Portal)

> **Enterprise Grade, Full-Stack Multi-Tenant College Portal**
> Built with **Java 17 / Spring Boot 3 + Spring Security (JWT) + Spring Data JPA** backend and **React 18 + TypeScript + Vite** frontend.

---

## 🏗️ Architectural Overview

CampusConnect Student Portal provides a comprehensive academic and campus life operating system for college students. Every feature in the UI is backed by secured, tenant-isolated REST APIs and transactional database records.

```
                    ┌──────────────────────────────────────────┐
                    │      React 18 + TypeScript (Vite)        │
                    │   Responsive SaaS UI / Design Tokens     │
                    └────────────────────┬─────────────────────┘
                                         │  JWT Bearer Token
                                         ▼
                    ┌──────────────────────────────────────────┐
                    │      Spring Boot 3.x REST API Layer      │
                    │ Spring Security 6 (Stateless JWT Auth)   │
                    └────────────────────┬─────────────────────┘
                                         │  Spring Data JPA / Hibernate
                                         ▼
                    ┌──────────────────────────────────────────┐
                    │   PostgreSQL / H2 In-Memory DB           │
                    │  Multi-tenant (institution_id) Schema    │
                    └──────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Pages Implemented

| Module | Route | Description & Real-Time Functionality |
| :--- | :--- | :--- |
| **Authentication** | `/login` | Secure student login via Roll No / Email + Password. JWT token issuance and principal validation. |
| **Dashboard** | `/` | Personalized welcome banner, 4 live KPI counters (Attendance, CGPA, Pending Tasks, Exams), semester GPA chart, today's schedule, notices, recent activity feed. |
| **My Profile** | `/profile` | Official student records, editable contact numbers, and **official record correction request workflow** to department office. |
| **Attendance Tracker** | `/attendance` | Real-time percentage, conducted vs. attended counts, shortage alerts (< 75%), subject breakdown, and chronological daily session logs. |
| **Timetable** | `/timetable` | Interactive weekly lecture and lab matrix by time slot, classroom, faculty, and day filter. |
| **Academics & Results** | `/academics` | Published semester SGPA/CGPA history, subject internal/external marksheets, credits earned, and transcript export action. |
| **Examinations** | `/examinations` | Mid and semester examination schedule, seat allotment, and **downloadable hall tickets**. |
| **Assignments** | `/assignments` | Course task list, due date tags, score status, and **online work submission modal** (repo/drive links + remarks). |
| **Study Materials** | `/courses` | Enrolled subjects, faculty guide details, syllabus coverage progress, and resource repositories. |
| **Projects & Innovation**| `/projects` | Capstone project proposals submission modal, guide assignment, team members, repository links, and milestone approvals. |
| **Placements & Careers** | `/placements` | Active company drives, automated eligibility validation based on CGPA and branch, 1-click apply, and application stage tracker. |
| **Fee Payments** | `/fees` | Total fee, paid amounts, dues balance, payment breakdown, and official receipt downloads. |
| **Notices & Circulars** | `/notices` | Targeted official circulars filtered by department and academic year with priority indicators. |
| **Campus Services** | `/services` | Service requests for Bonafide certificates, transcripts, ID card duplicate, library clearance, and tracking. |
| **Messages & Alerts** | `/messages` | In-app notification center with unread count tracking and one-click mark-as-read. |
| **Coding Practice** | `/coding` | Algorithmic problem library with difficulty badges and online judge integration state. |

---

## 🔑 Demo Credentials

| Role | Username / Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `22CS001` or `student@college.edu` | `Password@123` | Full access to authenticated student records (`ROLE_STUDENT`) |

---

## 🛠️ Getting Started on Windows / VS Code

### Prerequisites
- **Java Development Kit (JDK)**: Java 17 or higher
- **Node.js**: v18.0.0 or higher (with `npm`)
- **Maven**: bundled project Maven 3.9.16 (no system-wide install required)

---

### Step 1: Run the Spring Boot Backend

```powershell
# Navigate to backend directory
cd backend

# Run the backend with the project-bundled Maven (uses H2 in-memory DB + seed data)
cd backend
.\mvnw.cmd clean spring-boot:run
```

* Backend will start on: `http://localhost:8080`
* **Swagger / OpenAPI 3 UI**: `http://localhost:8080/swagger-ui.html`
* **OpenAPI Docs**: `http://localhost:8080/v3/api-docs`
* **H2 Database Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:campusconnect_db`, User: `sa`, Password: empty)

---

### Step 2: Run the React TypeScript Frontend

```powershell
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

* Frontend will start on: `http://localhost:5173`
* Open `http://localhost:5173` in your browser and sign in with `22CS001` / `Password@123`.

---

## 🗄️ PostgreSQL / Production Setup

To run against a PostgreSQL or Supabase instance:
1. Set the following environment variables or edit `application-prod.yml`:
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/campusconnect
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=your_password
   ```
2. Execute the DDL migration script located at:
   `backend/src/main/resources/schema-postgres.sql`

---

## 🧪 Automated Testing

### Backend Unit & Security Tests
To execute backend integration tests proving that endpoints reject unauthenticated requests and validate student principals:
```powershell
cd backend
mvn test
```

---

## 🔒 Security & Privacy Features

- **Strict Identity Isolation (Anti-IDOR)**: The student ID is never accepted blindly from client request parameters. It is derived securely on the backend from the cryptographically verified JWT token principal.
- **Tenant Isolation**: Every database entity includes `institution_id` to ensure isolation across multiple campuses.
- **Role Enforcement**: Route-level and API-level protection via Spring Security `@EnableMethodSecurity` and `hasRole('STUDENT')`.
- **Stateless Session**: Scalable stateless architecture using HMAC-SHA256 signed JWT tokens.
