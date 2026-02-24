import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
  Pressable,
} from "react-native";

import { useFocusEffect } from "expo-router";
import ProductCard from "../../components/ProductCard";
import { SideMenu } from "../../components/SideMenu";

import { removeToken } from "@/src/storage/token";
import { getProducts, getFavoriteProducts, setFavorite } from "@/src/api/productsApi";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());
  const [favLoadingId, setFavLoadingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<null | "favorites" | "dateAsc" | "dateDesc">(null);

  const [activeTab, setActiveTab] = useState("Всі");
  const [menuOpen, setMenuOpen] = useState(false);


  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [storageMap, setStorageMap] = useState({});
  const [expiringCount, setExpiringCount] = useState(0);
   const [showAiHint, setShowAiHint] = useState(false)

  const fetchAll = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await getProducts();

    setProducts(data);

    const fav = await getFavoriteProducts();
    const ids = new Set<string>((fav || []).map((p: any) => String(p.id)));
    setFavoritesIds(ids);

    console.log("PRODUCTS RESPONSE:", data);
    console.log("FAVORITES RESPONSE:", fav);
  } catch (err: any) {
    console.log("FETCH ERROR:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // ✅ підмішуємо is_favorite в кожен продукт
  const productsWithFav = useMemo(() => {
    return (products || []).map((p: any) => ({
      ...p,
      is_favorite: favoritesIds.has(String(p.id)),
    }));
  }, [products, favoritesIds]);

  // 🔥 ФІЛЬТРАЦІЯ ПО МІСЦЮ ЗБЕРІГАННЯ
  let filteredProducts =
    activeTab === "Всі"
      ? [...productsWithFav]
      : productsWithFav.filter((item: any) => item.storage_places?.name === activeTab);

  // 🔎 ПОШУК
  if (searchText.trim() !== "") {
    filteredProducts = filteredProducts.filter((item: any) =>
      String(item.name || "").toLowerCase().includes(searchText.toLowerCase())
    );
  }

      const data = await response.json();
      setProducts(data);
console.log("BACKEND PRODUCTS:", data);
    } catch (err: any) {
      console.log('FETCH ERROR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ФІЛЬТРАЦІЯ ПО МІСЦЮ ЗБЕРІГАННЯ (DTO)
let filteredProducts =
  activeTab === 'Всі'
    ? [...products]
    : products.filter(
        (item) =>
          item.storage_places?.name === activeTab
      );

  // 📅 НАЙБЛИЖЧІ
  if (filterType === "dateAsc") {
    filteredProducts = [...filteredProducts].sort(
      (a: any, b: any) =>
        new Date(a.expiration_date || 0).getTime() - new Date(b.expiration_date || 0).getTime()
    );
  }

  // 📅 НАЙПІЗНІШІ
  if (filterType === "dateDesc") {
    filteredProducts = [...filteredProducts].sort(
      (a: any, b: any) =>
        new Date(b.expiration_date || 0).getTime() - new Date(a.expiration_date || 0).getTime()
    );
  }
  // ✅ бек: toggle
  const onToggleFavorite = async (productId: any) => {
    const id = String(productId);
    const isFavNow = favoritesIds.has(id);

    // оптимістично в UI
    setFavoritesIds((prev) => {
      const next = new Set(prev);
      if (isFavNow) next.delete(id);
      else next.add(id);
      return next;
    });

    setFavLoadingId(id);

    try {
      await setFavorite(id, !isFavNow);

      Alert.alert(
        "Готово",
        isFavNow ? "Прибрано з улюблених 💔" : "Додано в улюблені ❤️"
      );
    } catch (e: any) {
      // rollback
      setFavoritesIds((prev) => {
        const next = new Set(prev);
        if (isFavNow) next.delete(id);
        else next.add(id);
        return next;
      });

      Alert.alert("Помилка", e?.message ?? "Не вдалося змінити улюблене");
    } finally {
      setFavLoadingId(null);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  if (error) {
    return (<View style={{ padding: 20 }}>
        <Text>Помилка: {error}</Text>
      </View>
    );
  }
console.log("SHOW AI HINT:", showAiHint);
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 70,
        backgroundColor: "#EAF6FA",
      }}
    >
      {/* Заголовок */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Продукти
      </Text>

      <Pressable
        onPress={() => setMenuOpen(true)}
        style={{ position: "absolute", top: 70, left: 12, zIndex: 999 }}
        hitSlop={12}
      >
        <Image
          source={require("@/assets/images/fridge-menu.png")}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      </Pressable>

      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGoProducts={() => {
          setMenuOpen(false);
          router.replace("/(tabs)");
        }}
        onGoAddProduct={() => {
          setMenuOpen(false);
          router.push("/add-product");
        }}
        onGoFavorites={() => {
          setMenuOpen(false);
          router.push("/favorites");
        }}
        onGoNotes={() => {
          setMenuOpen(false);
          router.push("/notes");
        }}
        onGoProfile={() => {
          setMenuOpen(false);
          router.push("/profile");
        }}
        onLogout={async () => {
          await removeToken();
          router.replace("/login");
        }}
      />

      {/* Таби */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 15 }}>
        {["Всі", "Холодильник", "Морозилка", "Комора"].map((item) => (
          <TouchableOpacity key={item} onPress={() => setActiveTab(item)}>
            <Text
              style={{
                fontSize: 14,
                color: activeTab === item ? "#FF7A00" : "#999",
                fontWeight: activeTab === item ? "600" : "400",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Пошук + фільтри */}
      <View style={{ flexDirection: "row", marginBottom: 15 }}>
        <TextInput
          placeholder="Пошук продукту…"
          value={searchText}
          onChangeText={setSearchText}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 10,
            marginRight: 10,
          }}
        />

        <TouchableOpacity
          onPress={() => {
            if (filterType === null) setFilterType("favorites");
            else if (filterType === "favorites") setFilterType("dateAsc");
            else if (filterType === "dateAsc") setFilterType("dateDesc");
            else setFilterType(null);
          }}
          style={{
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 10,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#999" }}>
            {filterType === null && "Фільтри"}
            {filterType === "favorites" && "❤️ Улюблені"}
            {filterType === "dateAsc" && "Найближчі"}
            {filterType === "dateDesc" && "Найпізніші"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Список */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSearchText("");
              router.push(`/product-details?id=${item.id}`);
            }}
          >
            <ProductCard
  product={{ ...item, isFavorite: favoritesIds.has(String(item.id)) }}
  onToggleFavorite={onToggleFavorite}
  isLoadingFavorite={favLoadingId === String(item.id)}
/>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}/>

      {/* Кнопка + */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 25,
          right: 25,
          backgroundColor: "#FF7A00",
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
        }}
        onPress={() => router.push("/add-product")}
      >
        <Text style={{ color: "#fff", fontSize: 32, fontWeight: "600", lineHeight: 36 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}