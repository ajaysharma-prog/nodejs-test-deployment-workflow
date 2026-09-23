import {
  BatchWriteCommand,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../config/dynamo-db";
import { Event } from "../models/event";
import { TicketTier } from "../models/ticket-tier";

export async function saveEvent(event: Event): Promise<void> {
  const dbItem = {
    ...event,
    PK: `EVENT#${event.eventId}`,
    SK: "METADATA",
    GSI2PK: "EVENT",
    GSI2SK: `${event.eventDate}`,
  };

  await dynamoDb.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME!,
      Item: dbItem,
    }),
  );
}

export async function getEventById(eventId: string): Promise<Event> {
  const response = await dynamoDb.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME!,
      Key: {
        PK: `EVENT#${eventId}`,
        SK: "METADATA",
      },
    }),
  );

  if (!response.Item) {
    throw new Error(`Event with ID ${eventId} not found.`);
  }
  return response.Item as Event;
}

export async function saveTicketTier(ticketTiers: TicketTier[]): Promise<void> {
  const tableName = process.env.TABLE_NAME!;

  const writeRequests = ticketTiers.map((tier) => ({
    PutRequest: {
      Item: {
        ...tier,
        PK: `EVENT#${tier.eventId}`,
        SK: `TIER#${tier.tierId}`,
        createdAt: new Date().toISOString(),
      },
    },
  }));
  const BATCH_LIMIT = 25;
  for (let i = 0; i < writeRequests.length; i += BATCH_LIMIT) {
    const chunk = writeRequests.slice(i, i + BATCH_LIMIT);

    const command = new BatchWriteCommand({
      RequestItems: {
        [tableName]: chunk,
      },
    });

    await dynamoDb.send(command);
  }
}
