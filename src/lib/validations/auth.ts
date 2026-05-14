import { z } from "zod"

import { JOB_SEEKER_DISABILITY_CUSTOM } from "@/lib/disability-types"
import { MAX_SKILLS_TAGS, parseSkillsTokens } from "@/lib/skills-tags"

const passwordRules = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })

const phoneRules = z.string().min(1, { message: "Phone is required" })

export const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export const jobSeekerSignupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name is required" })
      .max(120),
    email: z.string().min(1, { message: "Email is required" }).email(),
    phone: phoneRules,
    password: passwordRules,
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
    skills: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        const t = parseSkillsTokens(val)
        if (t.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Add at least one skill.",
          })
        }
        if (t.length > MAX_SKILLS_TAGS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `You can add at most ${MAX_SKILLS_TAGS} skills.`,
          })
        }
      }),
    disabilityType: z
      .string()
      .min(1, { message: "Select a disability type" }),
    disabilityCustom: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((d, ctx) => {
    if (d.disabilityType === JOB_SEEKER_DISABILITY_CUSTOM) {
      const c = d.disabilityCustom?.trim() ?? ""
      if (c.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter your disability type.",
          path: ["disabilityCustom"],
        })
      }
    }
  })

export const companySignupSchema = z
  .object({
    companyName: z.string().min(2, { message: "Company name is required" }),
    email: z.string().min(1, { message: "Email is required" }).email(),
    phone: z.string().optional(),
    password: passwordRules,
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
    industry: z.string().min(1, { message: "Select an industry" }),
    companySize: z.string().min(1, { message: "Select company size" }),
    disabilitySupportPolicy: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type JobSeekerSignupValues = z.infer<typeof jobSeekerSignupSchema>
export type CompanySignupValues = z.infer<typeof companySignupSchema>
