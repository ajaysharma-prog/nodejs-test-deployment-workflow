import { APIGatewayProxyEvent } from "aws-lambda";
import { APIGatewayProxyResult } from "aws-lambda";
import { ResponseMessage } from "../constants/response-message";
import { EventDetails } from "../dto/response/event-detail-response";
import { getAllEvents } from "../services/event-service";
import { ApiError } from "../utils/api-error";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const events: EventDetails[] = await getAllEvents();
    if (events.length === 0) {
      throw new ApiError(404, ResponseMessage.NO_EVENT_FOUND);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.SUCCESS,
        eventsDetails: events,
      }),
    };
  } catch (error) {
    console.log(`Application Error: ${error}`);

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
