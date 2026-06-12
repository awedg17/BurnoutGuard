import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Leaf } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUGGESTED_PROMPTS } from "@/lib/chatbot";
import { useChatbotMessages } from "@/hooks/use-chatbot-messages";

export const Route = createFileRoute("/chatbot")({
  head: () => ({
    meta: [
      { title: "Chatbot — BurnoutGuard" },
      {
        name: "description",
        content:
          "Chat with your BurnoutGuard assistant about your risk score, today's priorities, and tips.",
      },
    ],
  }),
  component: ChatbotPage,
});

function ChatbotPage() {
  const [input, setInput] = useState("");
  const { messages, send, scrollRef } = useChatbotMessages();

  function handleSend(text: string) {
    send(text);
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] flex-col sm:h-[calc(100vh-7rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground">Chatbot</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask about your risk score, today's priorities, or get a quick tip.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/40 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Leaf className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              BurnoutGuard Assistant
            </p>
            <p className="text-xs text-muted-foreground">
              Here to help, anytime
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested prompts */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 border-t border-border/60 p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="rounded-full"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
