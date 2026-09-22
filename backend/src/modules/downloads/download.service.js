const DownloadResource = require("./download-resource.model");

const createDownloadResource = async (data) => DownloadResource.create(data);
const getDownloadResources = async (filter = {}) =>
  DownloadResource.find(filter).sort({ publishedAt: -1 }).lean();
const updateDownloadResource = async (id, data) =>
  DownloadResource.findByIdAndUpdate(id, data, { new: true });
const deleteDownloadResource = async (id) => DownloadResource.findByIdAndDelete(id);

module.exports = {
  createDownloadResource,
  getDownloadResources,
  updateDownloadResource,
  deleteDownloadResource,
};
