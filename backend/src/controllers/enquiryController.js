const cmsService = require("../services/cmsService");

const handleCreateEnquiry = async (req, res) => {
  try {
    const enquiry = await cmsService.createEnquiry(req.body);
    return res.status(201).json({ success: true, message: "Enquiry submitted successfully", data: enquiry });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to submit enquiry" });
  }
};

const handleGetEnquiries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const enquiries = await cmsService.getEnquiries(filter);
    return res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to retrieve enquiries" });
  }
};

const handleUpdateEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await cmsService.updateEnquiryStatus(req.params.id, req.body.status);
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });
    return res.status(200).json({ success: true, message: "Enquiry status updated successfully", data: enquiry });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to update enquiry status" });
  }
};

module.exports = {
  handleCreateEnquiry,
  handleGetEnquiries,
  handleUpdateEnquiryStatus,
};
