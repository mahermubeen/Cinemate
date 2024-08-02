import express from "express";
import { chatBot, modelStatus } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/chatbot", chatBot);
router.get("/modelStatus", modelStatus);

export default router;
