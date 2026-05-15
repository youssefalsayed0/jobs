import { z } from "zod"

function optionalHttpUrl(message = "Enter a valid URL (https://…)") {
  return z.string().refine((s) => {
    const t = s.trim()
    if (t === "") return true
    try {
      const u = new URL(t)
      return u.protocol === "http:" || u.protocol === "https:"
    } catch {
      return false
    }
  }, { message })
}

export const companyProfileSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  industry: z.string().min(1, "Industry is required"),
  company_size: z.string().min(1, "Company size is required"),
  disability_support_policy: z.string().optional(),
  overview: z.string().optional(),
  facebook_url: optionalHttpUrl(),
  x_url: optionalHttpUrl(),
  linkedin_url: optionalHttpUrl(),
  instagram_url: optionalHttpUrl(),
  phone: z.string().refine((s) => s.trim().length >= 1, {
    message: "Phone number is required",
  }),
  street: z.string().optional(),
  city: z.string().optional(),
  clear_profile_photo: z.boolean(),
})

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>
