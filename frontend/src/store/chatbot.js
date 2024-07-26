import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";

export const useBotStore = create((set) => ({
  chatBot: async (credentials) => {
    try {
      console.log("hello", credentials);
      const response = await axios.post(
        "http://localhost:3000/api/v1/openai/chat",
        credentials
      );
      console.log("bot res in frontend", response.data);
      set({ res: response.data.botRes });
      //   toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response.data.message || "Openai API failed");
      set({ isLoading: false, res: null });
    }
  },
  voiceBot: async (credentials) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/openai/voice",
        credentials
      );
      set({ res: response.data.botRes });
      //   toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response.data.message || "Openai API failed");
      set({ isLoading: false, res: null });
    }
  },
}));
