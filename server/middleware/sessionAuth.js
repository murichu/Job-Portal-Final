import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const enforceSingleSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.activeSessionId !== decoded.sessionId) {
      return res.status(401).json({ message: "Session expired. Logged in elsewhere." });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
