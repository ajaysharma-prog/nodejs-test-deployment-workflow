import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseMessage } from "../constant/ResponseMessage";
import { LoginUserDto } from "../dto/request/LoginUserRequestDTO";
import { loginUser } from "../services/UserService";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: ResponseMessage.MISSING_RESPONSE_BODY }),
      };
    }

    const body: LoginUserDto = JSON.parse(event.body);

    if (!body.email || !body.password) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: ResponseMessage.INVALID_LOGIN_CREDIENTAL }),
      };
    }

    const jwtToken = await loginUser(body);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.LOGIN_USER_SUCCESS,
        jwtToken: jwtToken,
      }),
    };

  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.message === ResponseMessage.INVALID_LOGIN_CREDIENTAL) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: ResponseMessage.INTERNAL_ERROR }),
    };
  }
};
