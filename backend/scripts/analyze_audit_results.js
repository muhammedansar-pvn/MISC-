const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "audit_output.json"), "utf8"));

console.log("==================================================");
console.log("1. DATABASE INVENTORY");
console.log("==================================================");
for (const [coll, info] of Object.entries(data.collections)) {
  console.log(`- ${coll}: ${info.count} documents, ${info.indexes.length} indexes`);
}

console.log("\n==================================================");
console.log("2. USER ACCOUNT AUDIT");
console.log("==================================================");
const userMap = new Map();
const emailSet = new Map();
const usernameSet = new Map();

data.users.forEach(u => {
  userMap.set(u._id, u);
  if (u.email) {
    if (!emailSet.has(u.email)) emailSet.set(u.email, []);
    emailSet.get(u.email).push(u._id);
  }
  if (u.username) {
    if (!usernameSet.has(u.username)) usernameSet.set(u.username, []);
    usernameSet.get(u.username).push(u._id);
  }
});

console.log(`Total Preserved Users: ${data.users.length}`);
data.users.forEach(u => {
  const student = data.students.find(s => s.userId === u._id);
  const faculty = data.faculty.find(f => f.userId === u._id);
  const parent = data.parents.find(p => p.userId === u._id);
  const inst = data.institutions.find(i => i.userId === u._id);

  let profileType = "NONE";
  let profileId = null;
  if (student) { profileType = "STUDENT"; profileId = student._id; }
  else if (faculty) { profileType = "FACULTY"; profileId = faculty._id; }
  else if (parent) { profileType = "PARENT"; profileId = parent._id; }
  else if (inst) { profileType = "INSTITUTION"; profileId = inst._id; }
  else if (u.role === "ADMIN") { profileType = "ADMIN_ROOT"; }

  console.log(`- ID: ${u._id} | Role: ${u.role} | Email: ${u.email || "N/A"} | Username: ${u.username || "N/A"} | Status: ${u.status} | Verified: ${u.isEmailVerified} | Profile: ${profileType} (${profileId || "N/A"}) | Created: ${u.createdAt}`);
});

console.log("\nDuplicate Email Checks:");
for (const [email, ids] of emailSet.entries()) {
  if (ids.length > 1) console.log(`  DUPLICATE EMAIL: ${email} -> ${ids.join(", ")}`);
}

console.log("\nDuplicate Username Checks:");
for (const [uname, ids] of usernameSet.entries()) {
  if (ids.length > 1) console.log(`  DUPLICATE USERNAME: ${uname} -> ${ids.join(", ")}`);
}

console.log("\n==================================================");
console.log("3. STUDENT RELATIONSHIPS AUDIT");
console.log("==================================================");
console.log(`Total Student Profiles: ${data.students.length}`);
data.students.forEach(s => {
  const user = userMap.get(s.userId);
  const cls = data.classes.find(c => c._id === s.classId);
  const inst = data.institutions.find(i => i._id === s.institutionId);

  const userStatus = user ? `Valid User (${user.email || user.username})` : `ORPHAN (User ID ${s.userId} missing)`;
  const classStatus = cls ? `Valid Class (${cls.className})` : (s.classId ? `Broken Class Ref (${s.classId})` : "Unassigned Class");
  const instStatus = inst ? `Valid Inst (${inst.institutionName})` : (s.institutionId ? `Broken Inst Ref (${s.institutionId})` : "Unassigned Inst");

  console.log(`- Student ID: ${s._id} | Reg: ${s.registrationNumber} | Name: ${s.nameEnglish} | User: ${userStatus} | Class: ${classStatus} | Inst: ${instStatus}`);
});

console.log("\n==================================================");
console.log("4. PARENT RELATIONSHIPS AUDIT");
console.log("==================================================");
console.log(`Total Parent Profiles: ${data.parents.length}`);
data.parents.forEach(p => {
  const user = userMap.get(p.userId);
  const userStatus = user ? `Valid User (${user.email || user.username})` : `ORPHAN (User ID ${p.userId} missing)`;

  // Check children
  const childrenRefs = [...p.children];
  if (p.studentId && !childrenRefs.includes(p.studentId)) childrenRefs.push(p.studentId);

  const childrenDetails = childrenRefs.map(cid => {
    const st = data.students.find(s => s._id === cid);
    return st ? `${st.nameEnglish} (${st.registrationNumber})` : `BROKEN REF (${cid})`;
  });

  console.log(`- Parent ID: ${p._id} | User: ${userStatus} | Name: ${p.fullName} | Email: ${p.parentEmail} | Children: [${childrenDetails.join(", ")}]`);
});

console.log("\n==================================================");
console.log("5. FACULTY RELATIONSHIPS AUDIT");
console.log("==================================================");
console.log(`Total Faculty Profiles: ${data.faculty.length}`);
data.faculty.forEach(f => {
  const user = userMap.get(f.userId);
  const userStatus = user ? `Valid User (${user.email || user.username})` : `ORPHAN (User ID ${f.userId} missing)`;
  const inst = data.institutions.find(i => i._id === f.institutionId);
  const instStatus = inst ? `Valid Inst (${inst.institutionName})` : (f.institutionId ? `Broken Inst Ref (${f.institutionId})` : "Unassigned Inst");

  const assignments = data.facultyAssignments.filter(fa => fa.facultyId === f._id);
  const assignmentDetails = assignments.map(a => {
    const cls = data.classes.find(c => c._id === a.classId);
    const sub = data.subjects.find(s => s._id === a.subjectId);
    return `${sub ? sub.subjectName : a.subjectId} -> ${cls ? cls.className : a.classId}`;
  });

  console.log(`- Faculty ID: ${f._id} | Code: ${f.facultyId} | Name: ${f.nameEnglish} | User: ${userStatus} | Inst: ${instStatus} | Assignments: [${assignmentDetails.join(", ")}]`);
});

console.log("\n==================================================");
console.log("6. INSTITUTION AUDIT");
console.log("==================================================");
console.log(`Total Institutions: ${data.institutions.length}`);
data.institutions.forEach(i => {
  const user = userMap.get(i.userId);
  const userStatus = user ? `Valid User (${user.email || user.username})` : `ORPHAN (User ID ${i.userId} missing)`;
  console.log(`- Inst ID: ${i._id} | Code: ${i.institutionCode} | Name: ${i.institutionName} | Type: ${i.type} | User: ${userStatus} | Status: ${i.status}`);
});

console.log("\n==================================================");
console.log("7. CLASS & SUBJECT AUDIT");
console.log("==================================================");
console.log(`Classes (${data.classes.length}):`);
data.classes.forEach(c => {
  const ay = data.academicYears.find(a => a._id === c.academicYearId);
  console.log(`- Class ID: ${c._id} | Code: ${c.code} | Name: ${c.className} | AY: ${ay ? ay.yearName : c.academicYearId} | WorkingDays: ${c.workingDays ? c.workingDays.join(",") : "DEFAULT"} | Status: ${c.status}`);
});

console.log(`\nSubjects (${data.subjects.length}):`);
data.subjects.forEach(s => {
  console.log(`- Subject ID: ${s._id} | Code: ${s.subjectCode} | Name: ${s.subjectName} | Category: ${s.category} | Status: ${s.status}`);
});

console.log("\n==================================================");
console.log("8. TIMETABLE AUDIT");
console.log("==================================================");
console.log(`Timetables (${data.timetables.length}):`);
data.timetables.forEach(t => {
  const cls = data.classes.find(c => c._id === t.classId);
  const isFriday = t.dayOfWeek === "FRIDAY";
  const classHasFriday = cls?.workingDays ? cls.workingDays.includes("FRIDAY") : true;

  console.log(`- Timetable ID: ${t._id} | Day: ${t.dayOfWeek} | Class: ${cls ? cls.className : t.classId} | Friday Compliant: ${!isFriday || classHasFriday ? "YES" : "VIOLATION"}`);
});

console.log("\n==================================================");
console.log("9. LEAVE AUDIT");
console.log("==================================================");
console.log(`Leaves (${data.leaves.length}):`);
data.leaves.forEach(l => {
  const student = data.students.find(s => s._id === l.studentId);
  const parent = data.parents.find(p => p._id === l.appliedBy || p.userId === l.appliedBy);
  const reviewer = userMap.get(l.reviewedBy);

  console.log(`- Leave ID: ${l._id} | Student: ${student ? student.nameEnglish : l.studentId} | AppliedBy: ${parent ? parent.fullName : l.appliedBy} (${l.applicantRole}) | Type: ${l.leaveType} | Status: ${l.status} | ReviewedBy: ${reviewer ? reviewer.username : (l.reviewedBy || "Pending")} | Dates: ${JSON.stringify(l.dateRange)}`);
});

console.log("\n==================================================");
console.log("10. EXAM & RESULT AUDIT");
console.log("==================================================");
console.log(`Exams (${data.exams.length}):`, data.exams);
console.log(`Exam Schedules (${data.examSchedules.length}):`, data.examSchedules);
console.log(`Exam Registrations (${data.examRegistrations.length}):`, data.examRegistrations);

console.log("\n==================================================");
console.log("11. PAYMENTS AUDIT");
console.log("==================================================");
console.log(`Payments (${data.payments.length}):`);
data.payments.forEach(p => {
  const st = data.students.find(s => s._id === p.studentId);
  console.log(`- Payment ID: ${p._id} | Student: ${st ? st.nameEnglish : p.studentId || "Unlinked"} | Amount: ${p.amount} | Status: ${p.status} | Purpose: ${p.purpose}`);
});

console.log("\n==================================================");
console.log("12. NOTIFICATIONS & EMAIL AUDIT");
console.log("==================================================");
console.log(`Notifications (${data.notifications.length}):`);
data.notifications.forEach(n => {
  const u = userMap.get(n.userId);
  console.log(`- Notif ID: ${n._id} | Recipient: ${u ? (u.email || u.username) : "ORPHAN"} | Title: ${n.title} | Type: ${n.type}`);
});

console.log(`\nEmail Events (${data.emailevents.length}):`);
data.emailevents.forEach(e => {
  console.log(`- Email ID: ${e._id} | Recipient: ${e.recipientEmail} | Event: ${e.eventType} | Subject: ${e.subject} | Status: ${e.status}`);
});
