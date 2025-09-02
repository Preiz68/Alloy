import {z} from "zod"


export const signUpSchema = z.object({
    email:z
    .email("Invalid email address")
    .refine((val) => val.endsWith("@gmail.com") || val.endsWith("@yahoo.com"),{
        message:"Only Gmail and yahoo are allowed"
    }),
    password:z
    .string()
    .min(8, "Password must be 8 characters")
    .regex(/[A-Z]/,"Password must contain at least one uppercase letter")
    .regex(/[a-z]/,"Password must contain at least one lowercase letter")
    .regex(/[0-9]/,"Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`';]/,"Password must contain a special character")
})

export type signUpFormData = z.infer<typeof signUpSchema>