// src/storage/profile.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalProfile = {
  name: string;
  email: string;
};

const KEY = "local_profile_v1";

export async function saveProfile(profile: LocalProfile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<LocalProfile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as LocalProfile) : null;
}

export async function clearProfile() {
  await AsyncStorage.removeItem(KEY);
}