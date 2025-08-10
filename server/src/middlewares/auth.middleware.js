import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Match property name with how you signed the token
    const user = await User.findById(decodedData.id); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
