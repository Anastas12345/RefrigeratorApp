import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import ProductCard from '../../components/ProductCard';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { Pressable, Image } from "react-native";
import { SideMenu } from "@/components/SideMenu";
import { SafeAreaView } from "react-native-safe-area-context";
import { removeToken } from "@/src/storage/token";

/*const API_URL = 'https://myfridgebackend.onrender.com/api/Products';*/

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] =
    useState<null | 'favorites' | 'dateAsc' | 'dateDesc'>(null);

  const [activeTab, setActiveTab] = useState('Всі');
const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    loadMockProducts();
  }, []);

  const loadMockProducts = () => {
    setProducts(MOCK_PRODUCTS);
    setLoading(false);
  };

  /*useEffect(() => { НОРМ
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Помилка завантаження');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };*/

  // 🔥 ФІЛЬТРАЦІЯ ПО МІСЦЮ ЗБЕРІГАННЯ
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
        new Date(a.expiration_date.split('-').reverse().join('-')).getTime() -
        new Date(b.expiration_date.split('-').reverse().join('-')).getTime()
    );
  }

  // 📅 НАЙПІЗНІШІ
  if (filterType === 'dateDesc') {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        new Date(b.expiration_date.split('-').reverse().join('-')).getTime() -
        new Date(a.expiration_date.split('-').reverse().join('-')).getTime()
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
  
  return (
    
    <View
    style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 70, backgroundColor: '#EAF6FA' }}>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSearchText(''); // 🔥 очищаємо пошук
              router.push({
                pathname: '/product-details',
                params: { id: item.id },
              });
            }}
          >
            <ProductCard product={item} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

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
        onPress={() => router.push('/add-product')}
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
    </View>
  );
}
