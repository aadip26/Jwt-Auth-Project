import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"


dotenv.config();
const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.send("OK");
  });
  

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB connected"))
    .catch(err => console.log(" MongoDB error:", err));

// Routes
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
