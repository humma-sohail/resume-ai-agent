import React from "react";
import { Bot, User, FileText } from "lucide-react";

function Message({ sender, text, time, retrievedFrom }) {
  const isAI = sender === "AI" || sender === "bot";

  return (
    <div
      className={`flex gap-3 my-3 ${
        isAI ? "justify-start" : "justify-end"
      }`}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="w-9 h-9 rounded-xl bg-[#7C5CFC]/20 text-[#A78BFA] border border-[#7C5CFC]/30 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={18} />
        </div>
      )}

      {/* Message Body */}
      <div
        className={`p-4 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
          isAI
            ? "bg-[#1A1F35] text-gray-200 border border-white/10 rounded-tl-none shadow-md"
            : "bg-[#7C5CFC] text-white font-medium rounded-tr-none shadow-lg shadow-[#7C5CFC]/20"
        }`}
      >
        <p className="whitespace-pre-line">{text}</p>

        {/* Vector Search Context Source Badge (If RAG retrieved sources) */}
        {retrievedFrom && isAI && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-[#A78BFA]">
            <FileText size={12} className="shrink-0" />
            <span className="opacity-80">Retrieved from:</span>
            <span className="font-mono font-medium underline underline-offset-2">
              {retrievedFrom}
            </span>
          </div>
        )}

        {/* Timestamp */}
        {time && (
          <div
            className={`mt-1.5 text-[10px] text-right ${
              isAI ? "text-gray-500" : "text-white/70"
            }`}
          >
            {time}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAI && (
        <div className="w-9 h-9 rounded-xl bg-white/10 text-gray-300 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
          <User size={18} />
        </div>
      )}
    </div>
  );
}

export default Message;