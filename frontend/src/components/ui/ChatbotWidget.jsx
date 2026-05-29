import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../lib/api";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm **Tenty**, your smart municipal assistant. How can I help you today? You can ask me to track your active complaints or explain our city guidelines!",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText("");

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chatbot`, {
        message: text,
        userId: user?.user_id || null,
      });

      const replyText = response.data?.data?.response || "I didn't quite get that. Let's try again!";
      setMessages((prev) => [...prev, { sender: "bot", text: replyText }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ I'm having a slight trouble connecting to my central network. Please try again in a few seconds!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionText) => {
    handleSend(actionText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 animate-bounce"
        >
          <span className="text-3xl">💬</span>
        </button>
      )}

      {/* Chat Box Container */}
      {isOpen && (
        <div className="w-[380px] h-[520px] bg-white/95 backdrop-blur-md rounded-2xl shadow-3xl border border-orange-100 flex flex-col overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                🤖
              </div>
              <div>
                <h4 className="font-bold text-base leading-tight">Tenty</h4>
                <span className="text-xs text-orange-100 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  Online AI Assistant
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl p-1 transition"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${
                    m.sender === "user"
                      ? "bg-orange-500 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions Panel */}
          <div className="px-4 py-2 bg-orange-50/10 border-t border-gray-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => handleQuickAction("What is the status of my complaints?")}
              className="text-xs bg-orange-100/60 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200/50 font-medium transition"
            >
              📋 Track Complaints
            </button>
            <button
              onClick={() => handleQuickAction("What are TattleTent's SLA rules?")}
              className="text-xs bg-orange-100/60 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200/50 font-medium transition"
            >
              ⚡ SLA Guidelines
            </button>
            <button
              onClick={() => handleQuickAction("Explain submitting a new complaint")}
              className="text-xs bg-orange-100/60 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200/50 font-medium transition"
            >
              ✍️ Lodge Help
            </button>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Tenty anything..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2.5 transition flex items-center justify-center shadow-md active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 transform rotate-90"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
