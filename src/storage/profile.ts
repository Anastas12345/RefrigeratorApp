import AsyncStorage from "@react-native-async-storage/async-storage";

const EMAIL_KEY = "profile_email";
const NAME_KEY = "profile_name";

export async function saveProfileEmail(email: string) {
  await AsyncStorage.setItem(EMAIL_KEY, email.trim());
}

export async function getProfileEmail() {
  return await AsyncStorage.getItem(EMAIL_KEY);
}

export async function clearProfileEmail() {
  await AsyncStorage.removeItem(EMAIL_KEY);
}

export async function saveProfileName(name: string) {
  await AsyncStorage.setItem(NAME_KEY, name.trim());
}

export async function getProfileName() {
  return await AsyncStorage.getItem(NAME_KEY);
}

export async function clearProfileName() {
  await AsyncStorage.removeItem(NAME_KEY);
}