import { useState, useEffect, useRef } from "react";
import { useBotStore } from "../store/chatbot";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import toast from "react-hot-toast";

const Chatbot = () => {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const endOfMessagesRef = useRef(null);

  const [message, setMessage] = useState("");
  const [chatboxOpen, setChatboxOpen] = useState(false);
  const [responseMode, setResponseMode] = useState("text"); // "text" or "audio"
  const [chatHistory, setChatHistory] = useState([]); // Array to store chat messages
  const [voiceGender, setVoiceGender] = useState("male"); // Array to store chat messages
  const chatboxRef = useRef(null); // Reference to the chatbox element
  const buttonRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat history whenever chatHistory changes
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const models = [
    "GPT-2 Medium",
    "GPT-2 Large",
    "GPT-2 XL",
    "GPT-3.5 Turbo",
    "GPT-Neo 1.3B",
    "GPT-Neo 2.7B",
    "GPT-J 6B",
    "GPT-3",
    "BERT Base",
    "BERT Large",
    "RoBERTa Base",
    "RoBERTa Large",
    "DistilBERT",
    "T5 Base",
    "T5 Large",
    "T5 XL",
    "BLOOM-560M",
    "BLOOM-1B",
    "BLOOM-3B",
    "BLOOM-7B",
    "BLOOM-175B",
  ];
  const [selectedModel, setSelectedModel] = useState(models[0]);

  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    const checkModelStatus = async () => {
      try {
        const response = await axios.get("/api/v1/modelStatus");
        console.log("model status: ", response.data.ready);

        if (response.data.ready) {
          setIsLoading(false);
          clearInterval(interval);
        } else {
          setIsLoading(true);
        }
      } catch (error) {
        console.error("Error fetching model status:", error);
      }
    };

    checkModelStatus(); // Initial check

    const interval = setInterval(checkModelStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, []);

  // Update message with transcript when speaking
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Handle sending message after speech ends
  useEffect(() => {
    if (!listening) {
      // Only send if the message is not typed
      const sendTimeout = setTimeout(() => {
        handleSendMessage();
      }, 1000); // Delay to ensure user has stopped speaking

      return () => clearTimeout(sendTimeout);
    }
  }, [listening]);

  // Close chatbox on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatboxRef.current &&
        !chatboxRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setChatboxOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleResponseMode = () => {
    setResponseMode(responseMode === "text" ? "audio" : "text");
  };

  const speakText = (text) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis
      .getVoices()
      .find((voice) =>
        voice.name.toLowerCase().includes(voiceGender.toLowerCase())
      );

    speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault(); // Prevent form submission if triggered by form submit
    if (message.trim() === "") return; // Don't send empty messages

    // Add user message to chat history
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { type: "user", text: message },
    ]);

    setLoading(true);

    try {
      // Get the chatBotApi function from the Zustand store
      const { chatBotApi } = useBotStore.getState();

      // Send message to API
      await chatBotApi({ message, model: selectedModel });

      // Get the updated response from the store
      const { res: botResponse } = useBotStore.getState();

      // Check if the botResponse is defined
      if (botResponse) {
        // Add AI response to chat history
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { type: "bot", text: botResponse },
        ]);

        if (responseMode === "audio") {
          // Convert the response text to speech
          speakText(botResponse);
        }
      } else {
        console.error("Bot response is undefined");
      }
    } catch (error) {
      toast.error("Failed to get response from the chatbot");
    } finally {
      setLoading(false);
      resetTranscript(); // Clear the transcript after sending
      setMessage(""); // Clear the message input field
    }
  };

  // Function to handle opening and closing the chatbox
  const toggleChatbox = () => {
    setChatboxOpen((prevState) => !prevState);
  };

  const handleStartListening = () => {
    if (listening) {
      SpeechRecognition.stopListening(); // Stop listening if already active
    } else {
      SpeechRecognition.startListening({ continuous: false }); // Start listening
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <button
        className="fixed z-20 bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-16 h-16 bg-black hover:bg-gray-700 m-0 cursor-pointer border-gray-200 bg-none p-0 normal-case leading-5 hover:text-gray-900"
        type="button"
        aria-haspopup="dialog"
        ref={buttonRef}
        aria-expanded={chatboxOpen}
        onClick={toggleChatbox}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white block border-gray-200 align-middle"
        >
          <path
            d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"
            className="border-gray-200"
          ></path>
        </svg>
      </button>

      {chatboxOpen && (
        <div
          ref={chatboxRef}
          style={{
            boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)",
          }}
          className="fixed z-20 bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[440px] h-[634px]"
        >
          {/* Heading */}
          <div className="flex flex-col space-y-1.5">
            <h2 className="font-semibold text-lg tracking-tight">CINEBOT</h2>
            <p className="text-sm text-[#6b7280]">
              Powered by HuggingFace
              <br /> Model ({selectedModel})
            </p>
          </div>

          {/* Chat Container */}
          <div
            className="pr-4 h-[414px] max-h-[414px] mb-[60px] overflow-y-auto scrollbar-ok"
            style={{ minWidth: "100%" }}
          >
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex gap-3 my-4 text-sm flex-1 ${
                  chat.type === "user"
                    ? "flex-row-reverse text-black"
                    : "text-gray-600"
                }`}
              >
                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                  <div className="rounded-full bg-gray-100 border p-1">
                    {chat.type === "user" ? (
                      <svg
                        stroke="none"
                        fill="black"
                        strokeWidth="0"
                        viewBox="0 0 16 16"
                        height="20"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                        <path d="M8 9a7 7 0 0 0-5.468 2.635c.274 2.282 4.694 2.365 5.468 2.365s5.193-.083 5.468-2.365A7 7 0 0 0 8 9z"></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-robot"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          fill="#f0f0f0"
                          stroke="black"
                          strokeWidth="2"
                        />
                        <circle cx="9" cy="10" r="1.5" fill="black" />
                        <circle cx="15" cy="10" r="1.5" fill="black" />
                        <line
                          x1="12"
                          y1="3"
                          x2="12"
                          y2="7"
                          stroke="black"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="3" r="1" fill="black" />
                        <path
                          d="M9 15c1 1 2 1 3 1s2 0 3-1"
                          stroke="black"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </div>
                </span>
                <p
                  className={`leading-5 border border-[#e5e7eb] rounded-md p-4 bg-gray-50 py-1 px-2 ${
                    chat.type === "user" ? "text-black" : "text-gray-600"
                  }`}
                >
                  {chat.text}
                </p>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Audio Mode Toggle */}
          <div className="flex items-center my-4 absolute left-0 bottom-[60px] ml-4">
            <label
              htmlFor="responseMode"
              className="mr-2 text-sm font-medium text-gray-700"
            >
              Response Mode:
            </label>
            <button
              id="responseMode"
              className="px-3 py-1 rounded-full border border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
              onClick={toggleResponseMode}
            >
              {responseMode === "text" ? "Text" : "Audio"}
            </button>
          </div>

          {/* Model Selection Dropdown */}
          <div className="absolute top-[42px] right-0 mr-[30px]">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Form Input */}
          {isLoading ? (
            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm outline-none"
                placeholder="Loading model, please wait..."
                disabled={isLoading}
              />
              <button
                type="button"
                className={`inline-flex px-2 items-center justify-center text-sm font-medium rounded-md h-9 ${
                  listening ? "bg-red-500 animate-pulse" : "bg-black"
                } text-white m-0 p-0 normal-case leading-5 border border-transparent hover:bg-${
                  listening ? "red-600" : "#0d0d0d"
                } focus:outline-none disabled:pointer-events-none disabled:opacity-50`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  className="h-5 w-5"
                  version="1.1"
                  viewBox="0 0 512 512"
                  enableBackground="new 0 0 512 512"
                >
                  <g>
                    <g>
                      <path
                        d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z"
                        fill="white"
                      />
                      <path
                        d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z"
                        fill="white"
                      />
                    </g>
                  </g>
                </svg>
              </button>
              <button
                type="submit"
                className="inline-flex items-center cursor-pointer justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black"
                disabled={isLoading}
              >
                Send
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendMessage}>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  // className="block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm outline-none"
                  className={`block w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm outline-none ${
                    loading ? "color-gray-300 animate-pulse" : "color-black"
                  }`}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button
                  type="button"
                  className={`inline-flex px-2 items-center justify-center text-sm font-medium rounded-md h-9 ${
                    listening ? "bg-red-500 animate-pulse" : "bg-black"
                  } text-white m-0 p-0 normal-case leading-5 border border-transparent hover:bg-${
                    listening ? "red-600" : "#0d0d0d"
                  } focus:outline-none disabled:pointer-events-none disabled:opacity-50`}
                  onClick={handleStartListening}
                >
                  {listening ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h12v12H6z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="white"
                      className="h-5 w-5"
                      version="1.1"
                      viewBox="0 0 512 512"
                      enableBackground="new 0 0 512 512"
                    >
                      <g>
                        <g>
                          <path
                            d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z"
                            fill="white"
                          />
                          <path
                            d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z"
                            fill="white"
                          />
                        </g>
                      </g>
                    </svg>
                  )}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  disabled={loading || listening}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
