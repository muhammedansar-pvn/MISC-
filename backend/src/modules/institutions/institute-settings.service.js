const InstituteSettings = require("./institute-settings.model");

const getInstituteSettings = async () => {
  let settings = await InstituteSettings.findOne()
    .populate("academicSettings.currentAcademicYearId", "yearName yearCode isCurrent status")
    .lean();

  if (!settings) {
    // Initialize default Markaz Sanaviyya record
    const created = await InstituteSettings.create({
      name: "Markaz Sanaviyya",
      code: "SANAVIYYA",
    });
    settings = await InstituteSettings.findById(created._id)
      .populate("academicSettings.currentAcademicYearId", "yearName yearCode isCurrent status")
      .lean();
  }

  return settings;
};

const updateInstituteSettings = async (updateData) => {
  let settings = await InstituteSettings.findOne();

  if (!settings) {
    settings = await InstituteSettings.create(updateData);
  } else {
    // Nested update merge for address, academicSettings, and branding
    if (updateData.address) {
      updateData.address = { ...(settings.address?.toObject?.() || settings.address || {}), ...updateData.address };
    }
    if (updateData.academicSettings) {
      updateData.academicSettings = {
        ...(settings.academicSettings?.toObject?.() || settings.academicSettings || {}),
        ...updateData.academicSettings,
      };
    }
    if (updateData.branding) {
      updateData.branding = {
        ...(settings.branding?.toObject?.() || settings.branding || {}),
        ...updateData.branding,
      };
    }

    Object.assign(settings, updateData);
    await settings.save();
  }

  return InstituteSettings.findById(settings._id)
    .populate("academicSettings.currentAcademicYearId", "yearName yearCode isCurrent status")
    .lean();
};

module.exports = {
  getInstituteSettings,
  updateInstituteSettings,
};
