import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from "../constants/categories";
const API_URL = 'https://myfridgebackend.onrender.com/api/products';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Токен відсутній');

    const response = await fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Помилка завантаження');

    const data = await response.json();
    setProduct(data);

    // 🔥 ОТУТ читаємо категорію
    // 🔥 Читаємо з нового об'єкта productCategories
const stored = await AsyncStorage.getItem("productCategories");

if (stored) {
  const categoriesMap = JSON.parse(stored);

  const categoryId = categoriesMap[data.id];

  if (categoryId) {
    const categoryObj = CATEGORIES.find(
      (cat) => cat.id === categoryId
    );

    if (categoryObj) {
      setCategory(categoryObj);
    }
  }
}

    console.log("TRY LOAD CATEGORY FOR:", data.id);
    console.log("RAW CATEGORY VALUE:", savedCategory);

    if (savedCategory) {
      const parsedCategory = JSON.parse(savedCategory);
      setCategory(parsedCategory);
    }

  } catch (err) {
    console.log('DETAIL ERROR:', err);
  } finally {
    setLoading(false);
  }
};

  const deleteProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Токен відсутній');

      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Помилка', 'Не вдалося видалити продукт');
    }
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center' }}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text>Продукт не знайдено</Text>
      </View>
    );
  }

  const formattedDate = product.expiration_date
    ? new Date(product.expiration_date).toLocaleDateString('uk-UA')
    : '—';

  return (
    <View style={{ flex:1, backgroundColor:'#CFE8F1' }}>

      <View style={{
        backgroundColor:'#F6E2A7',
        height:120,
        borderBottomLeftRadius:100,
        borderBottomRightRadius:100,
        justifyContent:'center',
        alignItems:'center',
      }}>
        <Text style={{ fontSize:26, fontWeight:'700' }}>
          Інформація
        </Text>
      </View>

      <View style={{ padding:20 }}>

        <View style={{
          backgroundColor:'#D9EEF6',
          padding:15,
          borderRadius:20,
          marginBottom:20,
        }}>
          <Text>Назва продукту</Text>
          <Text style={{ fontSize:18, fontWeight:'600' }}>
            {product.name}
          </Text>

          <Text style={{ marginTop:15 }}>Місце зберігання</Text>
          <Text style={{ color:'#FF7A00', fontWeight:'600' }}>
            {product.storage_places?.name || '—'}
          </Text>
        </View>

        {category && (
          <View style={{
            backgroundColor:'#D9EEF6',
            padding:15,
            borderRadius:20,
            marginBottom:20,
            alignItems:'center',
          }}>
            <Text style={{ marginBottom:10 }}>Категорія</Text>

            <View style={{
              width:60,
              height:60,
              borderRadius:30,
              backgroundColor:category.color,
              justifyContent:'center',
              alignItems:'center',
              marginBottom:8,
            }}>
              <MaterialCommunityIcons
                name={category.icon}
                size={28}
                color="#fff"
              />
            </View>

            <Text>{category.name}</Text>
          </View>
        )}

        <Text>Кількість</Text>
        <Text style={{ marginBottom:20 }}>
          {product.quantity} {product.unit}
        </Text>

        <Text>Термін придатності</Text>
        <Text style={{ color:'#FF7A00', fontWeight:'600', marginBottom:30 }}>
          {formattedDate}
        </Text>

        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/edit-product',
                params: { id: product.id },
              })
            }
            style={{
              backgroundColor:'#F6E2A7',
              padding:12,
              borderRadius:10,
              width:'45%',
              alignItems:'center',
            }}
          >
            <Text>Редагувати</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Вам було смачно?',
                '',
                [
                  { text:'Ні', style:'cancel' },
                  { text:'Так', onPress:deleteProduct },
                ]
              )
            }
            style={{
              backgroundColor:'#F39C12',
              paddingVertical:12,
              paddingHorizontal:25,
              borderRadius:12,
            }}
          >
            <Text style={{ fontWeight:'600' }}>З’їв</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor:'#FF7A00',
            paddingVertical:16,
            borderRadius:40,
            alignItems:'center',
            marginTop:40,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color:'#fff', fontWeight:'600' }}>
            Назад
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}