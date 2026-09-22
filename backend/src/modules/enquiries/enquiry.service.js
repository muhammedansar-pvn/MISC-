const Enquiry = require("./enquiry.model");

const createEnquiry = async (data) => Enquiry.create(data);
const getEnquiries = async (filter = {}) => Enquiry.find(filter).sort({ createdAt: -1 }).lean();
const updateEnquiryStatus = async (id, status) =>
  Enquiry.findByIdAndUpdate(id, { status }, { new: true });

module.exports = {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
};
