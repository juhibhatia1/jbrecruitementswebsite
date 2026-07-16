"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  IoChatbubbles,
  IoClose,
  IoSend,
  IoSparkles,
  IoRefreshOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import { detectCurrencyFromBrowser } from "@/lib/geo-utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestedQuestions?: string[];
  isError?: boolean;
  isStreaming?: boolean;
}

export default function ChatWidget() {
  const pathname = usePathname();

  // Hide ChatWidget on admin and employee portals
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/employee")) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize a fresh Session ID on every website load
  useEffect(() => {
    const activeSessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    setSessionId(activeSessionId);
  }, []);

  // Scroll to bottom whenever messages or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Don't render on admin page paths
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSendMessage = async (text: string, isRetry = false) => {
    if (!text.trim() || isLoading) return;

    let currentMessages = [...messages];
    if (isRetry) {
      // Remove last assistant message if it was an error
      if (
        currentMessages.length > 0 &&
        currentMessages[currentMessages.length - 1].role === "assistant" &&
        currentMessages[currentMessages.length - 1].isError
      ) {
        currentMessages.pop();
      }
    } else {
      currentMessages.push({ role: "user", content: text });
    }

    setMessages(currentMessages);
    setInputValue("");
    setIsLoading(true);

    const updatedWithPlaceholder = [
      ...currentMessages,
      { role: "assistant" as const, content: "", isStreaming: true }
    ];

    setMessages(updatedWithPlaceholder);
    setInputValue("");
    setIsLoading(true);

    try {
      // Retrieve the cached geo-detected currency from sessionStorage, with a browser fallback.
      const browserCurrency = detectCurrencyFromBrowser();
      const detectedCurrency =
        typeof window !== "undefined"
          ? (() => {
              const cachedCurrency = sessionStorage.getItem("jb_currency_v3");
              if (browserCurrency !== "USD") {
                sessionStorage.setItem("jb_currency_v3", browserCurrency);
                return browserCurrency;
              }
              return cachedCurrency || "USD";
            })()
          : "USD";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          currency: detectedCurrency,
        }),
      });

      if (response.status === 429) {
        setMessages((prev) => {
          const next = [...prev];
          const idx = next.map((m) => m.role).lastIndexOf("assistant");
          if (idx !== -1) {
            next[idx] = {
              role: "assistant",
              content: "You are asking questions a bit too fast! Please wait a moment and try again.",
              isError: true,
            };
          }
          return next;
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader found.");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";
      let parsedText = "";
      let hasReceivedTokens = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process by lines (Server-Sent Events are separated by newlines)
        const lines = buffer.split("\n");
        // Save the last potentially incomplete line back to the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const sseData = trimmed.slice(6); // remove "data: "
          if (!sseData) continue;

          try {
            const parsedChunk = JSON.parse(sseData);
            const rawChunk = parsedChunk.chunk || "";
            
            // Accumulate raw text tokens
            accumulatedText += rawChunk;

            // Extract response text and questions dynamically
            const { content: currentParsedText, suggestedQuestions } = parseStreamedMessage(accumulatedText);
            
            if (currentParsedText || accumulatedText) {
              if (!hasReceivedTokens) {
                hasReceivedTokens = true;
                setIsLoading(false); // Disable initial typing indicators once tokens start rendering
              }
              parsedText = currentParsedText;
              setMessages((prev) => {
                const next = [...prev];
                const idx = next.map((m) => m.role).lastIndexOf("assistant");
                if (idx !== -1) {
                  next[idx] = {
                    role: "assistant",
                    content: parsedText || accumulatedText,
                    suggestedQuestions: suggestedQuestions,
                    isStreaming: !accumulatedText.includes("[Suggested Questions]:"),
                  };
                }
                return next;
              });
            }
          } catch (e) {
            console.error("Error parsing SSE line:", trimmed, e);
          }
        }
      }

      // Finish decoding any remaining stream data
      const finalChunk = decoder.decode();
      buffer += finalChunk;
      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const sseData = trimmed.slice(6);
            try {
              const parsedChunk = JSON.parse(sseData);
              accumulatedText += (parsedChunk.chunk || "");
            } catch (e) {
              console.error("Error parsing final SSE line:", trimmed, e);
            }
          }
        }
      }

      const { content: finalContent, suggestedQuestions: finalSuggestedQuestions } = parseStreamedMessage(accumulatedText);
      setMessages((prev) => {
        const next = [...prev];
        const idx = next.map((m) => m.role).lastIndexOf("assistant");
        if (idx !== -1) {
          next[idx] = {
            role: "assistant",
            content: finalContent || accumulatedText,
            suggestedQuestions: finalSuggestedQuestions,
          };
        }
        return next;
      });
    } catch (error) {
      console.error("Chat widgets error sending message:", error);
      setMessages((prev) => {
        const next = [...prev];
        const idx = next.map((m) => m.role).lastIndexOf("assistant");
        if (idx !== -1) {
          next[idx] = {
            role: "assistant",
            content: "Sorry, I am having trouble connecting to the server. Please check your internet connection.",
            isError: true,
          };
        }
        return next;
      });
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

  const handleRetry = () => {
    // Find last user message
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;
    const lastUserPrompt = userMsgs[userMsgs.length - 1].content;
    handleSendMessage(lastUserPrompt, true);
  };

  const handleResetChat = () => {
    const newSessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem("jb_chat_session_id", newSessionId);
    localStorage.removeItem(`jb_chat_history_${sessionId}`);
    setSessionId(newSessionId);
    setMessages([]);
  };

  const starterPrompts = [
    "What specific career consulting packages do you offer to help job seekers stand out?",
    "Can you explain the details, services, and savings included in the All Career Services Bundle?",
    "Could you tell me more about Juhi Bhatia's professional background and coaching philosophy?",
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
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <IoRefreshOutline className="h-4.5 w-4.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>
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
                    Hi there! I am the AI assistant for <strong>JB Recruitment Solutions</strong>.
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Ask me about our premium career services, CV rewrites, interview preparation, bundle deals, or pricing.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Suggested Questions:</p>
                  <div className="flex flex-col items-start gap-2">
                    {starterPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="text-left w-fit border border-slate-200 hover:border-[#5a58ab] hover:bg-[#5a58ab]/5 text-xs text-slate-600 font-semibold p-2.5 rounded-xl transition cursor-pointer"
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
                          : msg.isError
                          ? "bg-red-50 text-red-700 border-red-200 text-xs sm:text-sm leading-relaxed"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : msg.content === "" && isLoading ? (
                        <TypingLoader />
                      ) : (
                        <div className="space-y-2">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-xs sm:text-sm">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1.5 text-xs sm:text-sm">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1.5 text-xs sm:text-sm">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-bold text-[#252e3d]">{children}</strong>,
                              a: ({ href, children }) => {
                                const isLocal = href?.startsWith("/");
                                if (isLocal) {
                                  return (
                                    <a
                                      href={href}
                                      className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1.5 bg-[#5a58ab] text-white font-bold text-[11px] rounded-lg shadow-[0_2px_8px_rgba(90,88,171,0.2)] hover:bg-[#4a489b] active:scale-95 transition text-center no-underline border border-[#5a58ab]/10"
                                    >
                                      {children}
                                      <IoArrowForwardOutline className="w-3 h-3" />
                                    </a>
                                  );
                                }
                                return (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#5a58ab] underline hover:text-[#4a489b] transition"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>

                          {msg.isError && (
                            <button
                              onClick={handleRetry}
                              className="mt-2 flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 transition cursor-pointer active:scale-95"
                            >
                              Retry Message
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggested follow-up questions from bot reply */}
                {msg.role === "assistant" && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && !msg.isStreaming && (
                  <div className="pl-8 pr-2 flex flex-col items-start gap-2 pt-1.5 animate-fadeIn">
                    {msg.suggestedQuestions.slice(0, 1).map((q, qidx) => (
                      <button
                        key={qidx}
                        onClick={() => handleSuggestionClick(q)}
                        className="text-left w-fit bg-white border border-[#5a58ab]/30 hover:border-[#5a58ab] hover:bg-[#5a58ab]/5 text-[#5a58ab] text-xs font-semibold p-2.5 py-2 rounded-xl shadow-3xs transition cursor-pointer leading-normal"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing indicator (for fallback or initial states) */}
            {isLoading && (messages.length === 0 || (messages.length > 0 && messages[messages.length - 1].role === "user")) && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5a58ab] text-white">
                    <IoSparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="rounded-2xl p-3 bg-white text-slate-400 border border-slate-100 flex gap-1 shadow-3xs items-center h-8">
                    <TypingLoader />
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

// Helper to parse response text and suggested questions from plain text stream using delimiter
function parseStreamedMessage(text: string): { content: string; suggestedQuestions: string[] } {
  const delimiter = "[Suggested Questions]:";
  const index = text.indexOf(delimiter);
  if (index === -1) {
    return { content: text, suggestedQuestions: [] };
  }

  const content = text.slice(0, index).trim();
  const rawQuestions = text.slice(index + delimiter.length);
  const suggestedQuestions = rawQuestions
    .split("|")
    .map((q) => q.trim())
    .filter(Boolean);

  return {
    content,
    suggestedQuestions,
  };
}

function TypingLoader() {
  return (
    <div className="flex gap-1 items-center h-5 px-1">
      <span className="inline-block w-1.5 h-1.5 bg-[#5a58ab] rounded-full animate-loader-bounce" style={{ animationDelay: "0ms" }} />
      <span className="inline-block w-1.5 h-1.5 bg-[#5a58ab] rounded-full animate-loader-bounce" style={{ animationDelay: "150ms" }} />
      <span className="inline-block w-1.5 h-1.5 bg-[#5a58ab] rounded-full animate-loader-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

