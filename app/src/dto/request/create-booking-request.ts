import z, { object } from "zod";

export const CreateBookingSchema = z.object({
  eventId: z
    .string({ error: "EventId is required" })
    .trim()
    .min(1, "EventId is not empty"),
  ticketDetails: z.array(
    z.object({
      tierId: z
        .string({ error: "TierId is required" })
        .trim()
        .min(1, "TierId must not be empty"),
      quantity: z
        .number()
        .int({ error: "Only integer Allowed" })
        .min(1, "Quantity must be greater than 0."),
    }),
  ),
});

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
