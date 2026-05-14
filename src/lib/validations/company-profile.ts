import { z } from "zod"

export const companyProfileSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  industry: z.string().min(1, "Industry is required"),
  company_size: z.string().min(1, "Company size is required"),
  disability_support_policy: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  clear_profile_photo: z.boolean(),
})

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>
