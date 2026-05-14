import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  joinSkillsTokens,
  MAX_SKILLS_TAGS,
  parseSkillsTokens,
} from "@/lib/skills-tags"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

export type SkillsTagsInputProps = {
  id: string
  value: string
  onChange: (next: string) => void
  onBlur: () => void
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
  maxTags?: number
  /** Shown in max-tag toasts (e.g. "skills" vs "disability entries"). */
  limitEntityLabel?: string
  /** Optional quick-add chips (e.g. preset disability types). */
  suggestions?: readonly string[]
}

export function SkillsTagsInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  placeholder = "Type a skill, press Enter or comma…",
  maxTags = MAX_SKILLS_TAGS,
  limitEntityLabel = "skills",
  suggestions,
}: SkillsTagsInputProps) {
  const [draft, setDraft] = useState("")
  const tokens = parseSkillsTokens(value)
  const tokenKey = tokens.join("\0")

  useEffect(() => {
    setDraft("")
  }, [tokenKey])

  const setTokens = useCallback(
    (next: string[]) => {
      const capped = next.slice(0, maxTags)
      if (next.length > capped.length) {
        toast.warning(
          `You can add at most ${maxTags} ${limitEntityLabel}.`
        )
      }
      onChange(joinSkillsTokens(capped))
    },
    [maxTags, onChange, limitEntityLabel]
  )

  const commitDraft = useCallback(() => {
    const raw = draft.trim()
    if (!raw) return
    const parts = raw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const merged = [...tokens]
    for (const p of parts) {
      if (!merged.some((t) => t.toLowerCase() === p.toLowerCase())) {
        merged.push(p)
      }
    }
    setTokens(merged)
    setDraft("")
  }, [draft, setTokens, tokens])

  const removeAt = useCallback(
    (idx: number) => {
      setTokens(tokens.filter((_, i) => i !== idx))
    },
    [setTokens, tokens]
  )

  const addSuggestion = useCallback(
    (label: string) => {
      const p = label.trim()
      if (!p) return
      if (tokens.length >= maxTags) {
        toast.warning(
          `You can add at most ${maxTags} ${limitEntityLabel}. Remove one to add another.`
        )
        return
      }
      if (tokens.some((t) => t.toLowerCase() === p.toLowerCase())) return
      setTokens([...tokens, p])
    },
    [limitEntityLabel, maxTags, setTokens, tokens]
  )

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border bg-background px-2 py-1.5 shadow-sm transition-[color,box-shadow]",
          "focus-within:border-ring/60 focus-within:ring-[3px] focus-within:ring-ring/50",
          invalid ? "border-destructive" : "border-border/80",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {tokens.map((name, idx) => (
          <Badge
            key={`${name}-${idx}`}
            variant="secondary"
            asChild
            className="h-7 max-w-full gap-0.5 rounded-md border border-border/50 bg-muted/80 py-0 pr-0.5 pl-2 text-xs font-medium shadow-none"
          >
            <span className="inline-flex items-center gap-0.5">
              <span className="truncate">{name}</span>
              <button
                type="button"
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
                aria-label={`Remove ${name}`}
                disabled={disabled}
                onClick={() => removeAt(idx)}
              >
                <XIcon className="size-3.5" />
              </button>
            </span>
          </Badge>
        ))}
        <Input
          id={id}
          className="h-8 min-w-[10ch] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 md:min-w-[14ch]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (tokens.length >= maxTags) {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                toast.warning(
                  `You can add at most ${maxTags} ${limitEntityLabel}. Remove one to add another.`
                )
              }
              return
            }
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              commitDraft()
              return
            }
            if (
              e.key === "Backspace" &&
              draft === "" &&
              tokens.length > 0
            ) {
              e.preventDefault()
              removeAt(tokens.length - 1)
            }
          }}
          onBlur={() => {
            commitDraft()
            onBlur()
          }}
          disabled={disabled}
          placeholder={
            tokens.length >= maxTags
              ? `Max ${maxTags} — remove a tag to add more`
              : tokens.length === 0
                ? placeholder
                : "Add more…"
          }
        />
      </div>
      {suggestions && suggestions.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => {
              const taken = tokens.some(
                (t) => t.toLowerCase() === s.toLowerCase()
              )
              const atCap = tokens.length >= maxTags
              return (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-md px-2 text-xs font-normal"
                  disabled={disabled || taken || atCap}
                  onClick={() => addSuggestion(s)}
                >
                  {s}
                </Button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
