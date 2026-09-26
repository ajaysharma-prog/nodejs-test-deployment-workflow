import { APIGatewayProxyResult } from "aws-lambda";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { ApiError } from "../utils/api-error";
import { ResponseMessage } from "../constants/response-message";
import { BookingDetails } from "../dto/response/booking-details";
import { getBooking } from "../services/booking-service";

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const bookingDetails: BookingDetails[] = await getBooking(userId);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.SUCCESS,
        eventDetails: bookingDetails,
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
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: ResponseMessage.INTERNAL_ERROR,
      }),
    };
  }
};
