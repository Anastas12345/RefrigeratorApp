import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
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
  <View style={{ flex: 1, backgroundColor: "#EAF6FA" }}>
    <Stack.Screen options={{ headerShown: false }} />

    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      ListHeaderComponent={
        <View style={{ paddingTop: 70, paddingBottom: 18 }}>
          {/* Заголовок */}
          <Text
            style={{
              fontSize: 34,
              fontWeight: "900",
              color: "#0F172A",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Скоро зіпсуються
          </Text>

          {/* Підзаголовок */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#64748B",
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            Продукти з терміном до 3 днів
          </Text>

          {/* Інфо-блок */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 22,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(15, 23, 42, 0.06)",
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 8 },
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>
                Потрібно перевірити
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#64748B", marginTop: 4 }}>
                {products.length === 0
                  ? "Немає продуктів з терміном до 3 днів 🎉"
                  : "Ці продукти бажано використати першими"}
              </Text>
            </View>

            {/* Кружечок-лічильник */}
            <View
              style={{
                minWidth: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255, 122, 0, 0.14)",
                borderWidth: 1,
                borderColor: "rgba(255, 122, 0, 0.28)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FF7A00", fontWeight: "900", fontSize: 16 }}>
                {products.length}
              </Text>
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 30, color: "#64748B", fontWeight: "700" }}>
          Немає продуктів з терміном до 3 днів 🎉
        </Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => router.push(`/product-details?id=${item.id}`)}>
          <ProductCard product={item} onToggleFavorite={undefined} isLoadingFavorite={undefined} />
        </TouchableOpacity>
      )}
    />
  </View>
);
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EAF6FA",
    paddingHorizontal: 20,
  },

  // 🔽 опускає верхній текст вниз (під статусбар)
  header: {
    paddingTop: 70,
    paddingBottom: 14,
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.2,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  listContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },

  cardWrap: {
    marginBottom: 14,
  },

  emptyBox: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
});