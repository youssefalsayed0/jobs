import { FileTextIcon, MoonIcon, SparklesIcon, SunIcon, XIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ChatHeaderProps = {
  onFinalize: () => void
  disabled?: boolean
  streaming?: boolean
  onClose?: () => void
}

export function ChatHeader({
  onFinalize,
  disabled,
  streaming,
  onClose,
}: ChatHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <header className="flex shrink-0 flex-col gap-0 border-b bg-card/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <SparklesIcon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1
              id="cv-coach-title"
              className="truncate font-heading text-sm font-semibold leading-tight tracking-tight"
            >
              Opportix CV Coach
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Gemini · ATS-aware
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="size-8"
                onClick={() =>
                  setTheme(
                    resolvedTheme === "dark" || theme === "dark"
                      ? "light"
                      : "dark"
                  )
                }
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" || theme === "dark" ? (
                  <SunIcon data-icon="inline-start" />
                ) : (
                  <MoonIcon data-icon="inline-start" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {resolvedTheme === "dark" || theme === "dark"
                ? "Light mode"
                : "Dark mode"}
            </TooltipContent>
          </Tooltip>

          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={onFinalize}
            disabled={disabled || streaming}
            className="gap-1.5"
          >
            <FileTextIcon data-icon="inline-start" />
            Finalize CV
          </Button>

          {onClose ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <XIcon data-icon="inline-start" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Close</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </header>
  )
}
