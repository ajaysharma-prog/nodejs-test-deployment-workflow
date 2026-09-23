import { z } from "zod";

export const TicketTierItemSchema = z.object({
  tierName: z
    .string({ error: "Tier name is required." })
    .trim()
    .min(1, "Ticket TierName must not be empty."),
  price: z
    .number({ error: "Price is required." })
    .min(0, "Price cannot be negative."),
  availableCapacity: z
    .number({ error: "Available capacity is required." })
    .int()
    .min(1),
});

export const TicketTierSchema = z.object({
  tiers: z
    .array(TicketTierItemSchema)
    .min(1, "You must provide at least one ticket tier.")
    .max(15, "Cannot configure more than 15 ticket tiers."),
});

export type TicketTierdto = z.infer<typeof TicketTierSchema>;
