# PHASE 5 — ASSIGNMENTS IMPLEMENTATION REPORT

**Single-Institute Sanaviyya / Markaz MISC Academic System**  
**Phase Completed**: Phase 5 — Assignments & Submissions Engine  
**Status**: 100% COMPLETE & VERIFIED  

---

## 1. Executive Summary

Phase 5 establishes a complete, secure, and relational homework and assignments system for the Markaz Sanaviyya platform.

The complete workflow:
$$\text{Faculty} \longrightarrow \text{Assigned Class + Subject} \longrightarrow \text{Create Assignment} \longrightarrow \text{Class Students Receive} \longrightarrow \text{Student Submits} \longrightarrow \text{Faculty Evaluates} \longrightarrow \text{Marks \& Feedback} \longrightarrow \text{Student View}$$
is enforced from backend models, controllers, and authorization policies to the faculty and student frontend portals.

All 16 planned Phase 5 automated tests and all 61 tests across Phases 1–4 regression suites passed (**77/77 tests passed, 100%**). The frontend TypeScript verification (`npx tsc --noEmit`) and production Next.js build (`npm run build`) completed with 0 errors across 70 static pages.

---

## 2. Files Changed & Created

### Backend:
- [`backend/src/modules/assignments/assignment.model.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/assignments/assignment.model.js): Added `academicYearId` and `maxMarks`; added compound indexes.
- [`backend/src/modules/assignments/assignment.service.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/assignments/assignment.service.js): Implemented `updateAssignment`, `gradeSubmission`, student query scoping, outsider enrollment validation, faculty authorization checks, and resubmission locks.
- [`backend/src/modules/assignments/assignment.controller.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/assignments/assignment.controller.js): Added `handleUpdateAssignment` and `handleGradeSubmission`; enforced authenticated identity resolution.
- [`backend/src/modules/assignments/assignment.routes.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/src/modules/assignments/assignment.routes.js): Mounted `PUT /:id` and `POST /:id/submissions/:submissionId/grade`.
- [`backend/scripts/testPhase5Assignments.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/backend/scripts/testPhase5Assignments.js) [NEW]: 16 comprehensive automated test cases.

### Frontend:
- [`frontend/src/api/axios.js`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/api/axios.js): Added `API_ENDPOINTS.assignments.grade`.
- [`frontend/src/services/assignment.service.ts`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/services/assignment.service.ts): Added typed interfaces `AssignmentItem`, `AssignmentSubmissionItem`, and client methods `gradeSubmission` and `updateAssignment`.
- [`frontend/src/app/(faculty)/faculty/assignments/page.tsx`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/app/(faculty)/faculty/assignments/page.tsx): Added `Max Marks` to creation modal and built interactive evaluation & grading form in submissions modal.
- [`frontend/src/app/(student)/student/assignments/page.tsx`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/app/(student)/student/assignments/page.tsx) [NEW]: Full student assignments portal with status tabs, file/link submission, and scorecard display.
- [`frontend/src/components/student/StudentLayoutClient.tsx`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/components/student/StudentLayoutClient.tsx): Added Assignments link under `ACADEMICS` navigation category.

---

## 3. APIs Added & Modified

| Method | Endpoint | Allowed Roles | Description | Status |
|---|---|---|---|---|
| `GET` | `/api/assignments` | `ADMIN`, `PRINCIPAL`, `HOD`, `FACULTY`, `STUDENT`, `PARENT` | Lists assignments. Automatically scopes to student's enrolled class when called by a student. | Modified (Scoped) |
| `POST` | `/api/assignments` | `FACULTY`, `ADMIN`, `PRINCIPAL`, `HOD` | Creates an assignment with up to 5 attachments, `academicYearId`, and `maxMarks`. Enforces `FacultyAssignment` scope. | Modified (Hardened) |
| `GET` | `/api/assignments/:id` | `ADMIN`, `PRINCIPAL`, `HOD`, `FACULTY`, `STUDENT`, `PARENT` | Retrieves assignment details. Enforces class enrollment if called by a student. | Modified (Scoped) |
| `PUT` | `/api/assignments/:id` | `FACULTY`, `ADMIN`, `PRINCIPAL`, `HOD` | Updates title, description, due date, max marks. Protected to owner faculty or admin. | **NEW** |
| `DELETE` | `/api/assignments/:id` | `FACULTY`, `ADMIN`, `PRINCIPAL`, `HOD` | Soft-deletes assignment. Protected to owner faculty or admin. | Verified |
| `POST` | `/api/assignments/:id/submit` | `STUDENT` | Submits file and/or link. Validates student class enrollment and blocks resubmission if status is `GRADED`. | Modified (Secured) |
| `GET` | `/api/assignments/:id/my-submission` | `STUDENT` | Fetches authenticated student's own submission with marks and feedback. | Verified |
| `GET` | `/api/assignments/:id/submissions` | `FACULTY`, `ADMIN`, `PRINCIPAL`, `HOD` | Lists all submissions for an assignment. Enforces faculty assignment check; blocks students (403). | Modified (Hardened) |
| `POST` | `/api/assignments/:id/submissions/:submissionId/grade` | `FACULTY`, `ADMIN`, `PRINCIPAL`, `HOD` | Evaluates submission, validates marks bounds ($0 \le \text{marks} \le \text{maxMarks}$), records feedback and transitions status to `GRADED`. | **NEW** |

---

## 4. Database Changes

### `Assignment` Collection (`assignments`):
1. **`academicYearId`**: `{ type: ObjectId, ref: "AcademicYear", required: true }`. Scopes assignments to the academic year.
2. **`maxMarks`**: `{ type: Number, default: 100, min: 1 }`. Provides the canonical grading ceiling.
3. **Compound Indexes**:
   - `{ classId: 1, isDeleted: 1 }`
   - `{ classId: 1, academicYearId: 1, isDeleted: 1 }`
   - `{ classId: 1, subjectId: 1, isDeleted: 1 }`
   - `{ facultyId: 1, isDeleted: 1 }`
   - `{ dueDate: 1 }`

### `AssignmentSubmission` Collection (`assignment_submissions`):
1. **Preserved Schema**: `assignmentId`, `studentId`, `submittedFile`, `link`, `submittedAt`, `status`, `marks`, `feedback`, `gradedBy`, `gradedAt`.
2. **Compound Unique Index**: `{ assignmentId: 1, studentId: 1 }` preserves idempotence and prevents duplicate submission documents.

---

## 5. Security Fixes & IDOR Protection

1. **Teacher Identity Server-Binding**: Faculty ID is resolved server-side from `req.user.id` $\to$ `FacultyProfile._id`. Client cannot impersonate another teacher.
2. **Faculty Assignment Scoping**: Unassigned faculty cannot create assignments, view submissions, edit assignments, or submit grades for classes/subjects they do not teach (HTTP 403 Forbidden).
3. **Class Enrollment Enforcement**: Students can only view and submit to assignments belonging to their enrolled class cohort. Outsider submissions are rejected with HTTP 400.
4. **Student IDOR Protection**: Students cannot access `/api/assignments/:id/submissions` (HTTP 403). `my-submission` returns only the authenticated student's record.
5. **Mark Boundary Validation**: Marks cannot be negative and cannot exceed `assignment.maxMarks` (HTTP 400).
6. **Resubmission Lock**: Once a submission reaches `GRADED`, student resubmission is blocked with HTTP 400.
7. **File Security**: Strictly enforced 25MB file upload limit via `upload.middleware.js` with rejection of 19 dangerous executable extensions.

---

## 6. Frontend Changes

1. **Faculty Assignments Workspace** ([`/faculty/assignments`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/app/(faculty)/faculty/assignments/page.tsx)):
   - Added `Max Marks` field to creation modal.
   - Built candidate evaluation drawer in the submissions modal with numeric marks input, teacher feedback text field, and asynchronous "Save Grade" button.
   - Visual badges for `SUBMITTED`, `LATE`, and `GRADED` states.
2. **Student Assignments Workspace** ([`/student/assignments`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/app/(student)/student/assignments/page.tsx)):
   - Created full-featured student assignments portal.
   - Status filters: All, Pending, Submitted, Graded.
   - Assignment cards displaying course metadata, teacher attachments, due dates, and marks.
   - Submission modal supporting file uploads (PDF, DOCX, images) and link inputs.
   - Interactive scorecard showing awarded score vs. max marks, teacher feedback, and evaluation timestamp.
3. **Navigation Integration** ([`StudentLayoutClient.tsx`](file:///c:/Users/hp/OneDrive/Desktop/misc/frontend/src/components/student/StudentLayoutClient.tsx)):
   - Added `Assignments` link under `ACADEMICS` menu (aligning with Sanaviyya requirements PDF Section 13).

---

## 7. Test Results

### Phase 5 Automated Test Suite (`backend/scripts/testPhase5Assignments.js`)
**16/16 Tests Passed (100%)**:
1. `✓ Test 1: Assignment created with academicYearId and maxMarks=50`
2. `✓ Test 2: Unassigned faculty blocked with HTTP 403`
3. `✓ Test 3: Assignment query strictly scoped to enrolled student's class`
4. `✓ Test 4: On-time submission saved with status SUBMITTED`
5. `✓ Test 5: Late submission correctly marked with status LATE`
6. `✓ Test 6: Student resubmitted revision successfully before grading`
7. `✓ Test 7: Outsider student submission strictly rejected`
8. `✓ Test 8: Unassigned faculty blocked with HTTP 403`
9. `✓ Test 9: Submission graded with status GRADED and feedback recorded`
10. `✓ Test 10: Negative marks and marks exceeding maxMarks strictly rejected`
11. `✓ Test 11: Resubmission on graded assignment blocked with HTTP 400`
12. `✓ Test 12: Student retrieved evaluated score and feedback`
13. `✓ Test 13: Student IDOR blocked with HTTP 403`
14. `✓ Test 14: Assignment updated successfully`
15. `✓ Test 15: Delete authorization enforced (HTTP 403 for unassigned, HTTP 200 for owner)`
16. `✓ Test 16: Compound unique index enforces idempotent submission`

---

## 8. Regression Test Results (Phases 1–5 Cumulative)

| Test Suite | File | Tests Passed | Status |
|---|---|---|---|
| **Phase 1: Academic Core** | `testPhase1AcademicRelationships.js` | 11 / 11 | **PASSED (100%)** |
| **Phase 2: Faculty Core** | `testPhase2FacultyCore.js` | 10 / 10 | **PASSED (100%)** |
| **Phase 3: Attendance Engine** | `testPhase3AttendanceEngine.js` | 18 / 18 | **PASSED (100%)** |
| **Phase 4: Examination & Marks** | `testPhase4ExaminationMarks.js` | 22 / 22 | **PASSED (100%)** |
| **Phase 5: Assignments** | `testPhase5Assignments.js` | 16 / 16 | **PASSED (100%)** |
| **Cumulative Total** | **All 5 Suites** | **77 / 77** | **PASSED (100%)** |

---

## 9. TypeScript Result

```bash
$ npx tsc --noEmit
# Exit code: 0 (Zero type errors)
```

---

## 10. Production Build Result

```bash
$ npm run build
> next build

✓ Compiled successfully in 31.4s
✓ Linting and checking validity of types
✓ Generating static pages (70/70)
✓ Finalizing page optimization
# Exit code: 0 (All 70 pages compiled cleanly)
```

---

## 11. Known Issues

- None. All test assertions, security checks, type checks, and production builds completed with 0 errors.

---

## 12. Deferred Features

- Plagiarism detection / Turnitin similarity integration.
- Group student assignment submissions.
- Voice/audio remarks recording for usthads.
- Automated SMS / WhatsApp push notifications to parents upon assignment posting.
