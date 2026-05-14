/** Sent as `disability_type` string on job seeker registration. */
export const JOB_SEEKER_DISABILITY_CUSTOM = "__custom__" as const

export type JobSeekerDisabilityOption = {
  value: string
  label: string
}

export const JOB_SEEKER_DISABILITY_OPTIONS: JobSeekerDisabilityOption[] = [
  { value: "None", label: "None / prefer not to say" },
  { value: "Mobility impairment", label: "Mobility impairment" },
  { value: "Vision impairment", label: "Vision impairment" },
  { value: "Hearing impairment", label: "Hearing impairment" },
  { value: "Cognitive or learning disability", label: "Cognitive or learning disability" },
  { value: "Mental health condition", label: "Mental health condition" },
  { value: "Chronic illness or pain", label: "Chronic illness or pain" },
  { value: "Neurodivergent", label: "Neurodivergent" },
  { value: JOB_SEEKER_DISABILITY_CUSTOM, label: "Other (specify)" },
]
