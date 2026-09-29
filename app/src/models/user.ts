import { UserRole } from "../constants/user-role";

export interface User {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  walletBalance: number;
}
