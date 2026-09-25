import { APIGatewayProxyResult } from "aws-lambda";
import { ResponseMessage } from "../constant/ResponseMessage";
import { getUser } from "../services/UserService";
import { AuthenticatedRequestEvent } from "../utils/authenticatedRequestEvent";
import { UserResponse } from "../dto/response/UserResponseDTO";

export const handler = async (event: AuthenticatedRequestEvent): Promise<APIGatewayProxyResult> => {
  try {
    const email = event.requestContext.authorizer.email;

    if (!email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Email claim is missing" }),
      };
    }

    const userDetails: UserResponse = await getUser(email);

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
