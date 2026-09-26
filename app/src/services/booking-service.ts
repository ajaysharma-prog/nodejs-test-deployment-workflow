import { randomUUID } from "crypto";
import { ResponseMessage } from "../constants/response-message";
import { CreateBookingDto } from "../dto/request/create-booking-request";
import { TicketTierDetails } from "../dto/response/ticket-tier-response";
import { Booking } from "../models/booking";
import { getEventTicketTier } from "../repositories/event-repository";
import { ApiError } from "../utils/api-error";
import { fetchBooking, saveBooking } from "../repositories/booking-repository";
import { BookingDetails } from "../dto/response/booking-details";

export async function createBooking(
  attendeeId: string,
  createBookingDto: CreateBookingDto,
): Promise<void> {
  const availableTicketTier: TicketTierDetails[] = await getEventTicketTier(
    createBookingDto.eventId,
  );

  const ticketTierMap = new Map<
    string,
    { price: number; availableCapacity: number }
  >();
  availableTicketTier.forEach((tier) => {
    ticketTierMap.set(tier.tierId, {
      price: tier.price,
      availableCapacity: tier.availableCapacity,
    });
  });

  let totalAmount = 0;
  const bookedTickets: Booking["tickets"] = [];

  for (const ticketDetails of createBookingDto.ticketDetails) {
    const tierMeta = ticketTierMap.get(ticketDetails.tierId);

    if (!tierMeta) {
      throw new ApiError(
        404,
        `${ResponseMessage.TICKET_TIER_NOT_FOUND} with id ${ticketDetails.tierId}`,
      );
    }

    if (tierMeta.availableCapacity < ticketDetails.quantity) {
      throw new ApiError(
        400,
        `Requested ticket quantity for tier ${ticketDetails.tierId} exceeds available stock.`,
      );
    }

    totalAmount += tierMeta.price * ticketDetails.quantity;

    bookedTickets.push({
      tierId: ticketDetails.tierId,
      unitPrice: tierMeta.price,
      numberOfTicketBooked: ticketDetails.quantity,
    });
  }

  const booking: Booking = {
    bookingId: randomUUID(),
    attendeeId: attendeeId,
    eventId: createBookingDto.eventId,
    tickets: bookedTickets,
    totalAmount: totalAmount,
  };
  console.log(`Total ammount: ${booking.totalAmount}`);
  console.log(booking);
  await saveBooking(booking);
}

export async function getBooking(userId: string): Promise<BookingDetails[]> {
  const bookings = await fetchBooking(userId);

  return bookings.map((booking) => ({
    bookingId: booking.bookingId,
    totalAmount: booking.totalAmount,
    ticketDetails: booking.tickets.map((ticket) => ({
      tierId: ticket.tierId,
      seatBooked: ticket.numberOfTicketBooked,
    })),
  }));
}
