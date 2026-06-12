import { useEffect, useRef, useState } from "react";

import { useBurnout } from "@/lib/burnout-store";
import { getBotReply } from "@/lib/chatbot";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm your BurnoutGuard assistant. Ask me about your risk score, today's priorities, or tips to manage your workload. 🌱",
};

export function useChatbotMessages(scrollDep?: unknown) {
  const { risk, activities, checkIn } = useBurnout();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, scrollDep]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };
    const botMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "bot",
      text: getBotReply(trimmed, { risk, activities, checkIn }),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  }

  return { messages, send, scrollRef };
}
