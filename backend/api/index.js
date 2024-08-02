import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

import botRoutes from "../routes/chatbot.route.js";
import authRoutes from "../routes/auth.route.js";
import movieRoutes from "../routes/movie.route.js";
import tvRoutes from "../routes/tv.route.js";
import searchRoutes from "../routes/search.route.js";

import { ENV_VARS } from "../config/envVars.js";
import { connectDB } from "../config/db.js";
import { protectRoute } from "../middleware/protectRoute.js";

const app = express();

const PORT = ENV_VARS.PORT || 3000;

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", botRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);

// Serve static files in production
if (ENV_VARS.NODE_ENV === "production") {
  // Serve static files from the 'frontend/dist' directory
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  // Serve the main HTML file for any route not matched by the static files
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server started at http://localhost:" + PORT);
  connectDB();
});
