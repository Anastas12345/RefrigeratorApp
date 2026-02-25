import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import ProductCard from "../components/ProductCard";

import { Stack } from "expo-router";
const API_URL =
  "https://myfridgebackend.onrender.com/api/products?expirationCategory=soon";

export default function ExpiringProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiring();
  }, []);

  const fetchExpiring = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setProducts(data);
    } catch (e) {
      console.log("EXPIRING ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#EAF6FA" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 15,
          textAlign: "center",
        }}
      >
        ⏳ Скоро зіпсуються
      </Text>

      {products.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 30 }}>
          Немає продуктів з терміном до 3 днів 🎉
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(`/product-details?id=${item.id}`)
              }
            >
              <ProductCard product={item} onToggleFavorite={undefined} isLoadingFavorite={undefined} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}