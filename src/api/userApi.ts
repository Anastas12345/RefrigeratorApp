import { getToken } from "@/src/storage/token";

const BASE = "https://myfridgebackend.onrender.com";

async function authHeaders() {
  const token = await getToken();
  if (!token) throw new Error("Немає токена");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function patchProfile(payload: { name: string }) {
  const headers = await authHeaders();

  const res = await fetch(`${BASE}/api/users/profile`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json();
}

export async function deleteProfile() {
  const headers = await authHeaders();

  const res = await fetch(`${BASE}/api/users/profile`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
}