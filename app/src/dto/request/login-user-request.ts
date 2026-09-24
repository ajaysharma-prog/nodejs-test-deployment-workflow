import z from "zod";

export const LoginUserSchema = z.object({
  email: z.email({ error: "Email must be in email format." }),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must consist at 8 charater"),
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>;
