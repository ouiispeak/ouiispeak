"use client";

import { useEffect, useRef, useState } from "react";
import PaperCard from "@/components/ui/PaperCard";

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const createMessageId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString();

type RaichelHelpEditorProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RaichelHelpEditor({
  isOpen,
  onClose,
}: RaichelHelpEditorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!inputText.trim() || isSubmitting) return;

    const trimmedInput = inputText.trim();
    const historyPayload = messages.map(({ role, content }) => ({
      role,
      content,
    }));

    const userMessage: Message = {
      id: createMessageId(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/raichel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          history: historyPayload,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.reply) {
        const apiError =
          data?.error ||
          "Désolé, je ne peux pas répondre pour le moment. Réessayons dans un instant.";
        throw new Error(apiError);
      }

      const assistantMessage: Message = {
        id: createMessageId(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Erreur du chat Raichel:", err);
      const fallback =
        (err as Error)?.message ||
        "Désolé, je ne peux pas répondre pour le moment. Réessayons dans un instant.";
      setError(fallback);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: 'assistant',
          content: fallback,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (!chatHistoryRef.current) return;
    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
  }, [messages, isSubmitting]);

  if (!isOpen) return null;

  return (
    <PaperCard
      className="flex h-full w-full flex-col"
      style={{ backgroundColor: "#f0ede9" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xl font-normal text-[#222326]" style={{ fontFamily: 'var(--font-sans)' }}>Raichel</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
          aria-label="Fermer Raichel"
        >
          <XIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden gap-4 p-4">
        {/* Chat History */}
        <div 
          ref={chatHistoryRef}
          className="flex-1 overflow-y-auto rounded-lg bg-[#f4f2ee] px-4 py-4 md:px-6 md:py-6 lg:px-8 shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]"
        >
          {messages.length === 0 ? (
            <div className="text-sm text-[#222326] text-center py-8">
              <p>Commencez une conversation avec Raichel</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-[#2E8C8C] text-white'
                        : 'bg-[#e8e5e1] text-[#222326]'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="flex justify-start">
                  <div className="bg-[#e8e5e1] text-[#222326] rounded-lg px-4 py-2 text-sm">
                    Raichel réfléchit...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text Editor */}
        <div className="rounded-lg bg-[#f4f2ee] px-4 py-4 md:px-6 md:py-6 lg:px-8 shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message..."
            className="w-full h-24 resize-none rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8C8C] border-0"
            style={{ fontFamily: 'var(--font-sans)' }}
          />
        </div>

        {/* Submit Button */}
        <div className="rounded-lg bg-[#f4f2ee] px-4 py-4 md:px-6 md:py-6 lg:px-8 shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]">
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isSubmitting}
            className="w-full rounded-lg px-4 py-3 bg-[#2E8C8C] text-white hover:bg-[#257575] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-normal"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {isSubmitting ? "Envoi..." : "Envoyer"}
          </button>
          {error && (
            <div className="mt-3 rounded-md bg-[#fdecea] px-3 py-2 text-sm text-[#611a15]">
              {error}
            </div>
          )}
        </div>
      </div>
    </PaperCard>
  );
}
