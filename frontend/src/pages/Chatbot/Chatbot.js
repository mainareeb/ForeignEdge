/**
 * Chatbot.js
 * ==========
 * All responses come from POST /chat/query (Claude AI backend).
 * The original hardcoded botResponses dictionary is removed entirely.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { chatQuery } from "../../services/api";

const SUGGESTED_QUESTIONS = [
  "What are the requirements for a UK student visa?",
  "Which universities in Germany are tuition free?",
  "How do I apply for the Chevening Scholarship?",
  "What is the minimum IELTS score for Canada?",
  "How much money do I need to study in Australia?",
  "What is the Fulbright scholarship deadline?",
  "How to apply for DAAD scholarship from Pakistan?",
  "What is the HEC overseas scholarship eligibility?",
  "Which country is easiest for Pakistani student visa?",
  "What are the top universities in USA for CS?",
];

const CSS = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-6px); }
}
.chat-msg { animation: fadeInUp 0.3s ease both; }
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #4a9eda; display: inline-block; margin: 0 2px;
  animation: bounce 1.2s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }
`;

function TypingIndicator() {
  return (
    <div
      className="chat-msg"
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#1a2e4a,#4a9eda)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        🤖
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e9f0",
          borderRadius: "16px 16px 16px 4px",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Assalam-o-Alaikum! 👋 I'm the ForeignEdge AI Assistant. I can help you with universities, scholarships, visas, SOPs, and more. What would you like to know?",
      time: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      setError(null);
      setInput("");
      setMessages((prev) => [
        ...prev,
        { role: "user", text: msg, time: new Date().toISOString() },
      ]);
      setLoading(true);

      // Build history for conversation memory
      const history = messages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      try {
        const res = await chatQuery({ message: msg, history });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              res.data?.reply ||
              "Sorry, I couldn't generate a response. Please try again.",
            time: new Date().toISOString(),
            profileUsed: res.data?.profile_used || false,
          },
        ]);
      } catch (err) {
        setError(err.message || "AI service unavailable. Please try again.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "⚠️ I'm temporarily unavailable. Please check your connection and try again.",
            time: new Date().toISOString(),
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, messages],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <style>{CSS}</style>
      <Navbar />
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 80px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#1a2e4a,#2a6496)",
            borderRadius: "14px 14px 0 0",
            padding: "18px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                ForeignEdge AI Assistant
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Powered by Claude · Real AI responses
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([
                {
                  role: "assistant",
                  text: "Chat cleared. How can I help?",
                  time: new Date().toISOString(),
                },
              ]);
              setError(null);
            }}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Clear
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f0f4f8",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Suggested questions — shown only on fresh chat */}
          {messages.length === 1 && (
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 12,
                  color: "#888",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 10,
                }}
              >
                Suggested questions
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    style={{
                      background: "#fff",
                      border: "1.5px solid #d0dde8",
                      borderRadius: 20,
                      padding: "6px 14px",
                      fontSize: 13,
                      color: "#1a2e4a",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#1a2e4a";
                      e.target.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#fff";
                      e.target.style.color = "#1a2e4a";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className="chat-msg"
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "linear-gradient(135deg,#1a2e4a,#4a9eda)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  🤖
                </div>
              )}
              <div style={{ maxWidth: "76%" }}>
                <div
                  style={{
                    background:
                      msg.role === "user"
                        ? "#1a2e4a"
                        : msg.isError
                          ? "#fef2f2"
                          : "#fff",
                    color:
                      msg.role === "user"
                        ? "#fff"
                        : msg.isError
                          ? "#dc2626"
                          : "#1a1a2e",
                    border:
                      msg.role === "user"
                        ? "none"
                        : msg.isError
                          ? "1px solid #fca5a5"
                          : "1px solid #e0e9f0",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    padding: "12px 16px",
                    fontSize: 14,
                    lineHeight: 1.6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    marginTop: 4,
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}
                >
                  {formatTime(msg.time)}
                </div>
              </div>
              {msg.role === "user" && (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "#e0e9f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  👤
                </div>
              )}
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              borderLeft: "4px solid #dc2626",
              padding: "10px 16px",
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {/* Input */}
        <div
          style={{
            background: "#fff",
            borderRadius: "0 0 14px 14px",
            borderTop: "1px solid #e0e9f0",
            padding: "14px 16px",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 1000))}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about studying abroad..."
              rows={2}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #d0dde8",
                borderRadius: 10,
                fontSize: 14,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                lineHeight: 1.5,
              }}
              disabled={loading}
            />
            <span
              style={{
                position: "absolute",
                bottom: 8,
                right: 12,
                fontSize: 11,
                color: input.length > 900 ? "#e65100" : "#ccc",
              }}
            >
              {input.length}/1000
            </span>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? "#c8d8e8" : "#1a2e4a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "0 20px",
              height: 48,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 15,
              transition: "background 0.2s",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "#aaa",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Responses are AI-generated. Always verify visa rules and deadlines
          from official sources.
        </p>
      </div>
    </>
  );
}
