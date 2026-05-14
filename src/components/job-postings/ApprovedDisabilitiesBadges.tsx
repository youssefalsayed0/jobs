import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ApprovedDisabilitiesBadgesProps = {
  items: readonly string[] | undefined
  /** Show first N then +M more (for dense cards). */
  maxVisible?: number
  className?: string
  badgeClassName?: string
}

export function ApprovedDisabilitiesBadges({
  items,
  maxVisible,
  className,
  badgeClassName,
}: ApprovedDisabilitiesBadgesProps) {
  const list = (items ?? []).map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) return null
  const cap =
    typeof maxVisible === "number" && maxVisible > 0
      ? maxVisible
      : list.length
  const shown = list.slice(0, cap)
  const rest = list.length - shown.length
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {shown.map((t) => (
        <Badge
          key={t}
          variant="secondary"
          className={cn(
            "max-w-full truncate rounded-md border border-border/50 bg-muted/70 px-2 py-0.5 text-xs font-medium text-foreground/90",
            badgeClassName
          )}
        >
          {t}
        </Badge>
      ))}
      {rest > 0 ? (
        <Badge
          variant="outline"
          className="rounded-md px-2 py-0.5 text-xs font-medium tabular-nums"
        >
          +{rest}
        </Badge>
      ) : null}
    </div>
  )
}
