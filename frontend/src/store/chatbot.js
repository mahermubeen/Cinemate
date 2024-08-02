import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";

axios.baseURL = "https://cinemate-eta.vercel.app";

// Create a Zustand store
export const useBotStore = create((set) => ({
  // Initial state
  res: null,

  // API call for the chatbot
  chatBotApi: async (credentials) => {
    try {
      // Making an API call to the chatbot endpoint
      const response = await axios.post("/api/v1/chatbot", credentials);

      // Update the response state with the received reply
      set({ res: response.data.reply });
    } catch (error) {
      // Handle error and display a toast notification
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to fetch response from the server.");
      }
    }
  },
}));
