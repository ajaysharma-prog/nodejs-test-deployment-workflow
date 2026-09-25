import { UserRole } from "../constant/UserRole";

export interface User {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  walletBalance: number;
}
