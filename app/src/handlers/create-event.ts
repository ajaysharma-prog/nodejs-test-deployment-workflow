import { APIGatewayProxyResult } from "aws-lambda";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { UserRole } from "../constants/user-role";
import { EventSchema } from "../dto/request/create-event-request";
import { z, ZodError } from "zod";
import { EventDetails } from "../dto/response/event-detail-response";
import { createEvent } from "../services/event-service";
import { ResponseMessage } from "../constants/response-message";
import { ApiError } from "../utils/api-error";

export type CreateEventDTO = z.infer<typeof EventSchema>;

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (
      event.requestContext.authorizer.role !== UserRole.ORGANIZER.toString()
    ) {
      throw new ApiError(403, ResponseMessage.UNAUTHORIZED_ACTION);
    }

    if (!event.body || event.body.trim() === "") {
      throw new ApiError(400, ResponseMessage.MISSING_RESPONSE_BODY);
    }

    const body = JSON.parse(event.body);

    const eventDto: CreateEventDTO = await EventSchema.parseAsync(body);
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
    if (error instanceof ApiError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message }),
      };
    } else if (error instanceof ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.VALIDATION_FAILED,
          errors: z.flattenError(error).fieldErrors,
        }),
      };
    } else if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.MALFORMED_JSON_BODY,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: ResponseMessage.INTERNAL_ERROR,
      }),
    };
  }
};
