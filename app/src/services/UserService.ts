import { randomUUID } from "crypto";
import { RegisterUserDto } from "../dto/request/RegisterUserRequestDTO"
import { UserRole } from "../constant/UserRole"
import { User } from "../models/User";
import { ResponseMessage } from "../constant/ResponseMessage";
import { hashPassword } from "../utils/passwordUtil";
import { UserResponse } from "../dto/response/RegisterUserResponseDTO"
import { createUser, findByEmail } from "../repositories/UserRepository";


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
      role: request.role,                  
      walletBalance: user.walletBalance
    };

    return registerUserResponse;
}
