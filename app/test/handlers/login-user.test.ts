import { describe, vi, it, expect } from "vitest";
import { handler } from "../../src/handlers/login-user";
import { TestConstant } from "../constants/test-constant";
import { LoginUserSchema } from "../../src/dto/request/login-user-request";
import { loginUser } from "../../src/services/user-service";
import { APIGatewayProxyEvent } from "aws-lambda";
import { ResponseMessage } from "../../src/constants/response-message";
import z, { ZodError } from "zod";

vi.mock("../../src/services/user-service", () => ({
  loginUser: vi.fn(),
}));

vi.mock("../../src/dto/request/login-user-request", () => ({
  LoginUserSchema: {
    parseAsync: vi.fn(),
  },
}));

describe("login user handler unit test", () => {
  const body = {
    email: TestConstant.CORRECT_TEST_EMAIL,
    password: TestConstant.CORRECT_TEST_PASSWORD,
  };

  it("return JWT Token and statuscode 200 when user enter correct credientals", async () => {
    vi.mocked(LoginUserSchema.parseAsync).mockResolvedValue(body);
    vi.mocked(loginUser).mockResolvedValue(TestConstant.TEST_JWT_TOKEN);
    const event = {
      body: JSON.stringify(body),
    } as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.LOGIN_USER_SUCCESS,
        jwtToken: TestConstant.TEST_JWT_TOKEN,
      }),
    );

    expect(loginUser).toHaveBeenCalledTimes(1);
    expect(LoginUserSchema.parseAsync).toHaveBeenCalledTimes(1);
  });

  it("throw ApiError when body is missing", async () => {
    const event = {
      body: null,
    } as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.MISSING_RESPONSE_BODY,
      }),
    );

    expect(loginUser).toHaveBeenCalledTimes(0);
    expect(LoginUserSchema.parseAsync).toHaveBeenCalledTimes(0);
  });

  it("throw ZodError when body when dto validation failed", async () => {
    const event = {
      body: JSON.stringify(body),
    } as APIGatewayProxyEvent;

    const zodError = new ZodError([
      {
        path: ["email"],
        code: "custom",
        message: ResponseMessage.VALIDATION_FAILED,
      },
    ]);

    vi.mocked(LoginUserSchema.parseAsync).mockRejectedValue(zodError);

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.VALIDATION_FAILED,
        errors: z.flattenError(zodError).fieldErrors,
      }),
    );

    expect(loginUser).toHaveBeenCalledTimes(0);
    expect(LoginUserSchema.parseAsync).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when Body in wrong JSON format", async () => {
    const event = {
      body: TestConstant.TEST_WRONG_JSON,
    } as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.MALFORMED_JSON_BODY,
      }),
    );
    expect(LoginUserSchema.parseAsync).toHaveBeenCalledTimes(0);
    expect(loginUser).toHaveBeenCalledTimes(0);
  });
});
