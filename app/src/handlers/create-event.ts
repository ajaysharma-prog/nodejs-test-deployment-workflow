import { APIGatewayProxyResult } from "aws-lambda";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { UserRole } from "../constants/user-role";
import { EventSchema } from "../dto/request/create-event-request";
import { z } from "zod";
import { EventDetails } from "../dto/response/event-detail-response";
import { createEvent } from "../services/event-service";
import { ResponseMessage } from "../constants/response-message";

export type CreateEventDTO = z.infer<typeof EventSchema>;

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (
      event.requestContext.authorizer.role !== UserRole.ORGANIZER.toString()
    ) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: ResponseMessage.UNAUTHORIZED,
        }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.MISSING_RESPONSE_BODY,
        }),
      };
    }

    const body = JSON.parse(event.body);

    const result = EventSchema.safeParse(body);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.VALIDATION_FAILED,
          errors: flattened.fieldErrors,
        }),
      };
    }

    const eventDto: CreateEventDTO = result.data;
    const organizerId = event.requestContext.authorizer.userId;
    const eventDetails: EventDetails = await createEvent(organizerId, eventDto);
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: ResponseMessage.CREATE_EVENT_SUCCESS,
        eventDetails: eventDetails,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: ResponseMessage.INTERNAL_ERROR,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
