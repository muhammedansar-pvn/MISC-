# MISC / MARKAZ SANAVIYYA
# CURRENT IMPLEMENTATION STATUS AUDIT
# COMPLETED vs REMAINING REPORT

**Date of Audit:** September 25, 2026  
**Auditor:** Antigravity Engineering Assistant  
**Target Specification:** Sanaviyya Student Development & Management System (Single-Institute Architecture for Markaz Sanaviyya)  
**Primary Source Codebase:** `c:\Users\hp\OneDrive\Desktop\misc`  

---

## 1. Executive Summary

This audit evaluates the current implementation status of the MISC repository against the uploaded **Markaz Sanaviyya Student Development & Management System Specification**.

### Overall Project Status: **PARTIALLY COMPLETED**

The repository contains an established, working foundation developed for the previous multi-institution MISC platform:
- Core JWT authentication with OTP email verification, 2FA, and password setup.
- Basic academic catalog (Academic Years, Classes, Subjects, Syllabuses).
- Board examination module (Exams, Schedules, Registrations, Mark Entry, Results).
- Admin dashboard, user management, and atomic student onboarding (`Admin -> Students -> Register Student`).
- Read-only faculty and student portal shells.

However, the repository **has not yet undergone the architectural migration** to the single-institute Markaz Sanaviyya architecture:
1. **Multi-Institution Tenancy Remains Active:** `INSTITUTION` role, `InstitutionProfile` collections, and `institutionId` scoping remain active in authorization, queries, class indexes, and frontend forms.
2. **Missing Operational Portals:** The Sanaviyya specification requires **6 distinct operational portals** (Student, Parent, Asatitha, HOD, Principal, Admin). Currently, only 3 exists (Admin, Student, Faculty), plus the legacy `/institution` portal. HOD, Principal, and Parent portals are **completely unstarted**.
3. **Missing Core Sanaviyya Modules:** The 7-session daily attendance module, longitudinal student development (5 areas), co-curricular activities tracking, mentor system, early warning at-risk alert system, and principal downloadable reports are **completely unstarted on the backend**, and frontend attendance pages call nonexistent endpoints resulting in 404 responses.

---

## 2. Current Architecture vs Target Architecture

```
CURRENT ARCHITECTURE (Legacy Multi-Institution SaaS):
  Users (ADMIN, INSTITUTION, FACULTY, STUDENT)
    ├── Multi-tenant isolation via institutionId
    ├── /institution/* Portal (Campus Dashboard, Cohort Management)
    ├── /faculty/* Portal (Basic subject & mark entry)
    └── /student/* Portal (Basic profile, exams, transcript)

TARGET ARCHITECTURE (Markaz Sanaviyya Single-Institute SDMS):
  Central Institute Settings (Markaz Sanaviyya)
    ├── Operational Portals:
    │     ├── 1. Student Portal (/student)
    │     ├── 2. Parent Portal (/parent)
    │     ├── 3. Asatitha / Usthad Portal (/asatitha)
    │     ├── 4. HOD Portal (/hod)
    │     ├── 5. Principal Portal (/principal)
    │     └── 6. Admin Portal (/admin)
    └── Core Longitudinal Modules:
          Admission → 7-Session Attendance → Academic → Quran/Language →
          Skills → Discipline → Leadership → Exams → Activities → Final Profile
```

---

## 3. Completed Work (Verified Functional)

The following capabilities are verified implemented, functional, and integrated:

1. **Authentication Core:**
   - Password hashing with `bcryptjs`.
   - JWT token generation & verification (`1d` expiration).
   - OTP generation, hashing (SHA-256), verification, 30s resend cooldown, 5-attempt brute-force protection, 10-minute expiry.
   - Account setup token workflow (`/account-setup/:token`) with transactional activation.
   - Password reset flow via OTP.
   - Rate limiting on auth endpoints (15 req/15m for login, 10 req/10m for OTP).
2. **Canonical Atomic Student Registration:**
   - `POST /api/admin/students/register` creates `User` (`role: "STUDENT"`, `status: "PENDING_SETUP"`) + `StudentProfile` atomically within a MongoDB session/transaction.
   - Auto-generates unique registration numbers formatted as `MISC{YYYY}{0001}`.
   - Dispatches account setup invitation token.
3. **Admin User Management:**
   - List, search, filter, invite, activate, suspend, and soft-delete users.
   - Admin user creation with 2-step OTP verification before dispatching invite link.
4. **Academic Catalog & Framework:**
   - CRUD for Academic Years, Classes, Subjects, and Syllabuses.
5. **Board Examination Management:**
   - Exam definitions, timetables/schedules, student registrations, mark entry draft/submit/verify workflow, and automated GPA/grade result calculation.
6. **Public CMS, Resources & Enquiries:**
   - Article publishing, categorized file downloads, and public contact enquiry processing.
7. **Frontend Build & Types:**
   - Next.js 15.5.25 builds with 0 errors across 56 static pages (`npm run build` exit code 0).
   - TypeScript passes with 0 errors (`npx tsc --noEmit` exit code 0).

---

## 4. Partially Completed Work

1. **Student Registration Workflow:**
   - *Status:* Backend atomic registration works, but still accepts and requires `institutionId` from the frontend selector. Needs removal of institution dropdown and optionality in schema.
2. **Student Portal (`/student`):**
   - *Status:* Shell exists. Student profile, exam schedule, result view, fee history, and transcript exist.
   - *Missing:* 7-session attendance integration (frontend calls missing API), today's timetable, progress card (5 development areas), discipline score, today's tasks, announcements.
3. **Faculty / Asatitha Portal (`/faculty`):**
   - *Status:* Basic shell for viewing assigned classes, subjects, exam schedules, and entering exam marks.
   - *Missing:* Asatitha 7-session attendance marking workflow (`Class -> Date -> Period -> Student list`), Student 360° view, behavior/remarks, leave verification, parent communication, mentor dashboard.
4. **Role Architecture:**
   - *Status:* Role middleware supports arbitrary roles via `requireRole(...)`, but `ROLES` constant and User model only support `ADMIN`, `STUDENT`, `FACULTY`, `INSTITUTION`. `PRINCIPAL`, `HOD`, `ASATITHA`, and `PARENT` do not exist.
5. **Institution Isolation Logic:**
   - *Status:* `enforceInstitutionScope` and `req.user.institutionId` are present in `auth.middleware.js` and controllers (`academic.controller.js`, `student.controller.js`, `exam.controller.js`).

---

## 5. Not Started (0% Implemented)

1. **Parent Portal (`/parent`):** No role, no model, no routes, no pages, no child monitoring or messaging.
2. **HOD Portal (`/hod`):** No role, no department-level dashboard, no teacher/student monitoring, no intervention list.
3. **Principal Portal (`/principal`):** No role, no institution overview dashboard, no academic/attendance analytics, no early warning at-risk student detection.
4. **7-Session Daily Attendance Backend (`/api/attendance/*`):** Zero models, zero controllers, zero routes.
5. **Student Development Module (5 Areas):** Zero models, zero tracking for Academic, Linguistic, Spiritual, Skill, Leadership.
6. **Activities Module (Co-curricular):** Speech, Essay, Debate, Khutba, Qira'ath, etc. tracking (Participation $\rightarrow$ Performance $\rightarrow$ Marks $\rightarrow$ Certificate) does not exist.
7. **Mentor / Usthad Assignment System:** Assigned students monitoring (Normal / Need Attention / Critical) does not exist.
8. **Principal Downloadable Reports:** Daily, monthly, and annual PDF/Excel downloadable reports do not exist.
9. **Central Notification Centre:** Backend notification model, notification preferences, push/in-app alert delivery do not exist.
10. **Central Institute Settings:** Model and admin settings UI for Markaz Sanaviyya do not exist.

---

## 6. Broken / Blocked Areas

1. **Student Attendance Page (`/student/attendance`):**
   - *Issue:* Frontend calls `GET /attendance/student/summary`, `GET /attendance/student/monthly`, and `GET /attendance/student/history`.
   - *Root Cause:* Express API router (`backend/src/routes/index.js`) does NOT mount any attendance module.
   - *Impact:* Student attendance page fails all requests with 404 and displays empty fallbacks.
2. **Class Schema Unique Compound Index:**
   - *Issue:* Compound unique index in `class.model.js` is `{ institutionId: 1, code: 1, academicYearId: 1 }`.
   - *Impact:* Making `institutionId` null without adjusting the index will cause MongoDB `E11000 duplicate key error` on multiple classes with null `institutionId`.
3. **Generic User Creation Form allows Student Creation:**
   - *Issue:* `UserFormModal.jsx` in Admin Users allows selecting `role="STUDENT"`.
   - *Violation:* The Sanaviyya specification strictly forbids generic student creation outside the canonical `Admin -> Students -> Register Student` workflow because it creates a orphaned `User` without a `StudentProfile`.

---

## 7. Authentication Status

| Item | Backend Implementation | Frontend Implementation | Operational Status |
|------|------------------------|-------------------------|--------------------|
| **User Model** | `backend/src/modules/users/user.model.js` | `frontend/src/types/auth.ts` | Functional (Missing new roles) |
| **Active Roles** | `ADMIN`, `STUDENT`, `FACULTY`, `INSTITUTION` | `ADMIN`, `STUDENT`, `FACULTY`, `INSTITUTION` | Active |
| **Target Roles** | `PRINCIPAL`, `HOD`, `ASATITHA`, `PARENT` | `PRINCIPAL`, `HOD`, `ASATITHA`, `PARENT` | **NOT IMPLEMENTED** |
| **Legacy Role** | `INSTITUTION` | `INSTITUTION` | **STILL ACTIVE (Needs migration)** |
| **JWT Generation** | `backend/src/shared/utils/jwt.js` (HS256) | Stored in `localStorage` | Functional |
| **Login Flow** | `POST /api/auth/login` | `/login` form | Functional |
| **2FA Verification** | `POST /api/auth/verify-otp` | `OtpVerificationModalClient.tsx` | Functional |
| **Registration** | `POST /api/auth/register` | `/register` page | Functional |
| **Email Verification** | `POST /api/auth/verify-email-otp` | `/verify-email` page | Functional |
| **Password Setup** | `POST /api/auth/account-setup` | `/account-setup/[token]` page | Functional |
| **Password Reset** | `POST /api/auth/forgot-password` & `reset-password` | `/forgot-password` & `/reset-password` | Functional |
| **Auth Middleware** | `backend/src/middleware/auth.middleware.js` | Axios request/response interceptors | Functional (Contains legacy tenant logic) |
| **Role Middleware** | `backend/src/middleware/role.middleware.js` | `ProtectedRoute.tsx` | Functional |
| **Token Storage** | N/A (Stateless JWT) | `frontend/src/utils/token.ts` | Functional |
| **Logout** | Stateless | `clearAuthStorage()` & redirect | Functional |

---

## 8. Database Models Status

| Model | Exists | Implemented | Relationships | Validation | API Usage | Status |
|---|---|---|---|---|---|---|
| **User** | Yes | Yes | Has many Profiles, Tokens | Joi (Auth/Admin) | `/api/auth/*`, `/api/admin/users/*` | COMPLETED |
| **StudentProfile** | Yes | Yes | `userId`, `classId`, `institutionId` | Joi (`student.validator.js`) | `/api/students/*`, `/api/admin/students/*` | PARTIAL (Has `institutionId`) |
| **FacultyProfile** | Yes | Yes | `userId`, `institutionId` | Joi (`faculty.validator.js`) | `/api/faculty/*` | PARTIAL (Has `institutionId`, lacks Asatitha fields) |
| **ParentProfile** | **No** | **No** | None | None | None | **NOT IMPLEMENTED** |
| **InstitutionProfile**| Yes | Yes | `userId` | Joi | `/api/institutions/*` | LEGACY (To be deprecated) |
| **InstituteSettings**| **No** | **No** | None | None | None | **NOT IMPLEMENTED** |
| **AcademicYear** | Yes | Yes | Referenced by Class, Exam | Joi | `/api/academic/academic-years/*` | COMPLETED |
| **Class** | Yes | Yes | `academicYearId`, `institutionId` (required) | Joi | `/api/academic/classes/*` | PARTIAL (Requires `institutionId`) |
| **Subject** | Yes | Yes | `academicYearId`, `classId` | Joi | `/api/academic/subjects/*` | COMPLETED |
| **Syllabus** | Yes | Yes | `academicYearId`, `classId`, `subjectId` | Joi | `/api/academic/syllabuses/*` | COMPLETED |
| **Attendance** | **No** | **No** | None | None | None | **NOT IMPLEMENTED** |
| **Leave** | **No** | **No** | None | None | None | **NOT IMPLEMENTED** |
| **Exam** | Yes | Yes | `academicYearId` | Joi | `/api/exams/exams/*` | COMPLETED |
| **ExamSchedule** | Yes | Yes | `examId`, `classId`, `subjectId` | Joi | `/api/exams/exam-schedules/*` | COMPLETED |
| **ExamRegistration**| Yes | Yes | `examId`, `studentId`, `institutionId` (required) | Joi | `/api/exams/exam-registrations/*` | PARTIAL (Requires `institutionId`) |
| **MarkEntry** | Yes | Yes | `examId`, `examScheduleId`, `studentId`, `evaluatorId` | Joi | `/api/exams/mark-entries/*` | COMPLETED |
| **ExamResult** | Yes | Yes | `examId`, `studentId`, `classId` | Calculated | `/api/exams/exam-results/*` | COMPLETED |
| **Payment** | Yes | Yes | `userId`, `eventRegistrationId`, `examRegistrationId` | Joi | `/api/payments/*` | COMPLETED |
| **Notification** | **No** | **No** | None | None | None | **NOT IMPLEMENTED** |
| **StudentDevelopment**| **No**| **No** | None | None | None | **NOT IMPLEMENTED** |
| **Activities** | **No** | **No** | (Only Public MISC Event exists, not student activities) | None | None | **NOT IMPLEMENTED** |
| **Discipline** | **No** | **No** | None | None | None | **NOT IMPLEMENTED** |
| **Mentor** | **No** | **No** | None | None | None | **NOT IMPLEMENTED** |

---

## 9. Multi-Institution Migration Status

Repository audit for legacy tenancy strings:

| Keyword / Pattern | Occurrences Found | Location | Classification | Action Required |
|---|---|---|---|---|
| `enforceInstitutionScope` | 2 | `backend/src/middleware/auth.middleware.js` | **Should be removed** | Remove middleware; replace with RBAC checks |
| `req.user.institutionId` | 8 | `auth.middleware.js`, `academic.controller.js`, `student.controller.js`, `faculty.controller.js`, `exam.controller.js` | **Should be removed** | Remove tenant filtering from queries |
| `institutionId` in `class.model.js` | 3 | Schema field & compound unique index | **Migration dependency** | Make field optional; update index to `{ code: 1, academicYearId: 1 }` |
| `institutionId` in `student.model.js` | 2 | Schema field & compound index | **Backward Compatibility** | Make optional; update index to `{ classId: 1 }` |
| `institutionId` in `faculty.model.js` | 1 | Schema field | **Backward Compatibility** | Make optional |
| `institutionId` in `exam-registration.model.js` | 1 | Schema field (`required: true`) | **Migration dependency** | Make optional |
| `INSTITUTION` role in `roles.js` & `user.model.js` | 3 | Role definition & User enum | **Migration dependency** | Keep in enum during transition; migrate users via script |
| `/institution/*` portal | 12 files | `frontend/src/app/(institution)/*` | **Legacy to be removed** | Migrate useful features into Principal/HOD/Admin; remove portal |
| Institution selector dropdown | 3 | Admin Student Registration modal, Admin Exams, Admin Payments | **Should be removed** | Remove dropdown from UI forms |
| `InstitutionProfile` model | 1 | `backend/src/modules/institutions/institution.model.js` | **Migration dependency** | Retain existing records; create `InstituteSettings` |

---

## 10. Admin Backend API Status

| Module | Endpoint | Exists | Controller | Service | Validation | Auth/RBAC | Tested | Status |
|---|---|---|---|---|---|---|---|---|
| **Admin** | `GET /api/admin/stats` | Yes | Yes | Yes | N/A | `ADMIN` | Yes | COMPLETED |
| **Admin** | `GET /api/admin/users` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Admin** | `POST /api/admin/users` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Admin** | `PATCH /api/admin/users/:id/status` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Students** | `POST /api/admin/students/register` | Yes | Yes | Yes | Yes | `ADMIN`, `INSTITUTION` | Yes | PARTIAL (Requires `institutionId`) |
| **Students** | `GET /api/students` | Yes | Yes | Yes | N/A | `ADMIN`, `INSTITUTION` | Yes | COMPLETED |
| **Students** | `GET /api/students/:id` | Yes | Yes | Yes | N/A | `ADMIN`, `INSTITUTION` | Yes | COMPLETED |
| **Students** | `PUT /api/students/:id` | Yes | Yes | Yes | Yes | `ADMIN`, `INSTITUTION` | Yes | COMPLETED |
| **Faculty** | `GET /api/faculty` | Yes | Yes | Yes | N/A | `ADMIN`, `INSTITUTION` | Yes | COMPLETED |
| **Faculty** | `POST /api/faculty` | Yes | Yes | Yes | Yes | `ADMIN`, `INSTITUTION` | Yes | COMPLETED |
| **Faculty** | `PUT /api/faculty/:id` | Yes | Yes | Yes | Yes | `ADMIN`, `INSTITUTION` | Yes | COMPLETED |
| **Academics** | `GET/POST /api/academic/academic-years` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Academics** | `GET/POST /api/academic/classes` | Yes | Yes | Yes | Yes | `ADMIN`, `INSTITUTION` | Yes | PARTIAL (Enforces `institutionId`) |
| **Academics** | `GET/POST /api/academic/subjects` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Academics** | `GET/POST /api/academic/syllabuses` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Exams** | `GET/POST /api/exams/exams` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Exams** | `GET/POST /api/exams/exam-schedules` | Yes | Yes | Yes | Yes | `ADMIN` | Yes | COMPLETED |
| **Exams** | `GET/POST /api/exams/exam-registrations` | Yes | Yes | Yes | Yes | `ADMIN`, `INSTITUTION` | Yes | PARTIAL (Requires `institutionId`) |
| **Exams** | `POST /api/exams/mark-entries` | Yes | Yes | Yes | Yes | `ADMIN`, `FACULTY`, `INSTITUTION` | Yes | COMPLETED |
| **Exams** | `POST /api/exams/exam-results/generate` | Yes | Yes | Yes | N/A | `ADMIN` | Yes | COMPLETED |
| **Payments** | `GET /api/payments` | Yes | Yes | Yes | Yes | `requireAuth` | Yes | COMPLETED |
| **Settings** | `GET/PUT /api/admin/institute-settings` | **No** | **No** | **No** | **No** | None | No | **NOT IMPLEMENTED** |
| **Attendance** | `POST /api/attendance/batch` | **No** | **No** | **No** | **No** | None | No | **NOT IMPLEMENTED** |
| **Development**| `GET/POST /api/student-development/*` | **No** | **No** | **No** | **No** | None | No | **NOT IMPLEMENTED** |
| **Activities** | `GET/POST /api/activities/*` | **No** | **No** | **No** | **No** | None | No | **NOT IMPLEMENTED** |
| **Reports** | `GET /api/reports/principal/*` | **No** | **No** | **No** | **No** | None | No | **NOT IMPLEMENTED** |

---

## 11. Admin Frontend Status

| Page | Route | UI Exists | API Connected | Functional | Status |
|---|---|---|---|---|---|
| **Dashboard** | `/admin` | Yes | Yes (`/admin/stats`) | Yes | COMPLETED |
| **Users** | `/admin/users` | Yes | Yes (`/admin/users`) | Yes | PARTIAL (Allows STUDENT role in modal) |
| **User Details** | `/admin/users/[id]` | Yes | Yes | Yes | COMPLETED |
| **Students Directory** | `/admin/students` | Yes | Yes (`/students`) | Yes | COMPLETED |
| **Register Student Modal** | Modal in `/admin/students` | Yes | Yes (`/admin/students/register`) | Yes | PARTIAL (Shows Campus/Institution dropdown) |
| **Faculty Directory** | `/admin/faculty` | Yes | Yes (`/faculty`) | Yes | COMPLETED |
| **Academic Framework** | `/admin/academic` | Yes | Yes (`/academic/*`) | Yes | COMPLETED |
| **Examinations** | `/admin/exams` | Yes | Yes (`/exams/*`) | Yes | COMPLETED |
| **Exam Results** | `/admin/results` | Yes | Yes (`/exams/exam-results`) | Yes | COMPLETED |
| **Payments & Ledger** | `/admin/payments` | Yes | Yes (`/payments`) | Yes | COMPLETED |
| **CMS Articles** | `/admin/cms` | Yes | Yes (`/cms/articles`) | Yes | COMPLETED |
| **Institutions (Legacy)** | `/admin/institutions` | Yes | Yes (`/institutions`) | Yes | LEGACY (To replace with Institute Settings) |
| **Institute Settings** | `/admin/institute-settings` | **No** | **No** | **No** | **NOT IMPLEMENTED** |
| **Attendance Overview** | `/admin/attendance` | **No** | **No** | **No** | **NOT IMPLEMENTED** |
| **Student Development** | `/admin/student-development`| **No** | **No** | **No** | **NOT IMPLEMENTED** |
| **Activities Management** | `/admin/activities` | **No** | **No** | **No** | **NOT IMPLEMENTED** |
| **Central Notifications** | `/admin/notifications` | **No** | **No** | **No** | **NOT IMPLEMENTED** |
| **Reports Center** | `/admin/reports` | **No** | **No** | **No** | **NOT IMPLEMENTED** |

---

## 12. Student Portal Status

| Specification Requirement | UI Exists | Backend API | Persisted Data | Status |
|---|---|---|---|---|
| **Student Profile (Name, RegNo, DOB)** | Yes | Yes (`/students/profile`) | Yes (`StudentProfile`) | COMPLETED |
| **Extended Profile (House, Mentor, Parent Details)** | No | No | No | **NOT STARTED** |
| **Overall Progress Card** | No | No | No | **NOT STARTED** |
| **Today's Timetable** | No | No | No | **NOT STARTED** |
| **Today's Attendance Status** | No | No | No | **NOT STARTED** |
| **Latest Marks / Continuous Assessment** | Partial | Partial (`/exams/exam-results`) | Yes (Exams only) | PARTIAL |
| **Announcements** | No | No | No | **NOT STARTED** |
| **Today's Tasks / Homework** | No | No | No | **NOT STARTED** |
| **Discipline / Performance Score** | No | No | No | **NOT STARTED** |
| **7-Session Daily Attendance Grid** | Yes (UI layout) | **No** (Returns 404) | No | **BROKEN** |
| **Monthly & Longitudinal Attendance** | Yes (UI layout) | **No** (Returns 404) | No | **BROKEN** |
| **Subject-wise Attendance** | Yes (UI layout) | **No** (Returns 404) | No | **BROKEN** |
| **Leave History & Application** | No | No | No | **NOT STARTED** |
| **5 Development Areas (Academic, Linguistic, Spiritual, Skill, Leadership)** | No | No | No | **NOT STARTED** |
| **Co-Curricular Activities & Achievements** | No | No | No | **NOT STARTED** |
| **Exams, Registrations & Hall Tickets** | Yes | Yes (`/exams/*`) | Yes | COMPLETED |
| **Fee Ledger & Payments** | Yes | Yes (`/payments`) | Yes | COMPLETED |
| **Official Academic Transcript** | Yes | Yes (`/exams/exam-results`) | Yes | COMPLETED |

---

## 13. Asatitha / Faculty Portal Status

| Specification Requirement | Current State in Codebase | Status |
|---|---|---|
| **Dedicated `/asatitha` Portal** | Does not exist (only `/faculty` exists) | **NOT STARTED** |
| **Today's Classes & Timetable** | Not implemented | **NOT STARTED** |
| **Student Count & Today's Metric** | Only static count of total cohort | PARTIAL |
| **Attendance Pending Metric** | Not implemented | **NOT STARTED** |
| **Assignments Pending Metric** | Not implemented | **NOT STARTED** |
| **Daily Tasks Widget** | Not implemented | **NOT STARTED** |
| **Attendance Entry Workflow (`Class -> Date -> Period`)** | Not implemented | **NOT STARTED** |
| **7-Session Automatic Calculation (7/7 = Full Attendance)** | Not implemented | **NOT STARTED** |
| **Student 360° View (All metrics in one screen)** | Not implemented | **NOT STARTED** |
| **Mark Entry for Board Examinations** | Implemented (`/faculty/marks`) | COMPLETED |
| **Continuous Assessment / Internal Marks** | Not implemented | **NOT STARTED** |
| **Assignments & Homework Management** | Not implemented | **NOT STARTED** |
| **Class Notes & Study Materials Sharing** | Partial (static resource upload link) | PARTIAL |
| **Student Behaviour & Teacher Remarks** | Not implemented | **NOT STARTED** |
| **Leave Verification** | Not implemented | **NOT STARTED** |
| **Controlled Parent Communication** | Not implemented | **NOT STARTED** |
| **Mentor Dashboard (Normal / Attention / Critical)** | Not implemented | **NOT STARTED** |

---

## 14. Parent Portal Status

| Specification Requirement | Implementation Status | Detail |
|---|---|---|
| **Parent User Role (`PARENT`)** | **NOT STARTED** | Missing from backend enum and frontend types |
| **Parent Profile Model** | **NOT STARTED** | No parent-to-student relationship schema |
| **Parent Portal (`/parent`)** | **NOT STARTED** | No directory or layout exists in frontend |
| **My Child Dashboard** | **NOT STARTED** | Attendance %, Academic %, Discipline rating missing |
| **Daily 7-Session Attendance View** | **NOT STARTED** | Missing |
| **Leave Application by Parent** | **NOT STARTED** | Missing |
| **Progress Card View** | **NOT STARTED** | Missing |
| **Parent Notifications (Child Absent, Low Attendance)** | **NOT STARTED** | Missing |
| **Controlled Communication (Parent -> Teacher -> HOD)** | **NOT STARTED** | Missing |

---

## 15. HOD Portal Status

| Specification Requirement | Implementation Status | Detail |
|---|---|---|
| **HOD User Role (`HOD`)** | **NOT STARTED** | Missing from backend enum and frontend types |
| **HOD Portal (`/hod`)** | **NOT STARTED** | No directory or layout exists in frontend |
| **Department Dashboard (e.g. Sanaviyya Arabic)** | **NOT STARTED** | Missing |
| **Department Attendance Overview** | **NOT STARTED** | Missing |
| **Students Below 75% Attendance Metric** | **NOT STARTED** | Missing |
| **Teachers with Pending Attendance Submission** | **NOT STARTED** | Missing |
| **Students Requiring Attention / Intervention List** | **NOT STARTED** | Missing |
| **Academic Monitoring (Syllabus progress, Monthly tests)** | **NOT STARTED** | Missing |
| **Teacher Monitoring (Class completion, Submission timing)** | **NOT STARTED** | Missing |
| **HOD Alert System** | **NOT STARTED** | Missing |

---

## 16. Principal Portal Status

| Specification Requirement | Implementation Status | Detail |
|---|---|---|
| **Principal User Role (`PRINCIPAL`)** | **NOT STARTED** | Missing from backend enum and frontend types |
| **Principal Portal (`/principal`)** | **NOT STARTED** | No directory or layout exists in frontend |
| **Institution Overview Dashboard** | **NOT STARTED** | Missing (Total students, teachers, classes, overall attendance) |
| **Academic Analytics (Class, Dept, Subject, Year-to-Year)** | **NOT STARTED** | Missing |
| **Attendance Analytics (Today, Monthly, Department-wise)** | **NOT STARTED** | Missing |
| **Early Warning System (Automated At-Risk Detection)** | **NOT STARTED** | Missing |
| **Downloadable Daily Reports (Attendance, Absentees, Teachers)** | **NOT STARTED** | Missing |
| **Downloadable Monthly Reports (Attendance, Academic, Discipline)**| **NOT STARTED** | Missing |
| **Downloadable Annual Reports (Promotion, Dropout, Exam stats)** | **NOT STARTED** | Missing |
| **PDF & Excel Export Engine** | **NOT STARTED** | Missing |

---

## 17. Student Development & Co-Curricular Status

### Five Development Areas (Academic, Linguistic, Spiritual, Skill, Leadership)
- **Database Model:** NOT IMPLEMENTED (No schema exists)
- **API Endpoints:** NOT IMPLEMENTED (No routes exist)
- **Controller & Service:** NOT IMPLEMENTED
- **Frontend Dashboard / Progress Card:** NOT IMPLEMENTED
- **Data Persistence:** NOT IMPLEMENTED
- *Status:* **NOT STARTED**

### Activities Module (Speech, Essay, Qira'ath, Debate, Khutba, etc.)
- **Co-Curricular Activity Model:** NOT IMPLEMENTED
- **Activity Progression (`Participation -> Performance -> Marks -> Certificate`):** NOT IMPLEMENTED
- **Student Activity History:** NOT IMPLEMENTED
- *Status:* **NOT STARTED**

---

## 18. Notifications, Mentoring & Analytics Status

| Subsystem | Components | Implementation Status |
|---|---|---|
| **Central Notification Centre** | Notification Model, Broadcast API, In-app inbox | **NOT STARTED** |
| **Event Alerts** | Absent notification, Result published, Parent meeting | **NOT STARTED** |
| **Mentor System** | Usthad assigned students, Normal/Attention/Critical categorization | **NOT STARTED** |
| **Early Warning System** | Cross-metric at-risk detection algorithm | **NOT STARTED** |
| **Reporting Engine** | Principal Daily/Monthly/Annual downloadable reports | **NOT STARTED** |

---

## 19. Frontend / Backend Integration Analysis

1. **Broken Attendance Endpoints:**
   - Frontend `attendance.service.ts` requests:
     - `/api/attendance/student/summary`
     - `/api/attendance/student/monthly`
     - `/api/attendance/student/history`
   - Backend `backend/src/routes/index.js` does NOT route `/attendance`.
   - *Verdict:* Broken integration (HTTP 404).
2. **Missing Institute Settings Endpoint:**
   - Frontend components still fetch `/api/institutions` to populate campus selectors.
   - There is no `/api/admin/institute-settings` endpoint for the single Markaz Sanaviyya entity.
3. **Role Redirection Missing Portals:**
   - In `frontend/src/context/AuthContext.tsx`:
     ```ts
     export const getRoleRedirectPath = (role?: string): string => {
       switch (role) {
         case 'ADMIN': return '/admin';
         case 'INSTITUTION': return '/institution/dashboard';
         case 'FACULTY': return '/faculty';
         case 'STUDENT': return '/student';
         default: return '/login';
       }
     };
     ```
   - Redirects for `PRINCIPAL`, `HOD`, `ASATITHA`, and `PARENT` do not exist.
4. **Student Creation Modal Policy Violation:**
   - `frontend/src/components/admin/UserFormModal.jsx` line 476 offers `<option value="STUDENT">Student</option>`.
   - If created here, an orphaned `User` document is created without an associated `StudentProfile`, causing application bugs in student lookups.

---

## 20. Build & Test Verification Status

All checks were executed directly in the project environment:

### Frontend Production Build
```
Command: npm run build (in ./frontend)
Next.js Version: 15.5.25
Result: SUCCESS (Exit Code: 0)
Static Pages Generated: 56/56 compiled cleanly
```

### Frontend TypeScript Compilation
```
Command: npx tsc --noEmit (in ./frontend)
Result: SUCCESS (Exit Code: 0, 0 type errors)
```

### Backend Syntax & Module Load
```
Command: node -e "console.log(require('./src/shared/constants/roles'))" (in ./backend)
Result: SUCCESS (Exit Code: 0)
Loaded roles: ADMIN, STUDENT, FACULTY, INSTITUTION
```

### Automated Backend Tests
- There is **no unit/integration test suite** (no Jest/Mocha configured in `backend/package.json`).
- Script `backend/scripts/testRegisterStudentFlow.js` is a standalone verification script for the atomic student registration flow under multi-tenant isolation.

---

## 21. Master Current Completion Matrix

| Area | Backend | Frontend | Database | Integration | Overall Status |
|---|---|---|---|---|---|
| **Authentication & 2FA** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **COMPLETED** |
| **RBAC (Existing Roles)** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **COMPLETED** |
| **RBAC (Target Roles: Principal, HOD, Asatitha, Parent)** | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | **NOT STARTED** |
| **Single-Institute Architecture** | NOT STARTED | NOT STARTED | NOT STARTED | NOT STARTED | **NOT STARTED** |
| **Admin User Management** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **COMPLETED** |
| **Student Registration (Canonical)** | COMPLETED | COMPLETED | COMPLETED | PARTIAL | **PARTIAL** (Requires institutionId) |
| **Academic Catalog (Classes, Subjects)** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **PARTIAL** (Class has required institutionId) |
| **Board Examinations & Mark Entry** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **COMPLETED** |
| **Exam Results & GPA Generation** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **COMPLETED** |
| **Fee Payments & Ledger** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **COMPLETED** |
| **Student Portal Core** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **PARTIAL** (Missing attendance, development) |
| **7-Session Daily Attendance** | **NOT STARTED** | PARTIAL (UI only) | **NOT STARTED** | **BROKEN** | **BROKEN / INCOMPLETE** |
| **Faculty / Asatitha Portal** | COMPLETED | COMPLETED | COMPLETED | COMPLETED | **PARTIAL** (Basic shell only) |
| **Asatitha Attendance Entry Workflow** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Student 360° View** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Parent Portal** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **HOD Portal** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Principal Portal** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Student Development (5 Areas)** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Co-Curricular Activities** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Central Notifications** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Mentor System** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Principal Downloadable Reports** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |
| **Institute Settings (Single Institute)** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** | **NOT STARTED** |

---

## 22. Immediate Tomorrow Milestone

To deliver a working, demonstration-ready release for the immediate deadline, work must be partitioned strictly into what is critical versus what can be scheduled for subsequent phases.

### MUST COMPLETE BY TOMORROW (Milestone 1 — Operational Core)

1. **Authentication & Roles Foundation:**
   - Update `ROLES` constant and User schema enum to include `ADMIN`, `PRINCIPAL`, `HOD`, `ASATITHA`, `FACULTY`, `STUDENT`, `PARENT`.
   - Update `AuthContext` role redirects for all 6 portals.
2. **Single-Institute Decoupling:**
   - Create `InstituteSettings` model and seed Markaz Sanaviyya metadata.
   - Make `institutionId` optional in `Class`, `StudentProfile`, `FacultyProfile`, `ExamRegistration`.
   - Update `Class` index from `{ institutionId: 1, code: 1, academicYearId: 1 }` to `{ code: 1, academicYearId: 1 }`.
   - Remove `enforceInstitutionScope` from backend middleware.
3. **Student Registration Cleanup:**
   - Remove institution dropdown and requirement from `Admin -> Students -> Register Student`.
   - Remove `STUDENT` option from generic `UserFormModal.jsx` in Admin Users.
4. **7-Session Daily Attendance Module (Backend + Frontend):**
   - Create `Attendance` model with compound index `{ studentId: 1, date: 1, period: 1 }`.
   - Mount `/api/attendance` endpoints (`batch`, `student/summary`, `student/monthly`, `student/history`).
   - Fix `/student/attendance` frontend page to consume real backend data.
5. **Asatitha Attendance Entry Workflow:**
   - Implement teacher attendance entry screen: Teacher selects `Class -> Date -> Period (1-7)` $\rightarrow$ marks student attendance $\rightarrow$ submit.
   - Automatic 7/7 full attendance calculation.
6. **Student Portal Dashboard Alignment:**
   - Add today's 7-session attendance card, overall progress, and clean single-institute branding.
7. **Basic Principal & HOD Dashboards:**
   - Working `/principal` institution overview dashboard.
   - Working `/hod` department overview dashboard.

### CAN BE COMPLETED IN LATER PHASES (Milestone 2 & 3)

1. **Parent-Teacher Controlled Escalation Messaging System** (Phase 2).
2. **Full Co-Curricular Activities History (Participation $\rightarrow$ Performance $\rightarrow$ Certificate)** (Phase 2).
3. **Downloadable PDF/Excel Reports Engine for Principal** (Phase 2).
4. **Push Notification Service Worker Infrastructure** (Phase 3).
5. **Historical Multi-Tenant Data Purge** (Phase 3).

---

## 23. Remaining Task Checklist

### Foundation & Single-Institute Architecture
- [ ] Add `PRINCIPAL`, `HOD`, `ASATITHA`, `PARENT` to `ROLES` constant in `backend/src/shared/constants/roles.js`.
- [ ] Add target roles to `user.model.js` enum.
- [ ] Add target roles to `frontend/src/types/auth.ts`.
- [ ] Create `InstituteSettings` model (`backend/src/modules/institutions/institute-settings.model.js`).
- [ ] Create `GET /api/admin/institute-settings` and `PUT /api/admin/institute-settings`.
- [ ] Remove `enforceInstitutionScope` from `backend/src/middleware/auth.middleware.js`.
- [ ] Remove `filter.institutionId = req.user.institutionId` from all backend controllers.
- [ ] Change `Class` schema index to `{ code: 1, academicYearId: 1 }` and make `institutionId` optional.
- [ ] Make `institutionId` optional in `student.model.js`, `faculty.model.js`, `exam-registration.model.js`.
- [ ] Add `TUITION_FEE` and `GENERAL` to `payment.model.js` enum.

### Student Registration & Admin Users
- [ ] Remove `institutionId` from `student.validator.js` (`validateRegisterStudent`).
- [ ] Remove campus/institution dropdown from `frontend/src/app/(admin)/admin/students/page.tsx`.
- [ ] Remove `STUDENT` option from `frontend/src/components/admin/UserFormModal.jsx` and add guidance to use Student Registration.
- [ ] Add `PRINCIPAL`, `HOD`, `ASATITHA`, `PARENT` options to `UserFormModal.jsx`.
- [ ] Update Admin sidebar navigation to reflect Markaz Sanaviyya structure.
- [ ] Create Admin Institute Settings page (`/admin/institute-settings`).

### 7-Session Attendance Module
- [ ] Create `Attendance` Mongoose schema in `backend/src/modules/attendance/attendance.model.js`.
- [ ] Implement batch attendance submission controller & service (`POST /api/attendance/batch`).
- [ ] Implement student attendance summary calculation (`GET /api/attendance/student/summary`).
- [ ] Implement student monthly session grid (`GET /api/attendance/student/monthly`).
- [ ] Implement longitudinal monthly attendance history (`GET /api/attendance/student/history`).
- [ ] Implement pending attendance checks for teachers (`GET /api/attendance/pending-teachers`).
- [ ] Mount `/api/attendance` in `backend/src/routes/index.js`.
- [ ] Connect `/student/attendance` frontend page with real attendance endpoints.

### Asatitha / Faculty Portal
- [ ] Create `/asatitha` route structure or enhance `/faculty`.
- [ ] Build 7-session attendance marking UI (`Class -> Date -> Period -> Student Checklist -> Submit`).
- [ ] Build Student 360° modal view (Academic, Attendance, Remarks, Exams).
- [ ] Build teacher dashboard metrics (Today's classes, attendance pending, tasks).

### Principal & HOD Portals
- [ ] Create `/principal` layout, route, and dashboard client.
- [ ] Build Principal institution overview (Students, Teachers, Classes, Overall Attendance %).
- [ ] Implement Early Warning algorithm for at-risk students (Attendance < 75%, Exams < 40%).
- [ ] Create `/hod` layout, route, and dashboard client.
- [ ] Build HOD department monitoring view and pending attendance alert.

### Parent Portal
- [ ] Create `/parent` layout, route, and dashboard client.
- [ ] Build My Child academic overview and daily attendance viewer.
- [ ] Build leave application submission form.

### Student Development & Co-Curricular Modules
- [ ] Create `StudentDevelopment` model (Academic, Linguistic, Spiritual, Skill, Leadership).
- [ ] Create `Activity` model for speech, essay, debate, qira'ath, khutba.
- [ ] Build progress card UI for Student and Parent dashboards.

---

## 24. Priority Order (Execution Sequence)

```
[P0] Foundation & RBAC
     ├── Roles & User Enum Update
     ├── Class & Profile Model Schema Index Updates (Remove institutionId hard requirement)
     └── Auth Middleware Scoping Removal

[P1] Immediate Functional Core (Tomorrow's Milestone)
     ├── Admin Student Registration (Remove institution dropdown)
     ├── Admin User Form (Disallow student creation, add operational roles)
     ├── Attendance Module (Model, 7-session batch API, student summary APIs)
     ├── Asatitha Attendance Entry Workflow (Class -> Date -> Period)
     ├── Student Portal Attendance Integration
     ├── Principal Overview Dashboard & At-Risk Logic
     └── HOD Department Overview Dashboard

[P2] Operations & Parent Engagement
     ├── Parent Portal Dashboard & Child Viewer
     ├── Student 360° Modal in Asatitha Portal
     ├── Student Development 5-Area Tracking (Backend + UI)
     ├── Activities & Co-Curricular Module
     └── Institute Settings Admin View

[P3] Advanced Reporting & Polish
     ├── Downloadable PDF/Excel Reports (Daily, Monthly, Annual)
     ├── Controlled Parent-Teacher Escalation Messaging
     ├── In-App Central Notification Centre
     └── Deprecate & Clean Legacy /institution Routes
```

---

## 25. Current Technical Blockers

1. **Blocker 1: Missing Backend Attendance Routes**
   - **Problem:** `/student/attendance` triggers 404 errors on three endpoints.
   - **File:** `backend/src/routes/index.js`
   - **Reason:** Module was designed in frontend types but never implemented in Express backend.
   - **Impact:** Student attendance viewing is non-functional.
   - **Fix:** Implement `backend/src/modules/attendance` and mount `router.use("/attendance", attendanceRoutes)`.

2. **Blocker 2: Class Schema Compound Unique Index Collision**
   - **Problem:** `classSchema.index({ institutionId: 1, code: 1, academicYearId: 1 }, { unique: true })`.
   - **File:** `backend/src/modules/academics/class.model.js`
   - **Reason:** In single-institute architecture, omitting `institutionId` stores `null`, causing duplicate key errors on the second class created with null institution.
   - **Impact:** Any class created without `institutionId` crashes MongoDB writes.
   - **Fix:** Update index to `{ code: 1, academicYearId: 1 }` with `{ unique: true }`.

3. **Blocker 3: Exam Registration Requires Institution ID**
   - **Problem:** `examRegistrationSchema` marks `institutionId` with `required: true`.
   - **File:** `backend/src/modules/exams/exam-registration.model.js`
   - **Reason:** Multi-tenant legacy requirement.
   - **Impact:** Candidate registration fails if no institution ID is supplied.
   - **Fix:** Remove `required: true` and make optional.

4. **Blocker 4: Admin Users Form Allows Student Creation**
   - **Problem:** `<option value="STUDENT">Student</option>` in `UserFormModal.jsx`.
   - **File:** `frontend/src/components/admin/UserFormModal.jsx`
   - **Reason:** Generic user modal was not restricted when atomic registration was introduced.
   - **Impact:** Administrators accidentally create account-only students with missing profiles.
   - **Fix:** Remove `STUDENT` option and redirect to Student Profiles Directory.

---

## 26. Verified Status Summary

### CURRENTLY COMPLETED:
- JWT Authentication, 2FA, OTP verification, password setup, password reset.
- Canonical atomic student registration backend (`POST /api/admin/students/register`).
- Admin user management (list, invite, status toggle, OTP verify).
- Academic framework (Academic years, Subjects, Syllabuses).
- Board examination management (Exams, Schedules, Mark Entry, Results).
- Payment ledger and event registration.
- Next.js 15 frontend production build (`npm run build` exits 0).
- TypeScript compilation (`tsc --noEmit` exits 0).

### CURRENTLY PARTIAL:
- Student Portal (Profile, exams, transcript work; attendance broken, progress card missing).
- Faculty Portal (Exam marks entry works; 7-session attendance and Student 360° missing).
- Class Model & Exam Registration (Functional but still require `institutionId`).
- Student Registration UI (Creates profile, but still displays campus dropdown).
- Role-based redirect (Only redirects `ADMIN`, `INSTITUTION`, `FACULTY`, `STUDENT`).

### CURRENTLY NOT STARTED:
- Parent Portal (`/parent`) and `PARENT` role.
- HOD Portal (`/hod`) and `HOD` role.
- Principal Portal (`/principal`) and `PRINCIPAL` role.
- 7-Session Daily Attendance Backend (`/api/attendance/*`).
- Student Development Module (5 Areas: Academic, Linguistic, Spiritual, Skill, Leadership).
- Co-Curricular Activities Module (Speech, Essay, Debate, Khutba, Qira'ath, etc.).
- Mentor System (Usthad assigned students).
- Principal Downloadable Reports (Daily, Monthly, Annual in PDF/Excel).
- Early Warning System for at-risk students.
- Central Notification System.
- Central Institute Settings model & admin view.

### CURRENTLY BROKEN/BLOCKED:
- Student attendance frontend page (`/student/attendance`) calling nonexistent `/api/attendance/*` endpoints (HTTP 404).
- MongoDB Class compound index requiring `institutionId` causing potential E11000 duplicate key error.
- ExamRegistration schema requiring `institutionId`.
- Generic Admin Users modal allowing unlinked Student account creation.

### NEXT IMPLEMENTATION ORDER:
1. Update `ROLES` constant and User model enum to add `PRINCIPAL`, `HOD`, `ASATITHA`, `PARENT`.
2. Update Class model index to `{ code: 1, academicYearId: 1 }` and make `institutionId` optional across all models.
3. Remove `enforceInstitutionScope` from auth middleware and tenant filtering from controllers.
4. Remove institution dropdown from Student Registration modal and remove `STUDENT` from Admin Users modal.
5. Implement `backend/src/modules/attendance` (7-session model, batch entry API, student summary APIs).
6. Build Asatitha attendance entry UI (`Class -> Date -> Period -> Submit`).
7. Connect `/student/attendance` page to backend attendance APIs.
8. Build Principal and HOD overview dashboards.
