/**
 * Helper to parse pagination query parameters with a safe cap.
 * @param {Object} query - Express req.query object
 * @param {number} defaultLimit - Default limit if not supplied (default: 50)
 * @param {number} maxLimit - Hard maximum limit cap (default: 100)
 */
const parsePagination = (query = {}, defaultLimit = 50, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10);
  const limit = Math.min(
    maxLimit,
    Math.max(1, isNaN(requestedLimit) ? defaultLimit : requestedLimit)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Standardized pagination wrapper maintaining backward compatibility.
 * Always retains `data: [...]` and `count: N` fields so existing frontend callers never break.
 */
const formatPaginatedResponse = ({ data = [], total, page = 1, limit = 50, ...rest }) => {
  const totalCount = typeof total === "number" ? total : data.length;
  return {
    success: true,
    count: data.length,
    total: totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit) || 1,
    limit,
    data,
    ...rest,
  };
};

module.exports = {
  parsePagination,
  formatPaginatedResponse,
};
