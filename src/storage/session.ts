import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "is_logged_in";

export async function setLoggedIn(value: boolean) {
  await AsyncStorage.setItem(KEY, value ? "1" : "0");
}

export async function getLoggedIn() {
  return (await AsyncStorage.getItem(KEY)) === "1";
}

export async function clearSession() {
  await AsyncStorage.multiRemove([KEY, "access_token"]);
}