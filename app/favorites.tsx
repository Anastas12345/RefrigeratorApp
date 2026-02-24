import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, router, Stack } from "expo-router";

import ProductCard from "@/components/ProductCard";
import { getFavoriteProducts, setFavorite } from "@/src/api/productsApi";

const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF6FA";
const HEADER_BG = "#BFE9FF";
const TEXT_GRAY = "#7B8794";
const TEXT_DARK = "#1E2A32";

export default function FavoritesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favLoadingId, setFavLoadingId] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      const data = await getFavoriteProducts(); // бек повертає тільки улюблені
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFavorites();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  // тут сердечко = прибрати з улюблених
  const onToggleFavorite = async (productId: string) => {
    const id = String(productId);
    try {
      setFavLoadingId(id);
      await setFavorite(id, false);
      setItems((prev) => prev.filter((p) => String(p.id) !== id));
    } finally {
      setFavLoadingId(null);
    }
  };

  return (
    <View style={styles.safe}>
      {/* ✅ прибираємо стандартний хедер "favorites" */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Синє півколо */}
      <View style={styles.headerBlob} />

      {/* Кастомний хедер як у нотатках */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={TEXT_GRAY} />
        </Pressable>

        <Text style={styles.title}>Улюблені</Text>
        <Text style={styles.subtitle}>Твої продукти з ❤️</Text>
      </View>

      {/* Контент */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
          renderItem={({ item }) => (
            <ProductCard
              product={{ ...item, is_favorite: true }}
              onToggleFavorite={onToggleFavorite}
              isLoadingFavorite={favLoadingId === String(item.id)}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={26} color={ORANGE} />
              </View>
              <Text style={styles.emptyTitle}>Поки немає улюблених</Text>
              <Text style={styles.emptyText}>
                Натисни ❤️ на продукті — і він з’явиться тут
              </Text>

              <Pressable
                onPress={() => router.replace("/(tabs)")}
                style={({ pressed }) => [styles.goBtn, pressed && { opacity: 0.9 }]}
              >
                <Ionicons name="restaurant-outline" size={18} color="#fff" />
                <Text style={styles.goBtnText}>До продуктів</Text>
              </Pressable>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  headerBlob: {
    position: "absolute",
    top: -120,
    left: -120,
    right: -120,
    height: 280,
    backgroundColor: HEADER_BG,
    borderBottomLeftRadius: 260,
    borderBottomRightRadius: 260,
    opacity: 0.85,
  },

  header: {
    paddingTop: 46,
    paddingBottom: 12,
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    top: 46,
    left: 0,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_GRAY,
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  emptyWrap: {
    marginTop: 70,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_GRAY,
    textAlign: "center",
    marginBottom: 14,
  },

  goBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ORANGE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  goBtnText: { color: "#fff", fontWeight: "900" },
});