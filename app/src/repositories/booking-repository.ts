import { QueryCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../config/dynamo-db";
import { Booking } from "../models/booking";
import { ApiError } from "../utils/api-error";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { ResponseMessage } from "../constants/response-message";

export async function saveBooking(booking: Booking): Promise<void> {
  const transactItems: any[] = [
    {
      Update: {
        TableName: process.env.TABLE_NAME,
        Key: { PK: `USER#${booking.attendeeId}`, SK: "METADATA" },
        UpdateExpression: "SET #balanceAttr = #balanceAttr - :ticketAmount",
        ConditionExpression:
          "attribute_exists(#balanceAttr) AND #balanceAttr >= :ticketAmount",
        ExpressionAttributeNames: {
          "#balanceAttr": "walletBalance",
        },
        ExpressionAttributeValues: {
          ":ticketAmount": booking.totalAmount,
        },
      },
    },
  ];

  for (let ticket of booking.tickets) {
    transactItems.push({
      Update: {
        TableName: process.env.TABLE_NAME!,
        Key: {
          PK: `EVENT#${booking.eventId}`,
          SK: `TIER#${ticket.tierId}`,
        },
        UpdateExpression:
          "SET #capacityAttr = #capacityAttr - :requiredTicketQuantity",
        ConditionExpression:
          "attribute_exists(#capacityAttr) AND #capacityAttr >= :requiredTicketQuantity",
        ExpressionAttributeNames: {
          "#capacityAttr": "availableCapacity",
        },
        ExpressionAttributeValues: {
          ":requiredTicketQuantity": ticket.numberOfTicketBooked,
        },
      },
    });
  }

  transactItems.push({
    Put: {
      TableName: process.env.TABLE_NAME!,
      Item: {
        PK: `USER#${booking.attendeeId}`,
        SK: `BOOKING#${booking.bookingId}`,
        ...booking,
      },
    },
  });
  try {
    await dynamoDb.send(
      new TransactWriteCommand({ TransactItems: transactItems }),
    );
  } catch (error: any) {
    console.log(error);
    if (error instanceof TransactionCanceledException) {
      const walletReason = error.CancellationReasons?.[0];

      if (walletReason?.Code === "ConditionalCheckFailed") {
        throw new ApiError(400, "Booking failed: Insufficient wallet balance.");
      }

      throw new ApiError(
        400,
        "Booking failed: Selected ticket tiers are sold out.",
      );
    }

    throw error;
  }
}

export async function fetchBooking(userId: string): Promise<Booking[]> {
  const bookings = await dynamoDb.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skprefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":skprefix": "BOOKING#",
      },
    }),
  );

  if (!bookings.Items || bookings.Items.length === 0) {
    throw new ApiError(404, ResponseMessage.NO_BOOKING_FOUND);
  }

  return bookings.Items as Booking[];
}
