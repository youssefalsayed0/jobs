import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/lib/api/client"

export type CompanyApplicantUserSkill = {
  id?: number
  name?: string
  sort_order?: number
}

export type CompanyApplicantUserEducation = {
  id?: number
  institution?: string
  degree?: string
  field_of_study?: string
  starts_at?: string | null
  ends_at?: string | null
  details?: string | null
}

export type CompanyApplicantUserExperience = {
  id?: number
  company_name?: string
  title?: string
  starts_at?: string | null
  ends_at?: string | null
  description?: string | null
}

export type CompanyApplicantUserCertificate = {
  id?: number
  name?: string
  issuer?: string
  issued_at?: string | null
  credential_url?: string | null
}

export type CompanyApplicantUserDetail = {
  id?: number | string
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  role?: string
  status?: string
  gender?: string
  city?: string
  street?: string | null
  profile_photo_path?: string | null
  profile_photo_url?: string | null
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
  skills?: CompanyApplicantUserSkill[]
  educations?: CompanyApplicantUserEducation[]
  experiences?: CompanyApplicantUserExperience[]
  certificates?: CompanyApplicantUserCertificate[]
  cv_path?: string | null
  cv_url?: string | null
  disability_type?: string | null
}

function parseCompanyApplicantUserDetail(
  json: unknown
): CompanyApplicantUserDetail | null {
  if (!json || typeof json !== "object") return null
  const o = json as Record<string, unknown>
  const raw = o.data
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const d = raw as Record<string, unknown>

  const id = d.id
  return {
    id: typeof id === "number" || typeof id === "string" ? id : undefined,
    first_name: typeof d.first_name === "string" ? d.first_name : undefined,
    last_name: typeof d.last_name === "string" ? d.last_name : undefined,
    full_name: typeof d.full_name === "string" ? d.full_name : undefined,
    email: typeof d.email === "string" ? d.email : undefined,
    phone: typeof d.phone === "string" ? d.phone : undefined,
    role: typeof d.role === "string" ? d.role : undefined,
    status: typeof d.status === "string" ? d.status : undefined,
    gender: typeof d.gender === "string" ? d.gender : undefined,
    city: typeof d.city === "string" ? d.city : undefined,
    street: d.street === null ? null : typeof d.street === "string" ? d.street : undefined,
    profile_photo_path:
      d.profile_photo_path === null
        ? null
        : typeof d.profile_photo_path === "string"
          ? d.profile_photo_path
          : undefined,
    profile_photo_url:
      d.profile_photo_url === null
        ? null
        : typeof d.profile_photo_url === "string"
          ? d.profile_photo_url
          : undefined,
    email_verified_at:
      d.email_verified_at === null
        ? null
        : typeof d.email_verified_at === "string"
          ? d.email_verified_at
          : undefined,
    created_at: typeof d.created_at === "string" ? d.created_at : undefined,
    updated_at: typeof d.updated_at === "string" ? d.updated_at : undefined,
    skills: Array.isArray(d.skills)
      ? d.skills
          .filter((x): x is Record<string, unknown> => x != null && typeof x === "object")
          .map((s) => ({
            id: typeof s.id === "number" ? s.id : undefined,
            name: typeof s.name === "string" ? s.name : undefined,
            sort_order: typeof s.sort_order === "number" ? s.sort_order : undefined,
          }))
      : undefined,
    educations: Array.isArray(d.educations)
      ? d.educations
          .filter((x): x is Record<string, unknown> => x != null && typeof x === "object")
          .map((e) => ({
            id: typeof e.id === "number" ? e.id : undefined,
            institution: typeof e.institution === "string" ? e.institution : undefined,
            degree: typeof e.degree === "string" ? e.degree : undefined,
            field_of_study:
              typeof e.field_of_study === "string" ? e.field_of_study : undefined,
            starts_at:
              e.starts_at === null
                ? null
                : typeof e.starts_at === "string"
                  ? e.starts_at
                  : undefined,
            ends_at:
              e.ends_at === null ? null : typeof e.ends_at === "string" ? e.ends_at : undefined,
            details:
              e.details === null ? null : typeof e.details === "string" ? e.details : undefined,
          }))
      : undefined,
    experiences: Array.isArray(d.experiences)
      ? d.experiences
          .filter((x): x is Record<string, unknown> => x != null && typeof x === "object")
          .map((e) => ({
            id: typeof e.id === "number" ? e.id : undefined,
            company_name: typeof e.company_name === "string" ? e.company_name : undefined,
            title: typeof e.title === "string" ? e.title : undefined,
            starts_at:
              e.starts_at === null
                ? null
                : typeof e.starts_at === "string"
                  ? e.starts_at
                  : undefined,
            ends_at:
              e.ends_at === null ? null : typeof e.ends_at === "string" ? e.ends_at : undefined,
            description:
              e.description === null
                ? null
                : typeof e.description === "string"
                  ? e.description
                  : undefined,
          }))
      : undefined,
    certificates: Array.isArray(d.certificates)
      ? d.certificates
          .filter((x): x is Record<string, unknown> => x != null && typeof x === "object")
          .map((c) => ({
            id: typeof c.id === "number" ? c.id : undefined,
            name: typeof c.name === "string" ? c.name : undefined,
            issuer: typeof c.issuer === "string" ? c.issuer : undefined,
            issued_at:
              c.issued_at === null
                ? null
                : typeof c.issued_at === "string"
                  ? c.issued_at
                  : undefined,
            credential_url:
              c.credential_url === null
                ? null
                : typeof c.credential_url === "string"
                  ? c.credential_url
                  : undefined,
          }))
      : undefined,
    cv_path:
      d.cv_path === null ? null : typeof d.cv_path === "string" ? d.cv_path : undefined,
    cv_url: d.cv_url === null ? null : typeof d.cv_url === "string" ? d.cv_url : undefined,
    disability_type:
      d.disability_type === null
        ? null
        : typeof d.disability_type === "string"
          ? d.disability_type
          : undefined,
  }
}

export function useCompanyApplicantUserDetail(userId: string | undefined) {
  const { get } = useApi()
  const [user, setUser] = useState<CompanyApplicantUserDetail | null>(null)
  const [loading, setLoading] = useState(Boolean(userId))

  const refetch = useCallback(async () => {
    if (!userId?.trim()) {
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const json = await get(`/api/company/users/${encodeURIComponent(userId.trim())}`)
      const parsed = parseCompanyApplicantUserDetail(json)
      setUser(parsed)
      if (!parsed) {
        toast.error("Could not read applicant profile")
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load applicant"
      toast.error(message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [get, userId])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { user, loading, refetch }
}
