import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ResponseMessage } from "../constants/response-message";
import {
  LoginUserDto,
  LoginUserSchema,
} from "../dto/request/login-user-request";
import { loginUser } from "../services/user-service";
import { ApiError } from "../utils/api-error";
import z, { ZodError } from "zod";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body || event.body.trim() === "") {
      throw new ApiError(400, ResponseMessage.MISSING_RESPONSE_BODY);
    }

    const body = JSON.parse(event.body);
    const loginUserDto: LoginUserDto = await LoginUserSchema.parseAsync(body);
    const jwtToken = await loginUser(loginUserDto);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.LOGIN_USER_SUCCESS,
        jwtToken: jwtToken,
      }),
    };
  } catch (error: any) {
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
      body: JSON.stringify({ message: ResponseMessage.INTERNAL_ERROR }),
    };
  }
};
