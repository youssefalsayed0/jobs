import { useCallback, useRef } from "react"
import { SendIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

type ChatInputProps = {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Share your background, goals, or answer the coach…",
}: ChatInputProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  const submit = useCallback(() => {
    const el = taRef.current
    if (!el || disabled) return
    const v = el.value.trim()
    if (!v) return
    onSend(v)
    el.value = ""
  }, [disabled, onSend])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="shrink-0 border-t bg-card/80 p-3 backdrop-blur-sm">
      <InputGroup className="min-h-[5.5rem] items-end rounded-xl border bg-background shadow-sm has-[>textarea]:h-auto">
        <InputGroupTextarea
          ref={taRef}
          rows={3}
          disabled={disabled}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-h-[5.5rem] resize-none px-3 py-2.5 pe-2 text-sm"
          aria-label="Message"
        />
        <InputGroupAddon
          align="inline-end"
          className="shrink-0 self-end border-s bg-muted/30 py-1 ps-1 pe-1.5"
        >
          <InputGroupButton
            variant="default"
            size="icon-sm"
            onClick={submit}
            disabled={disabled}
            aria-label="Send message"
            className="flex size-8 items-center justify-center p-0 [&_svg]:m-0"
          >
            <SendIcon aria-hidden />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p className="mt-1.5 px-0.5 text-center text-xs text-muted-foreground">
        Enter to send · Shift+Enter for a new line
      </p>
    </div>
  )
}
