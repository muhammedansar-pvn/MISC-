/**
 * Escapes characters with special meaning in regular expressions
 * to prevent Regular Expression Denial of Service (ReDoS) and syntax errors.
 * @param {string} str - User-supplied search string
 * @returns {string} - Regex-safe escaped string
 */
const escapeRegex = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = {
  escapeRegex,
};
