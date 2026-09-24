import { APIGatewayProxyResult } from "aws-lambda";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { ResponseMessage } from "../constants/response-message";
import { EventDetails } from "../dto/response/event-detail-response";
import { getEventWithTicketTier } from "../services/event-service";
import { ApiError } from "../utils/api-error";

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      throw new ApiError(404, ResponseMessage.MISSING_PATH_URL);
    }

    const eventDetails: EventDetails | null =
      await getEventWithTicketTier(eventId);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.SUCCESS,
        eventDetails: eventDetails,
      }),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        statusCode: error.statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: error.message }),
      };
    }
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: ResponseMessage.INTERNAL_ERROR }),
    };
  }
};
