import axios from "axios";
import { ENV_VARS } from "../config/envVars.js";

const HUGGING_FACE_API_KEY = ENV_VARS.REACT_HFT_API_KEY;
const API_URL = "https://api-inference.huggingface.co/models/gpt2-medium";
const MODELS = [
  {
    name: "GPT-2 Medium",
    url: "https://api-inference.huggingface.co/models/gpt2-medium",
  },
  {
    name: "GPT-2 Large",
    url: "https://api-inference.huggingface.co/models/gpt2-large",
  },
  {
    name: "GPT-2 XL",
    url: "https://api-inference.huggingface.co/models/gpt2-xl",
  },
  {
    name: "GPT-3.5 Turbo",
    url: "https://api-inference.huggingface.co/models/openai-gpt3.5-turbo",
  },
  {
    name: "GPT-Neo 1.3B",
    url: "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-1.3B",
  },
  {
    name: "GPT-Neo 2.7B",
    url: "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B",
  },
  {
    name: "GPT-J 6B",
    url: "https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B",
  },
  {
    name: "GPT-3",
    url: "https://api-inference.huggingface.co/models/openai-gpt3",
  },
  {
    name: "BERT Base",
    url: "https://api-inference.huggingface.co/models/bert-base-uncased",
  },
  {
    name: "BERT Large",
    url: "https://api-inference.huggingface.co/models/bert-large-uncased",
  },
  {
    name: "RoBERTa Base",
    url: "https://api-inference.huggingface.co/models/roberta-base",
  },
  {
    name: "RoBERTa Large",
    url: "https://api-inference.huggingface.co/models/roberta-large",
  },
  {
    name: "DistilBERT",
    url: "https://api-inference.huggingface.co/models/distilbert-base-uncased",
  },
  {
    name: "T5 Base",
    url: "https://api-inference.huggingface.co/models/t5-base",
  },
  {
    name: "T5 Large",
    url: "https://api-inference.huggingface.co/models/t5-large",
  },
  { name: "T5 XL", url: "https://api-inference.huggingface.co/models/t5-xl" },
  {
    name: "BLOOM-560M",
    url: "https://api-inference.huggingface.co/models/bigscience/bloom-560m",
  },
  {
    name: "BLOOM-1B",
    url: "https://api-inference.huggingface.co/models/bigscience/bloom-1b",
  },
  {
    name: "BLOOM-3B",
    url: "https://api-inference.huggingface.co/models/bigscience/bloom-3b",
  },
  {
    name: "BLOOM-7B",
    url: "https://api-inference.huggingface.co/models/bigscience/bloom-7b",
  },
  {
    name: "BLOOM-175B",
    url: "https://api-inference.huggingface.co/models/bigscience/bloom",
  },
];

const MAX_RETRIES = 3; // Max retry attempts for the query function
const RETRY_DELAY = 5; // Seconds to wait before retrying the query
const LOAD_MODEL_RETRY_DELAY = 5; // Seconds to wait before retrying the model load

let modelLoaded = false;

async function loadModel() {
  while (!modelLoaded) {
    try {
      const response = await axios.post(
        API_URL,
        { inputs: "dummy input" },
        {
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Model loaded successfully:", response.data);
      modelLoaded = true;
    } catch (error) {
      console.error("Error loading model, retrying...", error);
      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, LOAD_MODEL_RETRY_DELAY * 1000)
      );
    }
  }
}

export async function modelStatus(req, res) {
  res.json({ ready: modelLoaded });
}

async function query(model, data) {
  // Find the model URL from the model name
  const modelName = MODELS.find((m) => m.name === model);
  if (!modelName) {
    throw new Error("Model not found");
  }

  // Ensure the model is loaded before making a query
  if (!modelLoaded) {
    await loadModel();
  }

  let retryCount = 0;
  while (retryCount < MAX_RETRIES) {
    try {
      const response = await axios.post(modelName.url, data, {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 503) {
        modelLoaded = false;
        const delay = error.response.data.estimated_time || RETRY_DELAY;
        console.log(`Model is loading. Retrying in ${delay} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        retryCount++;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Maximum retry attempts exceeded.");
}

export async function chatBot(req, res) {
  try {
    const { message, model } = req.body;
    console.log(message, model);
    const result = await query(model, { inputs: message });
    const generatedText = result[0]?.generated_text;
    console.log("generatedText", generatedText);
    if (!generatedText) {
      return res
        .status(503)
        .json({ error: "Model is still loading. Please try again later." });
    }

    // Clean the response to avoid repetition
    const cleanText = cleanResponse(message, generatedText);

    res.json({ reply: cleanText });
  } catch (error) {
    console.error("Error in chatBot:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
}

function cleanResponse(inputText, outputText) {
  // Check if the output contains the input and remove the repetition
  if (outputText.startsWith(inputText)) {
    return outputText.slice(inputText.length).trim();
  }
  return outputText.trim();
}

// Load the model when the server starts
loadModel();
