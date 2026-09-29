const DownloadResource = require("./download-resource.model");

const createDownloadResource = async (data) => DownloadResource.create(data);
const getDownloadResources = async (filter = {}, pagination = null) => {
  if (pagination) {
    const [data, total] = await Promise.all([
      DownloadResource.find(filter).sort({ publishedAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
      DownloadResource.countDocuments(filter),
    ]);
    return { data, total };
  }
  return DownloadResource.find(filter).sort({ publishedAt: -1 }).lean();
};
const updateDownloadResource = async (id, data) =>
  DownloadResource.findByIdAndUpdate(id, data, { new: true });
const deleteDownloadResource = async (id) => DownloadResource.findByIdAndDelete(id);

module.exports = {
  createDownloadResource,
  getDownloadResources,
  updateDownloadResource,
  deleteDownloadResource,
};
