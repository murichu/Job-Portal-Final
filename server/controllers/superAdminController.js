import User from "../models/User.js";
import FileDownload from "../models/FileDownload.js";

export const getSystemOverview = async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const users = await User.countDocuments();
  const downloads = await FileDownload.countDocuments({ status: "success" });

  res.json({ success: true, users, downloads });
};
