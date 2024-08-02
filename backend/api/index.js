import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors"; // Import the cors package

import botRoutes from "../routes/chatbot.route.js";
import authRoutes from "../routes/auth.route.js";
import movieRoutes from "../routes/movie.route.js";
import tvRoutes from "../routes/tv.route.js";
import searchRoutes from "../routes/search.route.js";

import { ENV_VARS } from "../config/envVars.js";
import { connectDB } from "../config/db.js";
import { protectRoute } from "../middleware/protectRoute.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: "https://cinemate-eta.vercel.app", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow credentials (like cookies) to be sent
};

app.use(cors(corsOptions)); // Use CORS middleware

const PORT = ENV_VARS.PORT;
const __dirname = path.resolve();

app.use(express.json()); // Allow parsing of req.body
app.use(cookieParser());

app.use("/api/v1", botRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server started at http://localhost:" + PORT);
  connectDB();
});
