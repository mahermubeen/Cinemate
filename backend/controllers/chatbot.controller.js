import OpenAI from "openai";
import { ENV_VARS } from "../config/envVars.js";
const openai = new OpenAI({ apiKey: ENV_VARS.REACT_OPENAI_API_KEY });

export async function chatBot(req, res) {
  try {
    const { message } = req.body;
    console.log("message", message);

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Please ask Something!" });
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: message }],
      model: "gpt-3.5-turbo",
    });

    res.status(200).json({
      success: true,
      botRes: completion.choices[0].message.content,
    });
  } catch (error) {
    console.log("Error", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function voiceBot(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Please ask Something!" });
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: text }],
      model: "gpt-3.5-turbo",
    });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: completion.choices[0].message.content,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.status(200).json({
      success: true,
      botRes: buffer,
    });
  } catch (error) {
    console.log("Error", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
