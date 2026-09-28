import { describe, it, expect, vi } from "vitest";
import { RegisterUserSchema } from "../../src/dto/request/register-user-request";
import { registerUser } from "../../src/services/user-service";
import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../src/handlers/register-user";
import { ResponseMessage } from "../../src/constants/response-message";
import z, { ZodError } from "zod";
import { TestConstant } from "../constants/test-constant";
vi.mock("../../src/services/user-service", () => ({
  registerUser: vi.fn(),
}));

vi.mock("../../src/dto/request/register-user-request", () => ({
  RegisterUserSchema: {
    parseAsync: vi.fn(),
  },
}));

describe("register handler unit test", () => {
  const body = {
    name: TestConstant.TEST_NAME,
    email: TestConstant.CORRECT_TEST_EMAIL,
    role: TestConstant.ORGANIZER_TEST_ROLE,
    password: TestConstant.CORRECT_TEST_PASSWORD,
  };

  const createdUser = {
    userId: TestConstant.TEST_USER_ID,
    name: TestConstant.TEST_NAME,
    email: TestConstant.CORRECT_TEST_EMAIL,
    role: TestConstant.ORGANIZER_TEST_ROLE,
    password: TestConstant.CORRECT_TEST_PASSWORD,
    walletBalance: TestConstant.TEST_WALLET_BALANCE,
  };
  it("should register user successfully", async () => {
    //ARRANGE
    vi.mocked(RegisterUserSchema.parseAsync).mockResolvedValue(body);
    vi.mocked(registerUser).mockResolvedValue(createdUser);

    const event = {
      body: JSON.stringify(body),
    } as APIGatewayProxyEvent;

    //ACT
    const response = await handler(event);

    //ASSERT
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      message: ResponseMessage.REGISTRATION_SUCCESS,
      user: createdUser,
    });
    expect(registerUser).toHaveBeenCalledWith(body);

    expect(RegisterUserSchema.parseAsync).toHaveBeenCalledWith(body);
  });

  it("should return 400 when is missing", async () => {
    const event = {
      body: null,
    } as APIGatewayProxyEvent;

    vi.mocked(RegisterUserSchema.parseAsync).mockResolvedValue(body);
    vi.mocked(registerUser).mockResolvedValue(createdUser);

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.MISSING_RESPONSE_BODY,
      }),
    );
    expect(RegisterUserSchema.parseAsync).toHaveBeenCalledTimes(0);
    expect(registerUser).toHaveBeenCalledTimes(0);
  });

  it("should return 400 when Body in wrong JSON format", async () => {
    const event = {
      body: TestConstant.TEST_WRONG_JSON,
    } as APIGatewayProxyEvent;

    vi.mocked(RegisterUserSchema.parseAsync).mockResolvedValue(body);
    vi.mocked(registerUser).mockResolvedValue(createdUser);

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.MALFORMED_JSON_BODY,
      }),
    );
    expect(RegisterUserSchema.parseAsync).toHaveBeenCalledTimes(0);
    expect(registerUser).toHaveBeenCalledTimes(0);
  });

  it("should return 400 when Validation failed", async () => {
    const validationError = new ZodError([
      {
        code: "custom",
        message: "invalid email",
        path: ["email"],
      },
    ]);
    const event = {
      body: JSON.stringify(body),
    } as APIGatewayProxyEvent;

    vi.mocked(RegisterUserSchema.parseAsync).mockRejectedValue(validationError);

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.VALIDATION_FAILED,
        errors: z.flattenError(validationError).fieldErrors,
      }),
    );
    expect(RegisterUserSchema.parseAsync).toHaveBeenCalledTimes(1);
    expect(registerUser).toHaveBeenCalledTimes(0);
  });
});
