import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfileEmail } from "@/src/storage/profile";

export type Note = {
  id: string;
  title: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
};

function keyForEmail(email: string) {
  return `notes_v1_${email.trim().toLowerCase()}`;
}

async function getEmailOrThrow() {
  const email = await getProfileEmail();
  if (!email) throw new Error("Немає email. Увійдіть знову.");
  return email;
}

export async function loadNotes(): Promise<Note[]> {
  const email = await getEmailOrThrow();
  const key = keyForEmail(email);

  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveNotes(notes: Note[]) {
  const email = await getEmailOrThrow();
  const key = keyForEmail(email);
  await AsyncStorage.setItem(key, JSON.stringify(notes));
}

export async function clearNotesForCurrentUser() {
  const email = await getEmailOrThrow();
  const key = keyForEmail(email);
  await AsyncStorage.removeItem(key);
}