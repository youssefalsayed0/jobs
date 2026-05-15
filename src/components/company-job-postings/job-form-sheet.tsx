import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useJobPostingEditor } from "@/hooks/company/useJobPostingEditor"
import { useJobPostingSave } from "@/hooks/company/useJobPostingSave"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { SkillsTagsInput } from "@/components/job-seeker/SkillsTagsInput"
import { ApiError } from "@/lib/api/client"
import {
  APPROVED_DISABILITY_SUGGESTIONS,
  MAX_APPROVED_DISABILITY_TAGS,
} from "@/lib/job-approved-disability"
import { MAX_JOB_POSTING_SKILLS_TAGS } from "@/lib/job-posting-skills"
import {
  type JobPostingFormValues,
  jobPostingFormDefaults,
  jobPostingFormSchema,
} from "@/lib/validations/company-job"

type JobFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  jobId: string | null
  onSaved: () => void
}

export function JobFormSheet({
  open,
  onOpenChange,
  mode,
  jobId,
  onSaved,
}: JobFormSheetProps) {
  const { editorPhase, formValues } = useJobPostingEditor(open, mode, jobId)
  const { save } = useJobPostingSave()
  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingFormSchema),
    defaultValues: jobPostingFormDefaults,
  })

  useEffect(() => {
    if (!open) return
    if (mode === "edit" && jobId) {
      if (editorPhase === "idle" || editorPhase === "loading") return
    }
    form.reset(formValues)
  }, [open, mode, jobId, editorPhase, formValues, form])

  return (    
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l p-0 sm:!max-w-4xl"
      >
        <SheetHeader className="border-b border-border/80 bg-muted/30 px-6 py-7 sm:px-10 sm:py-8">
          <SheetTitle className="font-heading text-xl">
            {mode === "create" ? "Post a new role" : "Edit job posting"}
          </SheetTitle>
          <SheetDescription className="text-pretty text-sm leading-relaxed">
            {mode === "create"
              ? "Share what makes this role compelling—clear titles and honest requirements attract stronger applicants."
              : "Update copy or logistics anytime. Saved changes go live for candidates immediately."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="company-job-form"
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              if (mode === "edit" && !jobId) {
                toast.error("Missing job id.")
                return
              }
              await save(mode, jobId, values)
              toast.success(mode === "create" ? "Job posted" : "Job updated")
              onOpenChange(false)
              onSaved()
            } catch (err) {
              const message =
                err instanceof ApiError
                  ? err.message
                  : err instanceof Error
                    ? err.message
                    : "Request failed"
              toast.error(message)
            }
          })}
        >
          <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-7 sm:px-10 sm:py-9">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Role overview
              </p>
              <Separator />
            </div>
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-title">Job title</FieldLabel>
                    <Input
                      {...field}
                      id="job-title"
                      placeholder="e.g. Senior PHP Developer"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Work arrangement</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="job-type"
                        className="w-full max-w-none"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="location"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-location">Location</FieldLabel>
                    <Input
                      {...field}
                      id="job-location"
                      placeholder="City or region"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-category">Category</FieldLabel>
                    <Input
                      {...field}
                      id="job-category"
                      placeholder="e.g. Engineering, Design, Sales"
                      aria-invalid={fieldState.invalid}
                      value={field.value ?? ""}
                    />
                    <FieldDescription>
                      Optional. Helps candidates find this role on listings.
                    </FieldDescription>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="skills"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-skills">Skills</FieldLabel>
                    <FieldContent>
                      <SkillsTagsInput
                        id="job-skills"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={form.formState.isSubmitting}
                        invalid={fieldState.invalid}
                        maxTags={MAX_JOB_POSTING_SKILLS_TAGS}
                        limitEntityLabel="skills"
                        placeholder="e.g. React, PHP — Enter or comma to add"
                      />
                      <FieldDescription>
                        Up to {MAX_JOB_POSTING_SKILLS_TAGS} skills shown on job
                        cards and the public listing.
                      </FieldDescription>
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Role details
              </p>
              <Separator />
            </div>
            <FieldGroup>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-description">Description</FieldLabel>
                    <Textarea
                      {...field}
                      id="job-description"
                      rows={4}
                      placeholder="What will they do day to day?"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="requirements"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-requirements">
                      Requirements
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="job-requirements"
                      rows={3}
                      placeholder="Skills, years of experience, tools…"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="qualification"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-qualification">
                      Qualifications
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="job-qualification"
                      rows={2}
                      placeholder="Education, certifications…"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="approved_disability"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-approved-disability">
                      Disabilities we welcome
                    </FieldLabel>
                    <FieldContent>
                      <SkillsTagsInput
                        id="job-approved-disability"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={form.formState.isSubmitting}
                        invalid={fieldState.invalid}
                        maxTags={MAX_APPROVED_DISABILITY_TAGS}
                        limitEntityLabel="disability entries"
                        suggestions={APPROVED_DISABILITY_SUGGESTIONS}
                        placeholder="Type a condition, Enter or comma — or use Quick add"
                      />
                      <FieldDescription>
                        Up to {MAX_APPROVED_DISABILITY_TAGS} tags. Shown to candidates
                        as accommodations you explicitly support for this role.
                      </FieldDescription>
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : null}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <SheetFooter className="border-t border-border/80 bg-muted/25 px-6 py-6 sm:px-10">
            <div className="flex w-full flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="company-job-form"
                className="rounded-lg px-6"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Spinner className="opacity-80" data-icon="inline-start" />
                ) : null}
                {mode === "create" ? "Publish" : "Save changes"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
