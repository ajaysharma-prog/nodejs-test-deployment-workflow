export const ResponseMessage = {
  MISSING_RESPONSE_BODY: "Response Body is missing.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  INTERNAL_ERROR: "An unexpected error occurred.",
  EMAIL_PASSWORD_REQUIRED: "Email and Password are required.",
  REGISTRATION_SUCCESS: "User registered successfully.",
  USER_ALREADY_EXISTS: "User already exists",
  SSM_PARAMETER_NOT_FOUND: "SSM parameter not found.",
  INVALID_LOGIN_CREDIENTAL: "Invalid email or password.",
  LOGIN_USER_SUCCESS: "Login Successfully.",
  VALIDATION_FAILED: "Validation Failed.",
  CREATE_EVENT_SUCCESS: "Event created successfully!",
  MISSING_PATH_URL: "Missing required URL path parameter",
  CREATE_TICKET_TIER_SUCCESS:
    "Ticket tiers created successfully for this event.",
} as const;
