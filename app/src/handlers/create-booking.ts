import { APIGatewayProxyResult } from "aws-lambda";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { ApiError } from "../utils/api-error";
import { ResponseMessage } from "../constants/response-message";
import {
  CreateBookingDto,
  CreateBookingSchema,
} from "../dto/request/create-booking-request";
import z, { ZodError } from "zod";
import { createBooking } from "../services/booking-service";

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const attendeeId: string = event.requestContext.authorizer.userId;

    if (!event.body || event.body.trim() === "") {
      throw new ApiError(400, ResponseMessage.MISSING_RESPONSE_BODY);
    }
    const body = JSON.parse(event.body);

    const createBookingDto: CreateBookingDto =
      await CreateBookingSchema.parseAsync(body);
    await createBooking(attendeeId, createBookingDto);
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.CREATE_BOOKING_SUCCESS,
      }),
    };
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          message: error.message,
        }),
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
      statusCode: 400,
      body: JSON.stringify({
        message: ResponseMessage.INTERNAL_ERROR,
      }),
    };
  }
};
