import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export async function registerUser(name: string, email: string, password: string) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    throw new Error("Please complete all fields.");
  }
  if (password.length < 6) {
    throw new Error("Your password must contain at least 6 characters.");
  }

  const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  try {
    await updateProfile(result.user, { displayName: cleanName });
    await setDoc(doc(db, "users", result.user.uid), {
      name: cleanName,
      email: cleanEmail,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    await signOut(auth);
    throw error;
  }

  return result.user;
}

export async function loginUser(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error("Please enter your email and password.");
  }

  return (await signInWithEmailAndPassword(auth, cleanEmail, password)).user;
}

export async function logoutUser() {
  await signOut(auth);
}