import React, { useState } from "react";
import { Send } from "lucide-react";

function ChatInput({ onSendMessage, loading = false, className = "" }) {
  const [input, setInput] = useState("");

  const quickPrompts = [
    "What missing keywords should I add?",
    "Summarize my experience section",
    "Tailor resume for Senior Full Stack Engineer",
    "How to improve my ATS score?"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (input.trim() && !loading) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (!loading) {
      onSendMessage(prompt);
    }
  };

  return (
    <div className={`shrink-0 p-4 border-t border-white/10 bg-[#111827]/80 backdrop-blur-md ${className}`.trim()}>
      {/* Quick Prompts Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={loading}
            className="bg-[#7C5CFC]/10 border border-[#7C5CFC]/25 text-[#A78BFA] hover:bg-[#7C5CFC]/25 hover:border-[#A78BFA]/50 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask RAG Assistant about your resume..."
          disabled={loading}
          className="w-full bg-[#1A1F35] text-sm text-white placeholder-gray-400 pl-4 pr-12 py-3.5 rounded-xl border border-white/10 focus:border-[#7C5CFC] transition-all outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2.5 p-2 rounded-lg bg-[#7C5CFC] text-white hover:bg-[#6D4FF5] disabled:opacity-40 transition-all shadow-md shadow-[#7C5CFC]/20"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export default ChatInput;