import { useEffect, useRef } from "react"
import { AlertCircleIcon, ClockIcon, SparklesIcon } from "lucide-react"

import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatInput } from "@/components/chat/ChatInput"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { useChatStream } from "@/hooks/useChatStream"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type ChatPageProps = {
  /** When true, fills parent height (e.g. popup) instead of full viewport. */
  embedded?: boolean
  /** Close handler (e.g. dismiss popup). */
  onClose?: () => void
}

export function ChatPage({ embedded = false, onClose }: ChatPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    messages,
    sendMessage,
    finalizeCv,
    stop,
    status,
    error,
    rateLimitActive,
    clearError,
  } = useChatStream()

  const busy = status === "streaming" || status === "generating"

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-background text-foreground",
        embedded ? "h-full" : "h-svh"
      )}
    >
      <ChatHeader
        onFinalize={finalizeCv}
        disabled={messages.length === 0 || rateLimitActive}
        streaming={busy}
        onClose={onClose}
      />

      {error ? (
        <Alert
          variant={rateLimitActive ? "default" : "destructive"}
          className={cn(
            "mx-3 mt-2 shrink-0",
            rateLimitActive &&
              "border-secondary/35 bg-secondary/12 text-secondary-foreground"
          )}
        >
          {rateLimitActive ? (
            <ClockIcon className="text-secondary-foreground" />
          ) : (
            <AlertCircleIcon />
          )}
          <AlertTitle>
            {rateLimitActive ? "Too many requests" : "Something went wrong"}
          </AlertTitle>
          <AlertDescription
            className={
              rateLimitActive
                ? "font-medium tabular-nums text-secondary-foreground"
                : undefined
            }
          >
            {error}
          </AlertDescription>
          <AlertAction>
            <Button type="button" variant="ghost" size="xs" onClick={clearError}>
              Dismiss
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {messages.length === 0 ? (
            <Empty className="min-h-[12rem] flex-1 border border-dashed bg-muted/20 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SparklesIcon />
                </EmptyMedia>
                <EmptyTitle>Your CV coach is ready</EmptyTitle>
                <EmptyDescription>
                  Tell me where you are in your career—whether you are starting from
                  scratch or polishing an existing CV. I will guide you with short,
                  friendly questions about your story, roles, skills, and goals.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <p className="max-w-md text-center text-sm text-muted-foreground">
                  When we have enough detail, tap{" "}
                  <span className="font-medium text-foreground">Finalize CV</span>{" "}
                  in the header and I will turn everything into a clear,
                  recruiter-ready document you can copy or adapt anywhere.
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Send a message below to begin—no forms, just a conversation.
                </p>
              </EmptyContent>
            </Empty>
          ) : null}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {status === "generating" ? (
            <div className="flex gap-2">
              <Avatar className="mt-0.5 size-8 shrink-0 border border-border">
                <AvatarFallback className="bg-muted text-xs font-medium">
                  AI
                </AvatarFallback>
              </Avatar>
              <Card
                size="sm"
                className="max-w-[min(100%,36rem)] border-0 py-0 shadow-sm ring-1 ring-border/60"
              >
                <CardContent className="flex items-center gap-3 px-3 py-3">
                  <Spinner className="size-5 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Drafting your CV</p>
                    <p className="text-xs text-muted-foreground">
                      This can take a few seconds…
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>

      {busy ? (
        <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-muted/30 px-3 py-1.5">
          <Button type="button" variant="outline" size="xs" onClick={stop}>
            Stop
          </Button>
        </div>
      ) : null}

      <ChatInput onSend={sendMessage} disabled={busy || rateLimitActive} />
    </div>
  )
}
