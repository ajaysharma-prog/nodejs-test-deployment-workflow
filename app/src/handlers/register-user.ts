import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  RegisterUserDto,
  RegisterUserSchema,
} from "../dto/request/register-user-request";
import { ResponseMessage } from "../constants/response-message";
import { registerUser } from "../services/user-service";
import { ApiError } from "../utils/api-error";
import z, { ZodError } from "zod";

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body || event.body.trim() === "") {
      throw new ApiError(400, ResponseMessage.MISSING_RESPONSE_BODY);
    }

    const body: RegisterUserDto = JSON.parse(event.body);
    const validation: RegisterUserDto =
      await RegisterUserSchema.parseAsync(body);

    const registerUserDto: RegisterUserDto = validation;
    const createdUser = await registerUser(registerUserDto);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: ResponseMessage.REGISTRATION_SUCCESS,
        user: createdUser,
      }),
    };
  } catch (error) {
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
