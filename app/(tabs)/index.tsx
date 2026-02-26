import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { removeToken } from "@/src/storage/token";
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Image, Pressable } from "react-native";
import ProductCard from '../../components/ProductCard';
import { SideMenu } from "../../components/SideMenu";

import { getProducts, getFavoriteProducts, setFavorite } from "@/src/api/productsApi";



import { Ionicons } from "@expo/vector-icons";
import AddOptionsModal from '../../components/AddOptionsModal';

import { checkDailyExpiringProducts } from '../../notification/dailyExpirationCheck';


const API_URL = 'https://myfridgebackend.onrender.com/api/products';

export default function Products() {
  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());
  const [favLoadingId, setFavLoadingId] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] =
    useState<null | 'favorites' | 'dateAsc' | 'dateDesc'>(null);

  const [activeTab, setActiveTab] = useState('Всі');
  const [menuOpen, setMenuOpen] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [storageMap, setStorageMap] = useState({});
  const [expiringCount, setExpiringCount] = useState(0);
   const [showAiHint, setShowAiHint] = useState(false)

   useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

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

const productsWithFav = useMemo(() => {
    return (products || []).map((p: any) => ({
      ...p,
      is_favorite: favoritesIds.has(String(p.id)),
    }));
  }, [products, favoritesIds]);
  const fetchExpiringCount = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const response = await fetch(
      "https://myfridgebackend.onrender.com/api/products?expirationCategory=soon",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await response.json();
    setExpiringCount(data.length);
  } catch (e) {
    console.log("COUNT ERROR:", e);
  }
};
 useFocusEffect(
  useCallback(() => {

    fetchProducts();
    fetchExpiringCount();

    const runCheck = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await checkDailyExpiringProducts(token);
      }
    };

    const checkHint = async () => {
      const seen = await AsyncStorage.getItem("aiHintSeen");
      console.log("AI HINT SEEN:", seen); // додай це для перевірки
      if (!seen) {
        setShowAiHint(true);
      }
    };

    runCheck();
    checkHint();

  }, [])
);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('Токен відсутній');
      }

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Помилка ${response.status}`);
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

  // 🔎 ПОШУК
  if (searchText.trim() !== '') {
    filteredProducts = filteredProducts.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  // ❤️ УЛЮБЛЕНІ
  if (filterType === "favorites") {
  filteredProducts = filteredProducts.filter((item) =>
    favoritesIds.has(String(item.id))
  );
}

  // 📅 НАЙБЛИЖЧІ
  if (filterType === 'dateAsc') {
  filteredProducts = [...filteredProducts].sort(
    (a, b) =>
      new Date(a.expiration_date || 0).getTime() -
      new Date(b.expiration_date || 0).getTime()
  );
}// 📅 НАЙПІЗНІШІ
  if (filterType === 'dateDesc') {
  filteredProducts = [...filteredProducts].sort(
    (a, b) =>
      new Date(b.expiration_date || 0).getTime() -
      new Date(a.expiration_date || 0).getTime()
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
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 20 }}>
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
        backgroundColor: '#EAF7FF'
      }}
    >
      {/* Заголовок */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          marginBottom: 7,
          textAlign: 'center',
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

{/* 🔔 Дзвіночок */}
<TouchableOpacity
  onPress={() => router.push("/expiring-products")}
  style={{
    position: "absolute",
    top: 70,
    right: 20,
    zIndex: 999,
  }}
>
  <Ionicons name="notifications-outline" size={28} color="#333" />

  {expiringCount > 0 && (
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -6,
        backgroundColor: "#FF3B30",
        borderRadius: 10,
        paddingHorizontal: 6,
        minWidth: 18,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
        {expiringCount}
      </Text>
    </View>
  )}
</TouchableOpacity>
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 15,
        }}
      >
        {['Всі', 'Холодильник', 'Морозилка', 'Комора'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setActiveTab(item)}
          activeOpacity={0.8}
  style={{
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 18,
    backgroundColor:
      activeTab === item
        ? 'rgba(255,122,0,0.12)'
        : 'transparent',
  }}
>
            <Text
    style={{
      fontSize: 14,
      color: activeTab === item ? '#FF7A00' : '#8E8E93',
      fontWeight: activeTab === item ? '700' : '500',
    }}
  >
    {item}
  </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Пошук + фільтри (modern) */}
<View
  style={{
    marginHorizontal: 1,
    marginBottom: 14,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  }}
>
  <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
    <TextInput
      placeholder="Пошук продукту…"
      placeholderTextColor="#9AA3AF"
      value={searchText}
      onChangeText={setSearchText}
      style={{
        flex: 1,
        height: 44,
        borderRadius: 16,
        backgroundColor: "rgba(234,246,250,0.9)",
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#111827",
      }}
    />

    <TouchableOpacity
      onPress={() => {
        if (filterType === null) setFilterType("favorites");
        else if (filterType === "favorites") setFilterType("dateAsc");
        else if (filterType === "dateAsc") setFilterType("dateDesc");
        else setFilterType(null);
      }}
      activeOpacity={0.85}
      style={{
        height: 44,
        paddingHorizontal: 15,
        borderRadius: 16,
        justifyContent: "center",
        backgroundColor: "rgba(255,122,0,0.14)",
        borderWidth: 1,
        borderColor: "rgba(255,122,0,0.22)",
      }}
    >
      <Text style={{ color: "#FF7A00", fontWeight: "800" }}>
        {filterType === null && "Фільтри"}
        {filterType === "favorites" && "❤️ Улюблені"}
        {filterType === "dateAsc" && "Найближчі"}
        {filterType === "dateDesc" && "Найпізніші"}
      </Text>
    </TouchableOpacity>
  </View>
</View>



      {/* Список продуктів */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) =>
  item?.id ? item.id.toString() : index.toString()
}
        renderItem={({ item }) => (
          <Pressable
  onPress={() => {
    setSearchText('');
    router.push(`/product-details?id=${item.id}`);
  }}
  style={({ pressed }) => [
    {
      transform: [{ scale: pressed ? 0.99 : 1 }],
      opacity: pressed ? 0.95 : 1,
    },
  ]}
>
  <ProductCard
  product={{ ...item, isFavorite: favoritesIds.has(String(item.id)) }}
  onToggleFavorite={onToggleFavorite}
  isLoadingFavorite={favLoadingId === String(item.id)}
/>


</Pressable>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {/* 🔥 Tooltip AI (ОДИН раз, поза FlatList) */}
      {showAiHint && (
  <Pressable
    onPress={async () => {
      await AsyncStorage.setItem("aiHintSeen", "true");
      setShowAiHint(false);
    }}
    style={{
      position: "absolute",
      bottom: 170,
      right: 20,
      alignItems: "flex-end",
      zIndex: 9999,
    }}
  >
    {/* Bubble */}
    <View
      style={{
        backgroundColor: "#a8cff0",
        padding: 14,
        borderRadius: 16,
        width: 230,
        elevation: 8,
      }}
    >
      <Text style={{ fontWeight: "700", marginBottom: 6 }}>
        🤖 AI Помічник
      </Text>
      <Text style={{ fontSize: 13, color: "#555" }}>
        Допоможе придумати, що приготувати
        з продуктів, які вже є у тебе.
      </Text>
    </View>

    {/* Хвостик */}
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 14,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#a8cff0",
        marginTop: -2,
        marginRight: 25, // підганяємо до кнопки
      }}
    />
  </Pressable>
)}
      
{/* AI кнопка */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 100,
          right: 25,
          backgroundColor: '#4A90E2',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 6,
        }}
        onPress={() => router.push('/ai-helper')}
      >
        <Ionicons name="restaurant-outline" size={26} color="#fff" />
      </TouchableOpacity>
      {/* Кнопка + */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 25,
          right: 25,
          backgroundColor: '#FF7A00',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        }}
        onPress={() => setShowAddModal(true)}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 32,
            fontWeight: '600',
            lineHeight: 36,
          }}
        >
          +
        </Text>
      </TouchableOpacity>
      <AddOptionsModal
  visible={showAddModal}
  onClose={() => setShowAddModal(false)}
/>
    </View>
  );
}