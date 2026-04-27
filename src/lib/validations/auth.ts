import { z } from "zod"

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
    skillPrimary: z.string().min(1, { message: "Select a skill" }),
    skillSecondary: z.string().min(1, { message: "Select a skill" }),
    cv: z
      .custom<FileList | undefined>(
        (val) => val === undefined || val instanceof FileList
      )
      .refine(
        (files) => {
          if (!files || files.length === 0) return false
          const f = files[0]
          const ok = [".pdf", ".doc", ".docx"].some((ext) =>
            f.name.toLowerCase().endsWith(ext)
          )
          return ok
        },
        { message: "Upload a PDF or DOCX file" }
      ),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const companySignupSchema = z
  .object({
    companyName: z.string().min(2, { message: "Company name is required" }),
    email: z.string().min(1, { message: "Email is required" }).email(),
    phone: phoneRules,
    password: passwordRules,
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
    industry: z.string().min(1, { message: "Select an industry" }),
    companySize: z.string().min(1, { message: "Select company size" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type JobSeekerSignupValues = z.infer<typeof jobSeekerSignupSchema>
export type CompanySignupValues = z.infer<typeof companySignupSchema>
