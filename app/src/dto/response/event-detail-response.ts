import { TicketTierDetails } from "./ticket-tier-response";

export interface EventDetails {
  eventId: string;
  organizerId: string;
  title: string;
  description: string;
  venue: string;
  eventDate: string;
  uploadBannerUrl?: string;
  ticketTiers?: TicketTierDetails[];
}
