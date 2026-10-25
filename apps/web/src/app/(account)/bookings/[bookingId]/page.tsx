import type { Metadata } from "next";

import { BookingDetail } from "./booking-detail";

export const metadata: Metadata = {
  title: "Booking details",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return <BookingDetail bookingId={bookingId} />;
}
