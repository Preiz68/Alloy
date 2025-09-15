import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),

  gender: z.enum(["male", "female"], { message: "Gender is required" }),

  age: z.string({ message: "Age is required" }),
  country: z.string({message:"Country is required"}),

  techInterests: z
    .array(z.string(),{message: "Please select at least one interest" }),
  customInterest: z.string().optional(),
  hobbies: z.string().optional(),

  experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced"], {
    message: "Please select your experience level",
  }),

  stack: z
    .array(z.string().min(1, "Each stack must be a valid string"))
    .min(1, {message:"Please select at least one stack"}).optional(),

  linkedInUrl: z
    .url("Enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),

  careerPath: z
    .string({message:"Please describe your career path"}).min(2,"Your career should not bre under 2 characters"),
  bio: z
    .string()
    .max(250, {message:"Bio must be at most 250 characters"})
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;