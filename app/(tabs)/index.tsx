import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import ProductCard from '../../components/ProductCard';
import { MOCK_PRODUCTS } from '../../data/mockProducts';

/*const API_URL = 'https://myfridgebackend.onrender.com/api/Products';*/

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('Всі');

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
  const filteredProducts =
    activeTab === 'Всі'
      ? products
      : products.filter(
          (item) =>
            item.storage_places?.name === activeTab
        );

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
    <View style={{ flex: 1, padding: 20, backgroundColor: '#EAF6FA' }}>
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

      {/* Пошук + фільтри (візуально) */}
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 15,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            marginRight: 10,
          }}
        >
          <Text style={{ color: '#999' }}>Пошук продукту…</Text>
        </View>

        <View
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#999' }}>Фільтри</Text>
        </View>
      </View>

      {/* Список продуктів */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} />
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
