import { UserRole } from "../../constant/UserRole";

export interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: "ATTENDEE" | "ORGANIZER";
  walletBalance: number;
}
