import jwt from "jsonwebtoken";
import User from "../model/UserSchema.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]; // "Bearer TOKEN"
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
