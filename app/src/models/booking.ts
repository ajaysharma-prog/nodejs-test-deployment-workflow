export interface BookedTicket {
  tierId: string;
  unitPrice: number;
  numberOfTicketBooked: number;
}

export interface Booking {
  bookingId: string;
  eventId: string;
  totalAmount: number;
  attendeeId: string;
  tickets: BookedTicket[];
}
