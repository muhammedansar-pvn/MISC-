const activityService = require("./activity.service");

const handleCreateActivity = async (req, res, next) => {
  try {
    const { name, category, description, academicYearId } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    const activity = await activityService.createActivity({
      name,
      category,
      description,
      academicYearId,
    });

    return res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (error) {
    return next(error);
  }
};

const handleListActivities = async (req, res, next) => {
  try {
    const activities = await activityService.listActivities(req.query);
    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    return next(error);
  }
};

const handleRecordAchievement = async (req, res, next) => {
  try {
    const { activityId, academicYearId } = req.body;
    if (!activityId || !academicYearId) {
      return res.status(400).json({
        success: false,
        message: "activityId and academicYearId are required",
      });
    }

    const achievement = await activityService.recordAchievement(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Achievement recorded successfully",
      data: achievement,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

const handleVerifyAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const achievement = await activityService.verifyAchievement(id, req.user, {
      status,
      remarks,
    });

    return res.status(200).json({
      success: true,
      message: `Achievement ${achievement.status.toLowerCase()} successfully`,
      data: achievement,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

const handleGetMyAchievements = async (req, res, next) => {
  try {
    if (!req.user.studentId) {
      return res.status(400).json({
        success: false,
        message: "No student profile associated with your account",
      });
    }

    const list = await activityService.getMyAchievements(req.user.studentId);
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    return next(error);
  }
};

const handleGetStudentAchievements = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const list = await activityService.getStudentAchievements(studentId, req.user);
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
};

module.exports = {
  handleCreateActivity,
  handleListActivities,
  handleRecordAchievement,
  handleVerifyAchievement,
  handleGetMyAchievements,
  handleGetStudentAchievements,
};
