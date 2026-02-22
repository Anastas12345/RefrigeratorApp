import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://myfridgebackend.onrender.com/api/products";

export const createProduct = async (productData: any) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Токен відсутній");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Помилка ${response.status}: ${text}`);
  }

  return await response.json();
};

export const createProductsBatch = async (products: any[]) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("Токен відсутній");

  const response = await fetch(
    "https://myfridgebackend.onrender.com/api/Products/batch",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(products),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Batch error: ${text}`);
  }

  return await response.json();
};