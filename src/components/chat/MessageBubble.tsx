import Markdown from "react-markdown"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { TypingIndicator } from "@/components/chat/TypingIndicator"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types/chat"

type MessageBubbleProps = {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const showTyping =
    message.role === "assistant" && message.isStreaming && !message.content

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex gap-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="mt-0.5 size-8 shrink-0 border border-border">
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {isUser ? "You" : "AI"}
        </AvatarFallback>
      </Avatar>

      <Card
        size="sm"
        className={cn(
          "max-w-[min(100%,36rem)] border-0 py-0 shadow-sm ring-1 ring-border/60",
          isUser && "bg-primary text-primary-foreground ring-primary/20"
        )}
      >
        <CardContent className="px-3 py-2.5">
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : showTyping ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert prose-p:leading-relaxed prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
