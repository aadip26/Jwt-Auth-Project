import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import auth from "../middleware/authmiddleware.js";

dotenv.config();
const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SIGNIN (sets cookie)
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // send as cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict",
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.json({ message: "Signin successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SIGNOUT (clears cookie)
router.post("/signout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Signed out successfully" });
});

// PROFILE (Protected)
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE NAME (Protected)
router.put("/update-name", auth, async (req, res) => {
    try {
        const { name } = req.body;
        await User.findByIdAndUpdate(req.user.id, { name });
        res.json({ message: "Name updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
