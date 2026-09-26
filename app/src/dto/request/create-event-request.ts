import { z } from "zod";

export const EventSchema = z.object({
  title: z
    .string({ error: "Title of the event is required." })
    .trim()
    .min(1, "Title cannot be empty."),

  description: z
    .string({ error: "Description is required." })
    .trim()
    .min(2, "Description cannot be empty and have atleast 2 character."),
  venue: z
    .string({ error: "Venue is required." })
    .trim()
    .min(2, "venue cannot be empty and have atleast 2 character."),

  date: z.coerce
    .date({ error: "Event date is required." })
    .refine((date) => date > new Date(), {
      message: "Event date must be in the future.",
    }),
});

export type Eventdto = z.infer<typeof EventSchema>;
