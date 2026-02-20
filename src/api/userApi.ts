const BASE = "https://myfridgebackend.onrender.com";

async function authHeaders() {
  // Підстав свою функцію отримання токена
  // (у тебе вже є getToken / removeToken)
  const { getToken } = await import("@/src/storage/token");
  const token = await getToken();

  if (!token) throw new Error("Немає токена. Увійдіть знову.");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export type MeDto = {
  id?: string;
  email?: string;
  name?: string;
  // додай інші поля, якщо бекенд повертає
};

export type UpdateProfileDto = {
  name?: string;
  // додай, що дозволено оновлювати (наприклад phone, avatarUrl тощо)
};

export async function getMe(): Promise<MeDto> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/users/me`, { method: "GET", headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Не вдалося завантажити профіль");
  }

  return await res.json();
}

export async function patchProfile(payload: UpdateProfileDto): Promise<MeDto> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/users/profile`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Не вдалося оновити профіль");
  }

  return await res.json();
}

export async function deleteProfile(): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/users/profile`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Не вдалося видалити профіль");
  }
}