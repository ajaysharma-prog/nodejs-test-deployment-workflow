import { describe, expect, it, vi } from "vitest";
import { TestConstant } from "../constants/test-constant";
import { getUser } from "../../src/services/user-service";
import { UserDetails } from "../../src/dto/response/user-detail-response";
import { handler } from "../../src/handlers/get-user";
import { AuthenticatedRequestEvent } from "../../src/utils/authenticated-api-gateway-event";
import { ResponseMessage } from "../../src/constants/response-message";

vi.mock("../../src/services/user-service", () => ({
  getUser: vi.fn(),
}));

describe("get user unit test suite", () => {
  it("should return login user details", async () => {
    const event = {
      requestContext: {
        authorizer: {
          email: TestConstant.CORRECT_TEST_EMAIL,
        },
      },
    } as AuthenticatedRequestEvent;

    const userDetails: UserDetails = {
      userId: TestConstant.TEST_USER_ID,
      email: TestConstant.CORRECT_TEST_EMAIL,
      name: TestConstant.TEST_NAME,
      role: "ORGANIZER",
      walletBalance: TestConstant.TEST_WALLET_BALANCE,
    };

    vi.mocked(getUser).mockResolvedValue(userDetails);

    const response = await handler(event);

    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.SUCCESS,
        userDetails: userDetails,
      }),
    );
    expect(response.statusCode).toBe(200);
  });

  it("should return statuscode 400 when email is null", async () => {
    const event = {
      requestContext: {
        authorizer: {
          email: null,
        },
      },
    } as unknown as AuthenticatedRequestEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({
        message: ResponseMessage.EMAIL_CLAIM_NOT_FOUND,
      }),
    );
  });
});
