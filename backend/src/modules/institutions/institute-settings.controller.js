const instituteSettingsService = require("./institute-settings.service");

const handleGetInstituteSettings = async (req, res) => {
  try {
    const settings = await instituteSettingsService.getInstituteSettings();
    return res.status(200).json({
      success: true,
      message: "Institute settings retrieved successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Get Institute Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve institute settings",
    });
  }
};

const handleUpdateInstituteSettings = async (req, res) => {
  try {
    const updated = await instituteSettingsService.updateInstituteSettings(req.body);
    return res.status(200).json({
      success: true,
      message: "Institute settings updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Institute Settings Error:", error);
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update institute settings",
    });
  }
};

module.exports = {
  handleGetInstituteSettings,
  handleUpdateInstituteSettings,
};
