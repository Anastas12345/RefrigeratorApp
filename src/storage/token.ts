import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "access_token";

// зберегти токен
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

// отримати токен
export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

// видалити токен (logout)
export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}