import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "Full name is required"),
  lastName: z.string().min(2, "Last name is required"),

  gender: z.enum(["male", "female"], { message: "Gender is required" }),

  age: z.string({ message: "Age is required" }),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),

  techInterests: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, "Select at least one tech interest"),
  customInterest: z.string().optional(),
  hobbies: z.string().optional(),

  experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced"], {
    message: "Please select your experience level",
  }),
  employmentType: z.enum(["Freelancer", "Employed", "Self-Employed"], {
    message: "Select your employment type",
  }),

  stack: z
    .array(z.string().min(1, "Each stack must be a valid string"))
    .min(1, "Please select at least one stack"),

  linkedInUrl: z
    .url("Enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),

  career: z.string().min(2, "Enter or choose a career path"),
  careerPath: z
    .string()
    .min(2, "Please describe your career path")
    .max(100, "Career path must be under 100 characters"),

  bio: z
    .string()
    .max(50, "Bio must be at most 50 characters")
    .optional(),

  photoUrl: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
