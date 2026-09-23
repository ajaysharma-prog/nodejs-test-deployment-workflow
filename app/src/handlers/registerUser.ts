import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { RegisterUserDto } from "../dto/request/RegisterUserRequestDTO";
import { ResponseMessage } from "../constant/ResponseMessage";
import { registerUser } from "../services/UserService";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.MISSING_RESPONSE_BODY,
        }),
      };
    }

    const body: RegisterUserDto = JSON.parse(event.body);

    if (!body.email || !body.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: ResponseMessage.EMAIL_PASSWORD_REQUIRED,
        }),
      };
    }

    const createdUser = await registerUser(body);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.REGISTRATION_SUCCESS,
        user: createdUser,
      }),
    };
  } catch (error: any) {
    console.error("Registration error:", error);

    if (
      error.message === ResponseMessage.USER_ALREADY_EXISTS ||
      error.name === "ConditionalCheckFailedException" ||
      error.__type?.endsWith("#ConditionalCheckFailedException")
    ) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: ResponseMessage.INTERNAL_ERROR }),
    };
  }
};
