import { APIGatewayProxyResult } from "aws-lambda";
import { ResponseMessage } from "../constants/response-message";
import { getUser } from "../services/user-service";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { UserDetails } from "../dto/response/user-detail-response";
import { ApiError } from "../utils/api-error";

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const email = event.requestContext.authorizer.email;

    if (!email) {
      throw new ApiError(400, ResponseMessage.EMAIL_CLAIM_NOT_FOUND);
    }

    const userDetails: UserDetails = await getUser(email);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: ResponseMessage.SUCCESS,
        userDetails: userDetails,
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
