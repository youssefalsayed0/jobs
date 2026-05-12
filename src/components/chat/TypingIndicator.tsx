import { Skeleton } from "@/components/ui/skeleton"

export function TypingIndicator() {
  return (
    <div
      className="flex flex-col gap-2 py-1"
      role="status"
      aria-label="Assistant is typing"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-2.5 w-12 rounded-full" />
        <Skeleton className="h-2.5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-2.5 w-full max-w-[14rem] rounded-full" />
      <span className="text-xs text-muted-foreground">Thinking…</span>
    </div>
  )
}
