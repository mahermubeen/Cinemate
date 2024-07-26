import express from "express";
import { chatBot, voiceBot } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/chat", chatBot);
router.post("/voice", voiceBot);

export default router;
