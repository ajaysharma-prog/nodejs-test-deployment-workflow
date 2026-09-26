import { randomUUID } from "crypto";
import { EventDetails } from "../dto/response/event-detail-response";
import { CreateEventDTO } from "../handlers/create-event";
import { Event } from "../models/event";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getEventAndTicketTier,
  getEventById,
  getEvents,
  getEventTicketTier,
  saveEvent,
  saveTicketTier,
} from "../repositories/event-repository";
import { TicketTierdto } from "../dto/request/create-ticket-tier-request";
import { TicketTier } from "../models/ticket-tier";
import { TicketTierDetails } from "../dto/response/ticket-tier-response";
import { ApiError } from "../utils/api-error";
import { ResponseMessage } from "../constants/response-message";

const s3Client = new S3Client({ region: process.env.BUCKET_REGION });

export async function createEvent(
  organizerId: string,
  eventDto: CreateEventDTO,
): Promise<EventDetails> {
  const eventId: string = randomUUID();
  const s3ObjectKey: string = `${process.env.ENVIRONMENT}/Event/${eventId}/banner/${randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: s3ObjectKey,
    ContentType: "image/*",
  });
  const presignedUploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  const event: Event = {
    eventId: eventId,
    organizerId: organizerId,
    title: eventDto.title,
    description: eventDto.description,
    eventDate: eventDto.date.toISOString(),
    venue: eventDto.venue,
    bannerUrl: s3ObjectKey,
  };

  await saveEvent(event);

  const savedEvent: EventDetails = {
    eventId: event.eventId,
    organizerId: event.organizerId,
    title: event.title,
    description: event.description,
    venue: event.venue,
    eventDate: event.eventDate,
    uploadBannerUrl: presignedUploadUrl,
  };

  return savedEvent;
}

export async function createTicketTier(
  userId: string,
  eventId: string,
  ticketTierdto: TicketTierdto,
): Promise<void> {
  const event: Event = await getEventById(eventId);

  if (!event) {
    throw new ApiError(404, ResponseMessage.NO_EVENT_FOUND);
  }

  if (event.organizerId != userId) {
    throw new ApiError(403, ResponseMessage.UNAUTHORIZED_ACTION);
  }
  const ticketTiers: TicketTier[] = [];
  for (let i = 0; i < ticketTierdto.tiers.length; i++) {
    let tierId = randomUUID();
    ticketTiers.push({
      tierId: tierId,
      eventId: eventId,
      tierName: ticketTierdto.tiers[i].tierName,
      price: ticketTierdto.tiers[i].price,
      availableCapacity: ticketTierdto.tiers[i].availableCapacity,
    });
  }

  await saveTicketTier(ticketTiers);
}

export async function getAllEvents(): Promise<EventDetails[]> {
  const events = await getEvents();
  const today = new Date();
  const eventDetails: EventDetails[] = events
    .filter((event) => {
      return today <= new Date(event.eventDate);
    })
    .map((event) => {
      return {
        eventId: event.eventId,
        organizerId: event.organizerId,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        venue: event.venue,
      };
    });
  return eventDetails;
}

export async function getEventWithTicketTier(
  eventId: string,
): Promise<EventDetails | null> {
  const eventDetailswithTicketTier = await getEventAndTicketTier(eventId);

  if (!eventDetailswithTicketTier || eventDetailswithTicketTier.length === 0) {
    throw new ApiError(404, ResponseMessage.INVALID_EVENT_ID);
  }

  let eventMetadata: Omit<
    Omit<EventDetails, "ticketTiers">,
    "uploadBannerUrl"
  > | null = null;
  const ticketTierDetails: TicketTierDetails[] = [];

  for (let i = 0; i < eventDetailswithTicketTier.length; i++) {
    const element = eventDetailswithTicketTier[i];

    if (element.SK === "METADATA") {
      eventMetadata = {
        eventId: element.eventId,
        organizerId: element.organizerId,
        title: element.title,
        description: element.description,
        venue: element.venue,
        eventDate: element.eventDate,
      };
    } else if (element.SK.toUpperCase().startsWith("TIER#")) {
      ticketTierDetails.push({
        tierId: element.tierId,
        tierName: element.tierName,
        availableCapacity: element.availableCapacity,
        price: element.price,
      });
    }
  }

  if (!eventMetadata) {
    throw new ApiError(404, ResponseMessage.INVALID_EVENT_ID);
  }

  return {
    ...eventMetadata,
    ticketTiers: ticketTierDetails,
  };
}
