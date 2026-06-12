import { useState } from "react";
import { MessageCircle, X, Send, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SUGGESTED_PROMPTS } from "@/lib/chatbot";
import { useChatbotMessages } from "@/hooks/use-chatbot-messages";

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, send, scrollRef } = useChatbotMessages(open);

  function handleSend(text: string) {
    send(text);
    setInput("");
  }

  return (
    <>
      {open && (
        <Card className="fixed bottom-36 right-4 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 shadow-xl sm:bottom-24 sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-secondary/40 px-4 py-3">
            <div className="flex items-center gap-2">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
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
      )}

      {/* Floating toggle button */}
      <Button
        onClick={() => setOpen((v) => !v)}
        size="icon"
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </>
  );
}
