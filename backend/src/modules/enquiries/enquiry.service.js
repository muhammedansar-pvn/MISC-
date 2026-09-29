const Enquiry = require("./enquiry.model");

const createEnquiry = async (data) => Enquiry.create(data);
const getEnquiries = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      Enquiry.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
      Enquiry.countDocuments(filter),
    ]);
    return { data, total };
  }
  return Enquiry.find(filter).sort({ createdAt: -1 }).lean();
};
const updateEnquiryStatus = async (id, status) =>
  Enquiry.findByIdAndUpdate(id, { status }, { new: true });

module.exports = {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
};
