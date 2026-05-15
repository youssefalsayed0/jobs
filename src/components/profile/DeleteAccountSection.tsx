import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api/client"
import { cn } from "@/lib/utils"

type DeleteAccountSectionProps = {
  accountLabel: string
  onDelete: (password: string) => Promise<void>
  className?: string
}

export function DeleteAccountSection({
  accountLabel,
  onDelete,
  className,
}: DeleteAccountSectionProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open) setPassword("")
  }, [open])

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden rounded-3xl border-destructive/30 bg-destructive/5 shadow-sm",
          className
        )}
      >
        <CardHeader className="border-b border-destructive/15 px-6 py-6 sm:px-8">
          <CardTitle className="text-lg text-destructive">Delete account</CardTitle>
          <CardDescription>
            Permanently remove your {accountLabel} and associated data. This
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6 sm:px-8">
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={deleting}
            onClick={() => setOpen(true)}
          >
            Delete my account
          </Button>
        </CardContent>
      </Card>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!deleting) setOpen(next)
        }}
      >
        <AlertDialogContent className="gap-4 rounded-2xl border-border/70 p-6 sm:max-w-md">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="font-heading text-lg sm:text-xl">
              Delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed sm:text-[0.9375rem]">
              Your {accountLabel} will be permanently deleted. You will be
              signed out and cannot recover this account. Enter your current
              password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="delete-account-password">Password</Label>
            <Input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={deleting}
              className="rounded-xl border-border/80"
            />
          </div>
          <AlertDialogFooter className="mt-2 gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-xl" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={deleting || password.trim().length === 0}
              onClick={() => {
                const p = password.trim()
                if (!p) return
                void (async () => {
                  setDeleting(true)
                  try {
                    await onDelete(p)
                    toast.success("Account deleted")
                    logout()
                    void navigate("/", { replace: true })
                  } catch (err) {
                    const message =
                      err instanceof ApiError
                        ? err.message
                        : err instanceof Error
                          ? err.message
                          : "Could not delete account"
                    toast.error(message)
                  } finally {
                    setDeleting(false)
                  }
                })()
              }}
            >
              {deleting ? (
                <>
                  <Spinner className="size-4" data-icon="inline-start" />
                  Deleting…
                </>
              ) : (
                "Yes, delete account"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
