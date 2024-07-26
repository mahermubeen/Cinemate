import { useState, useEffect, useRef } from "react";
import { useBotStore } from "../store/chatbot";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatboxOpen, setChatboxOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const chatboxRef = useRef(null); // Reference to the chatbox element
  const { isLoading, chatBot } = useBotStore();

  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Handle sending message after speech ends
  useEffect(() => {
    if (!listening && message.trim() !== "" && !isTyping) {
      const sendTimeout = setTimeout(() => {
        handleSendMessage();
      }, 1000); // Delay to ensure user has stopped speaking

      return () => clearTimeout(sendTimeout);
    }
  }, [listening, message, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatboxRef.current && !chatboxRef.current.contains(event.target)) {
        setChatboxOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault(); // Prevent form submission if triggered by form submit
    if (message.trim() === "") return; // Don't send empty messages

    setLoading(true);
    chatBot({ message }).finally(() => {
      setLoading(false);
      resetTranscript(); // Clear the transcript after sending
      setMessage(""); // Clear the message input field
    });
  };

  const toggleChatbox = () => {
    setChatboxOpen(!chatboxOpen);
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
        className="fixed bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 border rounded-full w-16 h-16 bg-black hover:bg-gray-700 m-0 cursor-pointer border-gray-200 bg-none p-0 normal-case leading-5 hover:text-gray-900"
        type="button"
        aria-haspopup="dialog"
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
          className="fixed bottom-[calc(4rem+1.5rem)] right-0 mr-4 bg-white p-6 rounded-lg border border-[#e5e7eb] w-[440px] h-[634px]"
        >
          {/* Heading */}
          <div className="flex flex-col space-y-1.5 pb-6">
            <h2 className="font-semibold text-lg tracking-tight">CINEBOT</h2>
            <p className="text-sm text-[#6b7280] leading-3">
              Powered by OpenAi (GPT 3.5 Turbo)
            </p>
          </div>

          {/* Chat Container */}
          <div
            className="pr-4 h-[474px]"
            style={{ minWidth: "100%", display: "table" }}
          >
            {/* Chat Message AI */}
            <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
              <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                <div className="rounded-full bg-gray-100 border p-1">
                  <svg
                    stroke="none"
                    fill="black"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height="20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    ></path>
                  </svg>
                </div>
              </span>
              <p className="leading-relaxed">
                <span className="block font-bold text-gray-700">AI </span>Hi,
                how can I help you today?
              </p>
            </div>

            {/* User Chat Message */}
            <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
              <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                <div className="rounded-full bg-gray-100 border p-1">
                  <svg
                    stroke="none"
                    fill="black"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    height="20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"></path>
                  </svg>
                </div>
              </span>
              <p className="leading-relaxed">
                <span className="block font-bold text-gray-700">You </span>
                fewafef
              </p>
            </div>

            {/* AI Chat Message */}
            <div className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
              <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                <div className="rounded-full bg-gray-100 border p-1">
                  <svg
                    stroke="none"
                    fill="black"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    height="20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    ></path>
                  </svg>
                </div>
              </span>
              <p className="leading-relaxed">
                <span className="block font-bold text-gray-700">AI </span>
                Hi there! How can I assist you today?
              </p>
            </div>
          </div>

          {/* Input Section */}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Prevent form submission
              if (!isTyping) handleSendMessage(); // Handle sending the message
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 pr-2">
                <input
                  className="flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Send a message"
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setIsTyping(true); // Set typing status
                  }}
                  onBlur={() => setIsTyping(false)} // Clear typing status on blur
                  disabled={loading}
                />
              </div>
              <div className="flex gap-1">
                {/* Microphone/Stop Button */}
                <button
                  className={`inline-flex px-2 items-center justify-center text-sm font-medium rounded-md h-9 ${
                    listening ? "bg-red-500 animate-pulse" : "bg-black"
                  } text-white m-0 p-0 normal-case leading-5 border border-transparent hover:bg-${
                    listening ? "red-600" : "#0d0d0d"
                  } focus:outline-none disabled:pointer-events-none disabled:opacity-50`}
                  type="button"
                  onClick={handleStartListening}
                  disabled={loading}
                >
                  {listening ? (
                    // Stop Icon
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
                    // Microphone Icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#000000"
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

                {/* Send Button */}
                <button
                  className="inline-flex items-center px-2 justify-center text-sm font-medium rounded-md h-9 bg-black text-white m-0 p-0 normal-case leading-5 border border-transparent hover:bg-[#0d0d0d] focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
