const leaveService = require("./leave.service");

const handleApplyLeave = async (req, res) => {
  try {
    const result = await leaveService.applyLeave(req.user.userId, req.body);
    return res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to submit leave application",
    });
  }
};

const handleApproveLeave = async (req, res) => {
  try {
    const { reviewRemarks } = req.body;
    const result = await leaveService.approveLeave(
      req.params.id,
      req.user.userId,
      reviewRemarks
    );
    return res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to approve leave request",
    });
  }
};

const handleRejectLeave = async (req, res) => {
  try {
    const { reviewRemarks } = req.body;
    const result = await leaveService.rejectLeave(
      req.params.id,
      req.user.userId,
      reviewRemarks
    );
    return res.status(200).json({
      success: true,
      message: "Leave request rejected",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to reject leave request",
    });
  }
};

const handleGetLeaves = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "PARENT") {
      filter.appliedBy = req.user.userId;
    } else if (req.user.role === "STUDENT") {
      filter.studentId = req.user.studentId;
    }

    if (req.query.studentId && req.user.role !== "PARENT" && req.user.role !== "STUDENT") {
      filter.studentId = req.query.studentId;
    }

    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const leaves = await leaveService.getLeaves(filter);
    return res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve leaves" });
  }
};

module.exports = {
  handleApplyLeave,
  handleApproveLeave,
  handleRejectLeave,
  handleGetLeaves,
};
