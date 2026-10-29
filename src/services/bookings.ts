import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type BookingStatus = "Pending" | "Confirmed" | "Declined" | "Cancelled";

export type SecurityBooking = {
  id: string;
  userId: string;
  date: string;
  guards: number;
  eventDate: string;
  guardsNeeded: number;
  startTime: string;
  eventTime: string;
  endTime: string;
  address: string;
  details: string;
  instructions: string;
  status: BookingStatus;
  createdAt?: any;
};

export type NewBooking = Omit<
  SecurityBooking,
  "id" | "userId" | "status" | "createdAt"
>;

export async function createBooking(booking: NewBooking) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please log in before creating a booking.");

  if (
    !booking.eventDate ||
    !booking.startTime ||
    !booking.endTime ||
    !booking.address.trim()
  ) {
    throw new Error("Please complete the event date, times, and address.");
  }
  if (!Number.isInteger(booking.guardsNeeded) || booking.guardsNeeded < 1) {
    throw new Error("At least one guard is required.");
  }

  const docRef = await addDoc(collection(db, "bookings"), {
    ...booking,
    address: booking.address.trim(),
    details: booking.details.trim(),
    instructions: booking.instructions.trim(),
    userId: user.uid,
    status: "Pending",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribeToBookings(
  onBookings: (bookings: SecurityBooking[]) => void,
  onError?: (error: Error) => void
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please log in to view your bookings.");

  const bookingsQuery = query(
    collection(db, "bookings"),
    where("userId", "==", user.uid)
  );

  return onSnapshot(
    bookingsQuery,
    (snapshot) => {
      const bookings: SecurityBooking[] = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<SecurityBooking, "id">),
      }));

      bookings.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );

      onBookings(bookings);
    },
    (error) => onError?.(error)
  );
}