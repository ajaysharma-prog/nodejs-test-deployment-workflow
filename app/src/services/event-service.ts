import { randomUUID } from "crypto";
import { EventDetails } from "../dto/response/event-detail-response";
import { CreateEventDTO } from "../handlers/create-event";
import { Event } from "../models/event";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getEventById,
  saveEvent,
  saveTicketTier,
} from "../repositories/event-repository";
import { TicketTierdto } from "../dto/request/create-ticket-tier-request";
import { TicketTier } from "../models/ticket-tier";

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

  if (event.organizerId != userId) {
    throw new Error("You are not authorized organizer to handle this event.");
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
