import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Declined"
  | "Cancelled";

export type SecurityBooking = {
  id: string;
  userId: string;

  date: string;
  eventDate: string;
  startTime: string;
  eventTime: string;
  endTime: string;

  guards: number;
  guardsNeeded: number;
  address: string;

  eventType: string;
  serviceType: string;
  details: string;
  instructions: string;

  uniformRequired: boolean;

  privateInvestigation: boolean;
  investigationDetails: string;

  vipRequired: boolean;
  vipNames: string;
  vipDetails: string;

  movingFrom: string;
  movingTo: string;
  movingDate: string;
  movingAccess: string;
  itemsToProtect: string;

  alcoholServed: boolean;
  alcoholRequirements: string;
  alcoholCredential: string;

  expectedGuests: string;
  ageRestrictions: string;
  accessRequirements: string;

  status: BookingStatus;
  createdAt?: any;
  cancelledAt?: any;
};

export type NewBooking = Omit<
  SecurityBooking,
  "id" | "userId" | "status" | "createdAt" | "cancelledAt"
>;

/**
 * Creates a new booking request.
 * All new requests start as Pending and must be reviewed separately.
 */
export async function createBooking(
  booking: NewBooking
): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in before creating a booking.");
  }

  if (
    !booking.date ||
    !booking.eventDate ||
    !booking.startTime ||
    !booking.endTime ||
    !booking.address?.trim()
  ) {
    throw new Error(
      "Please complete the service date, times, and address."
    );
  }

  if (
    !Number.isInteger(booking.guardsNeeded) ||
    booking.guardsNeeded < 1 ||
    booking.guardsNeeded > 100
  ) {
    throw new Error("Enter between 1 and 100 guards.");
  }

  if (!booking.eventType?.trim() || !booking.serviceType?.trim()) {
    throw new Error("Please select an event and security service.");
  }

  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(booking.startTime) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(booking.endTime) ||
    booking.endTime <= booking.startTime
  ) {
    throw new Error(
      "Please enter valid 24-hour times, with the end time later than the start time."
    );
  }

  if ((booking.instructions ?? "").length > 2000) {
    throw new Error(
      "Special instructions cannot exceed 2,000 characters."
    );
  }

  if (
    booking.privateInvestigation &&
    !booking.investigationDetails?.trim()
  ) {
    throw new Error("Please provide details for the private investigation.");
  }

  if (booking.vipRequired && !booking.vipNames?.trim()) {
    throw new Error("Please provide the VIP names or identifying information.");
  }

  if (booking.alcoholServed && !booking.alcoholCredential?.trim()) {
    throw new Error(
      "Please specify the preferred alcohol-related qualification."
    );
  }

  const docRef = await addDoc(collection(db, "bookings"), {
    ...booking,
    date: booking.date,
    eventDate: booking.eventDate,
    address: booking.address.trim(),
    eventType: booking.eventType.trim(),
    serviceType: booking.serviceType.trim(),
    details: (booking.details ?? "").trim(),
    instructions: (booking.instructions ?? "").trim(),
    investigationDetails: (booking.investigationDetails ?? "").trim(),
    vipNames: (booking.vipNames ?? "").trim(),
    vipDetails: (booking.vipDetails ?? "").trim(),
    movingFrom: (booking.movingFrom ?? "").trim(),
    movingTo: (booking.movingTo ?? "").trim(),
    movingDate: (booking.movingDate ?? "").trim(),
    movingAccess: (booking.movingAccess ?? "").trim(),
    itemsToProtect: (booking.itemsToProtect ?? "").trim(),
    alcoholRequirements: (booking.alcoholRequirements ?? "").trim(),
    alcoholCredential: (booking.alcoholCredential ?? "").trim(),
    expectedGuests: (booking.expectedGuests ?? "").trim(),
    ageRestrictions: (booking.ageRestrictions ?? "").trim(),
    accessRequirements: (booking.accessRequirements ?? "").trim(),

    userId: user.uid,
    status: "Pending" satisfies BookingStatus,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Cancels a booking belonging to the currently signed-in user.
 * Firestore Security Rules must also enforce this ownership/status check.
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in before cancelling a booking.");
  }

  if (!bookingId?.trim()) {
    throw new Error("A valid booking ID is required.");
  }

  const bookingRef = doc(db, "bookings", bookingId);
  const bookingSnapshot = await getDoc(bookingRef);

  if (!bookingSnapshot.exists()) {
    throw new Error("This booking could not be found.");
  }

  const bookingData = bookingSnapshot.data();

  if (bookingData.userId !== user.uid) {
    throw new Error("You are not authorized to cancel this booking.");
  }

  if (bookingData.status === "Cancelled") {
    throw new Error("This booking has already been cancelled.");
  }

  await updateDoc(bookingRef, {
    status: "Cancelled",
    cancelledAt: serverTimestamp(),
  });
}

/**
 * Subscribes to the signed-in user's bookings in real time.
 * Returns the unsubscribe function from Firestore.
 */
export function subscribeToBookings(
  onBookings: (bookings: SecurityBooking[]) => void,
  onError?: (error: Error) => void
): () => void {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in to view your bookings.");
  }

  const bookingsQuery = query(
    collection(db, "bookings"),
    where("userId", "==", user.uid)
  );

  return onSnapshot(
    bookingsQuery,
    (snapshot) => {
      const bookings: SecurityBooking[] = snapshot.docs.map(
        (bookingDocument) => {
          const data = bookingDocument.data();

          return {
            ...(data as Omit<SecurityBooking, "id">),
            id: bookingDocument.id,
          };
        }
      );

      bookings.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? 0) -
          (a.createdAt?.toMillis?.() ?? 0)
      );

      onBookings(bookings);
    },
    (error) => {
      onError?.(error);
    }
  );
}
