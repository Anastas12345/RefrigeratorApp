import { API_BASE } from "@/src/config";
import { saveToken } from "@/src/storage/token";

type AuthResponse = {
  access_token?: string;
  token?: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || "Request failed"}`);
  }

  return (await res.json()) as T;
}

export async function login(email: string, password: string) {
  const data = await postJson<AuthResponse>(
    `${API_BASE}/auth/login`,
    { email, password }
  );

  const token = data.access_token ?? data.token;
  if (!token) {
    throw new Error("Бекенд не повернув токен (access_token).");
  }

  await saveToken(token);
  return token;
}

export async function register(email: string, password: string) {
  const data = await postJson<AuthResponse>(
    `${API_BASE}/auth/register`,
    { email, password }
  );

  const token = data.access_token ?? data.token;

  if (token) {
    await saveToken(token);
  }

  return token;
}