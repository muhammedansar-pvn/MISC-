const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
  FACULTY: "FACULTY",
  INSTITUTION: "INSTITUTION",
});

const ALLOWED_ROLES = Object.freeze(Object.values(ROLES));

module.exports = {
  ROLES,
  ALLOWED_ROLES,
};
