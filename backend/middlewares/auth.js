import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    try {
        if (!token) {
            return res.json({ success: false, message: "No token provided" });
        }

        // Remove Bearer
        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        req.user = user;

        next(); // ✅ required

    } catch (error) {
        res.json({ success: false, message: "Not authorized, token failed" });
    }
};