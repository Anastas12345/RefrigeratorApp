import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';

import {
  ActivityIndicator,
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




import { Ionicons } from "@expo/vector-icons";
import AddOptionsModal from '../../components/AddOptionsModal';

import { checkDailyExpiringProducts } from '../../notification/dailyExpirationCheck';


const API_URL = 'https://myfridgebackend.onrender.com/api/products';

export default function Products() {
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
  if (filterType === 'favorites') {
    filteredProducts = filteredProducts.filter(
      (item) => item.isFavorite === true
    );
  }

  // 📅 НАЙБЛИЖЧІ
  if (filterType === 'dateAsc') {
  filteredProducts = [...filteredProducts].sort(
    (a, b) =>
      new Date(a.expiration_date || 0).getTime() -
      new Date(b.expiration_date || 0).getTime()
  );
}

  // 📅 НАЙПІЗНІШІ
  if (filterType === 'dateDesc') {
  filteredProducts = [...filteredProducts].sort(
    (a, b) =>
      new Date(b.expiration_date || 0).getTime() -
      new Date(a.expiration_date || 0).getTime()
  );
}

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
        backgroundColor: '#EAF6FA'
      }}
    >
      {/* Заголовок */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: '700',
          marginBottom: 10,
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
          >
            <Text
              style={{
                fontSize: 14,
                color: activeTab === item ? '#FF7A00' : '#999',
                fontWeight: activeTab === item ? '600' : '400',
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Пошук + фільтри */}
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 15,
        }}
      >
        <TextInput
          placeholder="Пошук продукту…"
          value={searchText}
          onChangeText={setSearchText}
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            marginRight: 10,
          }}
        />

        <TouchableOpacity
          onPress={() => {
            if (filterType === null) setFilterType('favorites');
            else if (filterType === 'favorites') setFilterType('dateAsc');
            else if (filterType === 'dateAsc') setFilterType('dateDesc');
            else setFilterType(null);
          }}
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#999' }}>
            {filterType === null && 'Фільтри'}
            {filterType === 'favorites' && '❤️ Улюблені'}
            {filterType === 'dateAsc' && 'Найближчі'}
            {filterType === 'dateDesc' && 'Найпізніші'}
          </Text>
        </TouchableOpacity>
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
  <ProductCard product={item} />
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