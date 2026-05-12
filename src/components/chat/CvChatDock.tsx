import { useState } from "react"
import { MessageCircleIcon, SparklesIcon } from "lucide-react"

import { ChatPage } from "@/components/chat/ChatPage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function CvChatDock({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-e-4 bottom-6 z-40 flex flex-col items-end gap-3",
        className
      )}
    >
      {open ? (
        <Card
          className={cn(
            "pointer-events-auto flex max-h-[min(42rem,calc(100dvh-4rem))] w-[min(40rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden py-0 shadow-2xl ring-1 ring-border/60",
            "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200"
          )}
          role="dialog"
          aria-modal="false"
          aria-labelledby="cv-coach-title"
        >
          <div className="flex h-[min(42rem,calc(100dvh-4rem))] min-h-[22rem] w-full min-w-0 flex-1 flex-col">
            <ChatPage embedded onClose={() => setOpen(false)} />
          </div>
        </Card>
      ) : null}

      <Button
        type="button"
        size="lg"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "pointer-events-auto gap-2 rounded-full shadow-lg sm:rounded-xl",
          open && "ring-2 ring-primary/30"
        )}
        aria-label={open ? "Close CV coach" : "Open CV coach"}
        aria-expanded={open}
      >
        {open ? (
          <MessageCircleIcon data-icon="inline-start" aria-hidden />
        ) : (
          <SparklesIcon data-icon="inline-start" aria-hidden />
        )}
        <span className="max-sm:sr-only">{open ? "Close" : "CV coach"}</span>
      </Button>
    </div>
  )
}
