import { z } from "zod";

export const RegisterUserSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must consist at 2 charater"),
  email: z.email({ error: "Email must be in email format." }),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must consist at 8 charater"),
  role: z.enum(["ATTENDEE", "ORGANIZER"], {
    error: "Role must be ATTENDEE or ORGANIZER",
  }),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
