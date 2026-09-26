const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  PRINCIPAL: "PRINCIPAL",
  HOD: "HOD",
  ASATITHA: "ASATITHA",
  FACULTY: "FACULTY", // Preserved as alias/backward compatibility for Asatitha
  STUDENT: "STUDENT",
  PARENT: "PARENT",
});

const LEGACY_ROLES = Object.freeze({
  INSTITUTION: "INSTITUTION",
});

const ALLOWED_ROLES = Object.freeze([
  ...Object.values(ROLES),
  ...Object.values(LEGACY_ROLES),
]);

module.exports = {
  ROLES,
  LEGACY_ROLES,
  ALLOWED_ROLES,
};

