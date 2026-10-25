import type { Metadata } from "next";

import { ReservationDetail } from "./reservation-detail";

export const metadata: Metadata = {
  title: "Reservation",
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = await params;

  return <ReservationDetail reservationId={reservationId} />;
}
