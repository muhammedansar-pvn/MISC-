const disciplineService = require("./discipline.service");

const handleRecordIncident = async (req, res, next) => {
  try {
    const { studentId, incidentType } = req.body;
    if (!studentId || !incidentType) {
      return res.status(400).json({
        success: false,
        message: "studentId and incidentType are required",
      });
    }

    const record = await disciplineService.recordIncident(req.body, req.user);
    return res.status(201).json({
      success: true,
      message: "Disciplinary incident recorded successfully",
      data: record,
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

const handleResolveIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionRemarks } = req.body;

    const record = await disciplineService.resolveIncident(id, req.user, {
      resolutionRemarks,
    });

    return res.status(200).json({
      success: true,
      message: "Disciplinary incident resolved successfully",
      data: record,
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

const handleGetMyDisciplineRecords = async (req, res, next) => {
  try {
    if (!req.user.studentId) {
      return res.status(400).json({
        success: false,
        message: "No student profile associated with your account",
      });
    }

    const records = await disciplineService.getMyDisciplineRecords(req.user.studentId);
    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    return next(error);
  }
};

const handleGetStudentDisciplineRecords = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const records = await disciplineService.getStudentDisciplineRecords(studentId, req.user);
    return res.status(200).json({
      success: true,
      data: records,
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
  handleRecordIncident,
  handleResolveIncident,
  handleGetMyDisciplineRecords,
  handleGetStudentDisciplineRecords,
};
