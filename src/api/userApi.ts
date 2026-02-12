import { getToken } from "../storage/token";

const BASE_URL = "https://myfridgebackend.onrender.com/api/users";

async function parseResponse(response: Response, label: string) {
  const text = await response.text(); // читаємо як текст, щоб не падати на пустому body

  if (!response.ok) {
    throw new Error(`${label}: ${response.status} ${text}`);
  }

  // якщо бек повернув пусто (часто так буває на DELETE / POST)
  if (!text) return null;

  // якщо це JSON — парсимо, якщо ні — повернемо як текст
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getMe() {
  const token = await getToken();
  if (!token) throw new Error("Немає токена");

  const response = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // ✅ бектики
    },
  });

  return parseResponse(response, "GET /me");
}

export async function createProfile(email: string) {
  const token = await getToken();
  if (!token) throw new Error("Немає токена");

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ бектики
    },
    body: JSON.stringify({ email }),
  });

  return parseResponse(response, "POST /profile");
}

export async function deleteProfile() {
  const token = await getToken();
  if (!token) throw new Error("Немає токена");

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`, // ✅ бектики
    },
  });

  return parseResponse(response, "DELETE /profile");
}