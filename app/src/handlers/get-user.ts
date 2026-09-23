import { APIGatewayProxyResult } from "aws-lambda";
import { ResponseMessage } from "../constants/response-message";
import { getUser } from "../services/user-service";
import { AuthenticatedRequestEvent } from "../utils/authenticated-api-gateway-event";
import { UserDetails } from "../dto/response/user-detail-response";

export const handler = async (
  event: AuthenticatedRequestEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const email = event.requestContext.authorizer.email;

    if (!email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Email claim is missing" }),
      };
    }

    const userDetails: UserDetails = await getUser(email);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Success",
        userDetails: userDetails,
      }),
    };
  } catch (error: any) {
    if (error.message === "User not found") {
      return {
        statusCode: 404,
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
