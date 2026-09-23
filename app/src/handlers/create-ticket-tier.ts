import { APIGatewayProxyResult } from "aws-lambda";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { UserRole } from "../constants/user-role";
import {
  TicketTierdto,
  TicketTierSchema,
} from "../dto/request/create-ticket-tier-request";
import z from "zod";
import { createTicketTier } from "../services/event-service";
import { ResponseMessage } from "../constants/response-message";

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

    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.MISSING_PATH_URL,
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
    const result = TicketTierSchema.safeParse(body);
    if (!result.success) {
      const treeErrors = z.treeifyError(result.error);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.VALIDATION_FAILED,
          errors: treeErrors,
        }),
      };
    }

    const ticketTierdto: TicketTierdto = result.data;
    const userId = event.requestContext.authorizer.userId;

    await createTicketTier(userId, eventId, ticketTierdto);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: ResponseMessage.CREATE_TICKET_TIER_SUCCESS,
      }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isAuthError = errorMessage.includes("authorized");

    return {
      statusCode: isAuthError ? 403 : 500,
      body: JSON.stringify({
        message: isAuthError
          ? "Authorization Denied"
          : "Internal server error occurred.",
        error: errorMessage,
      }),
    };
  }
};
