import React, { useEffect, useRef } from "react";
import Message from "./Message";
import { Bot } from "lucide-react";
import "../../styles/chat.css";

function ChatBox({ messages = [], loading = false, forceScrollTop = false, className = "" }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  }, [messages, loading, forceScrollTop]);

  return (
    <div id="chat-scroll" ref={containerRef} className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-6 space-y-4 ${className}`.trim()}>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 my-12">
          <div className="w-12 h-12 rounded-2xl bg-[#7C5CFC]/20 text-[#A78BFA] border border-[#7C5CFC]/30 flex items-center justify-center mb-3">
            <Bot size={24} />
          </div>
          <p className="text-sm font-medium text-white">Ask anything about your resume</p>
          <p className="text-xs text-gray-500 max-w-xs mt-1">
            The AI RAG Assistant will search through your uploaded vector documents to answer.
          </p>
        </div>
      ) : (
        messages.map((message, index) => (
          <Message
            key={message.id ?? `${message.sender}-${message.time}-${index}`}
            sender={message.sender}
            text={message.text}
            time={message.time}
            retrievedFrom={message.retrievedFrom}
          />
        ))
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C5CFC] to-[#A78BFA] flex items-center justify-center text-white shrink-0">
            <Bot size={18} />
          </div>
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatBox;