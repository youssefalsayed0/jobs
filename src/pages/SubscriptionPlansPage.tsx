import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, CreditCardIcon, SparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/auth-context"
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans"
import { useSubscriptionSubscribe } from "@/hooks/useSubscriptionSubscribe"
import type { SubscriptionPlan } from "@/lib/subscription-plans-parse"
import { cn } from "@/lib/utils"

const subscribeSchema = z.object({
  holder_name: z.string().min(2, "Name is required"),
  card_number: z
    .string()
    .min(1, "Card number is required")
    .refine((s) => {
      const digits = s.replace(/\D/g, "")
      return digits.length >= 12 && digits.length <= 19
    }, "Enter a valid card number"),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Use MM/YY (e.g. 12/29)"),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
})

type SubscribeFormValues = z.infer<typeof subscribeSchema>

function PlansSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-3xl border-border/70">
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="mt-2 h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-11 w-full rounded-xl" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function SubscriptionPlansPage() {
  const { user } = useAuth()
  const { items, loading } = useSubscriptionPlans()
  const { subscribe, submitting } = useSubscriptionSubscribe()
  const [payOpen, setPayOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  )

  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      holder_name: "",
      card_number: "",
      expiry: "",
      cvv: "",
    },
  })

  useEffect(() => {
    if (payOpen && selectedPlan) {
      form.reset({
        holder_name: "",
        card_number: "",
        expiry: "",
        cvv: "",
      })
    }
  }, [payOpen, selectedPlan, form])

  const openSubscribe = (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error("You have to be logged in to subscribe.")
      return
    }
    setSelectedPlan(plan)
    setPayOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-linear-to-b from-muted/35 via-background to-muted/25">
      <section className="border-b border-border/60 bg-card/80 px-4 py-10 sm:px-8 sm:py-14">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SparklesIcon className="size-7" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Subscription plans
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            Anyone can browse plans here. Sign in when you&apos;re ready to subscribe
            with a payment card.
          </p>
        </div>
      </section>

      <section className="container mx-auto flex-1 px-4 py-10 sm:px-8 sm:py-14">
        {loading ? (
          <PlansSkeleton />
        ) : items.length === 0 ? (
          <Card className="mx-auto max-w-lg rounded-3xl border-dashed border-border/80 py-12 text-center shadow-none">
            <CardContent className="text-sm text-muted-foreground">
              No plans are available right now. Please check back later.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "flex h-full flex-col overflow-hidden rounded-3xl border-border/70 bg-card/95 shadow-sm transition-shadow",
                  "hover:border-primary/20 hover:shadow-md",
                )}
              >
                <CardHeader className="space-y-1 pb-2">
                  <CardTitle className="font-heading text-xl sm:text-2xl">
                    {plan.title}
                  </CardTitle>
                  <CardDescription className="text-base text-pretty">
                    {plan.description}
                  </CardDescription>
                  <p className="pt-2 font-heading text-3xl font-bold tabular-nums text-foreground">
                    <span className="text-lg font-semibold text-muted-foreground">
                      $
                    </span>
                    {plan.price}
                    <span className="text-sm font-medium text-muted-foreground">
                      {" "}
                      / month
                    </span>
                  </p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Benefits
                  </p>
                  <ul className="space-y-2">
                    {plan.benefits.length > 0 ? (
                      plan.benefits.map((b) => (
                        <li
                          key={b}
                          className="flex gap-2 text-sm text-foreground/90"
                        >
                          <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{b}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">
                        Details coming soon.
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    type="button"
                    className="w-full rounded-xl font-semibold"
                    size="lg"
                    onClick={() => openSubscribe(plan)}
                  >
                    Subscribe
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={payOpen}
        onOpenChange={(open) => {
          setPayOpen(open)
          if (!open) setSelectedPlan(null)
        }}
      >
        <DialogContent className="max-w-md rounded-3xl sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <CreditCardIcon className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Checkout
              </span>
            </div>
            <DialogTitle className="text-xl">
              {selectedPlan ? `Subscribe — ${selectedPlan.title}` : "Subscribe"}
            </DialogTitle>
            <DialogDescription>
              Enter card details as shown on your card. Your session must stay
              signed in.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              if (!selectedPlan) return
              const digits = values.card_number.replace(/\D/g, "")
              try {
                await subscribe({
                  subscription_plan_id: selectedPlan.id,
                  holder_name: values.holder_name.trim(),
                  card_number: digits,
                  expiry: values.expiry.trim(),
                  cvv: values.cvv.trim(),
                })
                setPayOpen(false)
                setSelectedPlan(null)
                form.reset()
              } catch {
                /* toast in hook */
              }
            })}
          >
            <FieldGroup className="gap-4">
              <Controller
                name="holder_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sub-holder">Cardholder name</FieldLabel>
                    <FieldContent>
                      <Input
                        id="sub-holder"
                        className="h-11 rounded-xl"
                        autoComplete="cc-name"
                        {...field}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </FieldContent>
                  </Field>
                )}
              />
              <Controller
                name="card_number"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sub-card">Card number</FieldLabel>
                    <FieldContent>
                      <Input
                        id="sub-card"
                        className="h-11 rounded-xl"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        {...field}
                      />
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </FieldContent>
                  </Field>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="expiry"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sub-exp">Expiry</FieldLabel>
                      <FieldContent>
                        <Input
                          id="sub-exp"
                          className="h-11 rounded-xl"
                          placeholder="MM/YY"
                          autoComplete="cc-exp"
                          {...field}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
                <Controller
                  name="cvv"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="sub-cvv">CVV</FieldLabel>
                      <FieldContent>
                        <Input
                          id="sub-cvv"
                          className="h-11 rounded-xl"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          {...field}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setPayOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner className="size-4" />
                    Processing…
                  </>
                ) : (
                  "Pay & subscribe"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
