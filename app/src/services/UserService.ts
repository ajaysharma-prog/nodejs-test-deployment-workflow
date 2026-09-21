import { randomUUID } from "crypto";
import { RegisterUserDto } from "../dto/request/RegisterUserRequestDTO"
import { UserRole } from "../constant/UserRole"
import { User } from "../models/User";
import { ResponseMessage } from "../constant/ResponseMessage";
import { comparePassword, hashPassword } from "../utils/passwordUtil";
import { UserResponse } from "../dto/response/UserResponseDTO"
import { createUser, findByEmail } from "../repositories/UserRepository";
import { LoginUserDto } from "../dto/request/LoginUserRequestDTO";
import { getSecret } from "../utils/secretUtils";
import { SignJWT } from "jose";


export async function registerUser(request: RegisterUserDto): Promise<UserResponse> {
    const name = request.name.trim();
    const email = request.email.trim().toLowerCase();

    const existingUser = await findByEmail(email);
    if (existingUser) {
        throw new Error(ResponseMessage.USER_ALREADY_EXISTS);
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(request.password);

    const roleMap: Record<string, UserRole> = {
        "ATTENDEE": UserRole.ATTENDEE,
        "ORGANIZER": UserRole.ORGANIZER
    };

    const frontendRoleInput = request.role?.toUpperCase() || "ATTENDEE";
    const targetRole = roleMap[frontendRoleInput] || UserRole.ATTENDEE;

    const user: User = {
        userId,
        name,
        email,
        passwordHash,
        role: targetRole,
        walletBalance: 5000
    };

    await createUser(user);

    const registerUserResponse: UserResponse = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: UserRole[user.role],                  
      walletBalance: user.walletBalance
    };

    return registerUserResponse;
}

export async function loginUser(loginUserDto: LoginUserDto) {
    const email = loginUserDto.email.trim().toLowerCase();

    const user = await findByEmail(email);
    if (user == null || ! await comparePassword(loginUserDto.password, user.passwordHash)) {
        throw new Error(ResponseMessage.INVALID_LOGIN_CREDIENTAL);
    }

    const secretKey = await getSecret(`/myapp/${process.env.ENVIRONMENT}/JWT_SECRET_KEY`);
    const secret =  new TextEncoder().encode(secretKey);
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

export async function getUser(email : string) : Promise<UserResponse> {

    const user = await findByEmail(email);
    if (user == null) {
        throw new Error("User not found");
    }

    const userDetails: UserResponse = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: UserRole[user.role].toString(),                  
      walletBalance: user.walletBalance
    };

    return userDetails;
}
