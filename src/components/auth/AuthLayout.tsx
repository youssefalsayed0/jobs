import heroImage from "@/assets/hero.jpg"
import hireImage from "@/assets/hero.jpg"

type SignupIllustrationProps = {
  variant: "job-seeker" | "company"
  /** When set, overrides the default image for this variant. */
  imageSrc?: string
}

const VARIANT_DEFAULT_SRC = {
  "job-seeker": heroImage,
  company: hireImage,
} as const

export function SignupIllustration({ variant, imageSrc }: SignupIllustrationProps) {
  const src = imageSrc ?? VARIANT_DEFAULT_SRC[variant]

  return (
    
      <img
        src={src}
        alt={
          variant === "job-seeker"
            ? "Career opportunities illustration"
            : "Hiring and company illustration"
        }
        className=" w-[50%]  object-contain object-center absolute  right-0 bottom-0 "
      />
  )
}
