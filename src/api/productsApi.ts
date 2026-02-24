import { API_BASE } from "@/src/config";
import { getToken } from "@/src/storage/token";

async function requestWithAuth(url: string, method: string, body?: any) {
  const token = await getToken();
  if (!token) throw new Error("Немає токена. Залогінься ще раз.");

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // інколи бек повертає пусто
  return true;
}

// ✅ ВСІ продукти
export async function getProducts() {
  const token = await getToken();
  if (!token) throw new Error("Немає токена. Залогінься ще раз.");

  const res = await fetch(`${API_BASE}/Products`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

// ✅ ТІЛЬКИ улюблені (бек фільтрує)
export async function getFavoriteProducts() {
  const token = await getToken();
  if (!token) throw new Error("Немає токена. Залогінься ще раз.");

  const res = await fetch(`${API_BASE}/Products?IsFavorite=true`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * ✅ ГОЛОВНЕ ВИПРАВЛЕННЯ:
 * бек очікує boolean у body: true/false (Path: $)
 */
export async function setFavorite(productId: string, value: boolean) {
  if (!productId) throw new Error("Некоректний productId");

  const url = `${API_BASE}/Products/${productId}/favorite`;

  // 1) PATCH + boolean body
  try {
    await requestWithAuth(url, "PATCH", value);
    return true;
  } catch (e: any) {
    const msg = String(e?.message ?? "");

    // якщо метод не підтримується
    if (msg.includes("405")) {
      // 2) POST + boolean body
      try {
        await requestWithAuth(url, "POST", value);
        return true;
      } catch (e2: any) {
        const msg2 = String(e2?.message ?? "");
        if (msg2.includes("405")) {
          // 3) PUT + boolean body
          await requestWithAuth(url, "PUT", value);
          return true;
        }
        throw e2;
      }
    }

    // якщо бек каже "body required" або boolean conversion — ми і так шлемо boolean
    throw e;
  }
}