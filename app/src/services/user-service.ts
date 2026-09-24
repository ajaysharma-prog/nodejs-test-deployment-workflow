import { randomUUID } from "crypto";
import { RegisterUserDto } from "../dto/request/register-user-request";
import { UserRole } from "../constants/user-role";
import { User } from "../models/user";
import { ResponseMessage } from "../constants/response-message";
import { comparePassword, hashPassword } from "../utils/password-utils";
import { UserDetails } from "../dto/response/user-detail-response";
import { createUser, findByEmail } from "../repositories/user-repository";
import { LoginUserDto } from "../dto/request/login-user-request";
import { getSecret } from "../utils/ssm-secret-util";
import { SignJWT } from "jose";
import { ApiError } from "../utils/api-error";

export async function registerUser(
  request: RegisterUserDto,
): Promise<UserDetails> {
  const name = request.name.trim();
  const email = request.email.trim().toLowerCase();

  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, ResponseMessage.USER_ALREADY_EXISTS);
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(request.password);

  const roleMap: Record<string, UserRole> = {
    ATTENDEE: UserRole.ATTENDEE,
    ORGANIZER: UserRole.ORGANIZER,
  };

  const frontendRoleInput = request.role?.toUpperCase() || "ATTENDEE";
  const targetRole = roleMap[frontendRoleInput] || UserRole.ATTENDEE;

  const user: User = {
    userId,
    name,
    email,
    passwordHash,
    role: targetRole,
    walletBalance: 5000,
  };

  await createUser(user);

  const registerUserResponse: UserDetails = {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: UserRole[user.role],
    walletBalance: user.walletBalance,
  };

  return registerUserResponse;
}

export async function loginUser(loginUserDto: LoginUserDto): Promise<string> {
  const email = loginUserDto.email.trim().toLowerCase();

  const user = await findByEmail(email);
  if (
    user == null ||
    !(await comparePassword(loginUserDto.password, user.passwordHash))
  ) {
    throw new ApiError(401, ResponseMessage.INVALID_LOGIN_CREDIENTAL);
  }

  const secretKey = await getSecret(
    `/myapp/${process.env.ENVIRONMENT}/JWT_SECRET_KEY`,
  );
  const secret = new TextEncoder().encode(secretKey);
  const jwtToken = await new SignJWT({
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(randomUUID())
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return jwtToken;
}

export async function getUser(email: string): Promise<UserDetails> {
  const user = await findByEmail(email);
  if (user == null) {
    throw new ApiError(404, ResponseMessage.USER_NOT_FOUND);
  }

  const userDetails: UserDetails = {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: UserRole[user.role].toString(),
    walletBalance: user.walletBalance,
  };

  return userDetails;
}
