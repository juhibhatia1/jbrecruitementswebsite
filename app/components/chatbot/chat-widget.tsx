"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  IoChatbubbles,
  IoClose,
  IoSend,
  IoSparkles,
  IoPersonCircle,
} from "react-icons/io5";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestedQuestions?: string[];
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Session ID and load conversation if exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      let activeSessionId = localStorage.getItem("jb_chat_session_id");
      if (!activeSessionId) {
        activeSessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        localStorage.setItem("jb_chat_session_id", activeSessionId);
      }
      setSessionId(activeSessionId);
    }
  }, []);

  // Scroll to bottom whenever messages or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Don't render on admin page paths
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message locally
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            suggestedQuestions: data.suggestedQuestions || [],
          },
        ]);
      } else {
        const errData = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errData.response || "Sorry, I am having trouble connecting to my server. Please try again in a few moments.",
            suggestedQuestions: [],
          },
        ]);
      }
    } catch (error) {
      console.error("Chat widgets error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Please check your internet connection.",
          suggestedQuestions: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const starterPrompts = [
    "What services do you offer?",
    "Tell me about the career services bundle",
    "Who is Juhi Bhatia?",
    "How can I book a resume review?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" style={{ fontFamily: "Raleway, sans-serif" }}>
      {/* ── CHAT PANEL ──────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[350px] sm:w-[390px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(37,55,77,0.15)] animate-slideUp">
          {/* Header */}
          <header className="flex items-center justify-between bg-[#252e3d] px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/logo.avif"
                  alt="Juhi Bhatia Logo"
                  className="h-8 w-8 rounded-full border border-white/20 bg-white"
                />
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5a58ab]">Assistant</h3>
                <h4 className="text-sm font-semibold leading-tight text-white/95">Juhi Bhatia Advisory</h4>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </header>

          {/* Messages Area */}
          <div 
            data-lenis-prevent
            className="flex-grow overflow-y-auto bg-slate-50/50 p-4 space-y-4 scrollbar-hide"
          >
            {messages.length === 0 && (
              <div className="space-y-4 py-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-3xs">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Hi there! 👋 I am the AI assistant for <strong>JB Recruitment Solutions</strong>.
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Ask me about our premium career services, CV rewrites, interview preparation, bundle deals, or pricing.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Suggested Questions:</p>
                  <div className="flex flex-col gap-2">
                    {starterPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="text-left w-full border border-slate-200 hover:border-[#5a58ab] hover:bg-[#5a58ab]/5 text-xs text-slate-600 font-semibold p-2.5 rounded-xl transition cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-2 max-w-[85%]`}>
                    {msg.role === "assistant" && (
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5a58ab] text-white">
                        <IoSparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`rounded-xl p-2 shadow-3xs border text-left ${
                        msg.role === "user"
                          ? "bg-[#252e3d] text-white border-slate-800 text-xs sm:text-sm leading-relaxed"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-xs sm:text-sm">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1.5 text-xs sm:text-sm">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1.5 text-xs sm:text-sm">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-[#252e3d]">{children}</strong>,
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#5a58ab] underline hover:text-[#4a489b] transition"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggested follow-up questions from bot reply */}
                {msg.role === "assistant" && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pl-8 pr-2 flex flex-col gap-2 pt-1.5">
                    {msg.suggestedQuestions.slice(0, 2).map((q, qidx) => (
                      <button
                        key={qidx}
                        onClick={() => handleSuggestionClick(q)}
                        className="text-left w-full bg-white border border-[#5a58ab]/30 hover:border-[#5a58ab] hover:bg-[#5a58ab]/5 text-[#5a58ab] text-xs font-semibold p-2.5 py-2 rounded-xl shadow-3xs transition cursor-pointer leading-normal"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5a58ab] text-white">
                    <IoSparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="rounded-2xl p-3 bg-white text-slate-400 border border-slate-100 flex gap-1 shadow-3xs items-center h-8">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <footer className="border-t border-slate-100 bg-white p-2.5 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-grow bg-slate-50 border border-slate-200 focus:bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl outline-none focus:border-[#5a58ab] text-slate-700 transition"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5a58ab] text-white transition hover:bg-[#4a489b] active:scale-95 disabled:opacity-40 disabled:hover:bg-[#5a58ab] cursor-pointer"
            >
              <IoSend className="w-4.5 h-4.5" />
            </button>
          </footer>
        </div>
      )}

      {/* ── FLOATING BUTTON ─────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5a58ab] text-white shadow-[0_4px_24px_rgba(90,88,171,0.4)] transition hover:bg-[#4a489b] hover:shadow-[0_6px_30px_rgba(90,88,171,0.5)] active:scale-95 cursor-pointer relative animate-fadeIn"
          title="Chat with us"
        >
          <IoChatbubbles className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
