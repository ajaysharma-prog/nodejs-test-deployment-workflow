import { APIGatewayProxyResult } from "aws-lambda";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { UserRole } from "../constants/user-role";
import {
  TicketTierdto,
  TicketTierSchema,
} from "../dto/request/create-ticket-tier-request";
import z, { ZodError } from "zod";
import { createTicketTier } from "../services/event-service";
import { ResponseMessage } from "../constants/response-message";
import { ApiError } from "../utils/api-error";

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (
      event.requestContext.authorizer.role !== UserRole.ORGANIZER.toString()
    ) {
      throw new ApiError(403, ResponseMessage.UNAUTHORIZED_ACTION);
    }

    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      throw new ApiError(404, ResponseMessage.MISSING_PATH_URL);
    }

    if (!event.body || event.body.trim() === "") {
      throw new ApiError(400, ResponseMessage.MISSING_RESPONSE_BODY);
    }

    const body = JSON.parse(event.body);

    const ticketTierdto: TicketTierdto =
      await TicketTierSchema.parseAsync(body);
    const userId = event.requestContext.authorizer.userId;
    await createTicketTier(userId, eventId, ticketTierdto);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.CREATE_TICKET_TIER_SUCCESS,
      }),
    };
  } catch (error) {
    console.log(`Application Error: ${error}`);

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
          errors: error.issues.map((issue) => issue.message),
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
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
