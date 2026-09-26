export interface BookingDetails {
  bookingId: string;
  totalAmount: number;
  ticketDetails: {
    tierId: string;
    seatBooked: number;
  }[];
}
