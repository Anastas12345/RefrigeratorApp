import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
export default function AddProduct() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('одиниць');
  const [showUnits, setShowUnits] = useState(false);
  const [expiration, setExpiration] = useState('');
  const [comment, setComment] = useState('');
  const [storage, setStorage] = useState('Холодильник');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [storagePlaces, setStoragePlaces] = useState([]);

  const UNITS = ['pcs', 'kg', 'g', 'l', 'ml'];
  const UNIT_LABELS = {
  pcs: 'шт',
  kg: 'кг',
  g: 'г',
  l: 'л',
  ml: 'мл',
};

  useEffect(() => {
  const fetchStoragePlaces = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        "https://myfridgebackend.onrender.com/api/StoragePlace/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Не вдалося отримати місця зберігання");
      }

      const data = await response.json();
      setStoragePlaces(data);

    } catch (err) {
      console.log("STORAGE FETCH ERROR:", err);
    }
  };

  fetchStoragePlaces();
}, []);

  // Форматування дати ДД-ММ-РРРР
  const formatDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    } else if (cleaned.length > 4) {
      formatted =
        cleaned.slice(0, 2) +
        '-' +
        cleaned.slice(2, 4) +
        '-' +
        cleaned.slice(4, 8);
    }

    setExpiration(formatted);
  };

  const validate = () => {
    let newErrors = {};

    if (!name) newErrors.name = true;
    if (!quantity) newErrors.quantity = true;
    if (!expiration) newErrors.expiration = true;
    if (!selectedCategory) newErrors.category = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // ТІЛЬКИ ЗМІНЕНИЙ handleSubmit

const handleSubmit = async () => {
  if (!validate()) return;

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Токен відсутній");

    const selectedStorage = storagePlaces.find(
      (place) => place.name === storage
    );

    if (!selectedStorage) {
      throw new Error("Місце зберігання не знайдено");
    }

    const [day, month, year] = expiration.split("-");
    const isoDate = `${year}-${month}-${day}`;

    const productData = {
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      expiration_date: isoDate,
      storage_place_id: selectedStorage.id,
      comments: comment,
    };

    const response = await fetch(
      "https://myfridgebackend.onrender.com/api/products",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Помилка ${response.status}: ${text}`);
    }

    const createdProduct = await response.json();

    // 🔥 ОСЬ ГОЛОВНЕ — зберігаємо категорію локально
   // 🔥 Зберігаємо всі категорії в одному об'єкті

const stored = await AsyncStorage.getItem("productCategories");
let categoriesMap = stored ? JSON.parse(stored) : {};

// зберігаємо ТІЛЬКИ id категорії
categoriesMap[createdProduct.id] = selectedCategory.id;

await AsyncStorage.setItem(
  "productCategories",
  JSON.stringify(categoriesMap)
);

console.log(
  "SAVED CATEGORY:",
  createdProduct.id,
  selectedCategory.id
);
    router.back();

  } catch (error) {
    console.log("POST ERROR:", error);
  }
};


  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} >
  <Pressable style={{ flex: 1 }} onPress={() => setShowUnits(false)}>
    <Stack.Screen options={{ headerShown: false }} />

    <ScrollView style={{ flex: 1, backgroundColor: "#EAF6FA" }}>
      
      {/* Верхня дуга (текст опущено вниз) */}
      <View
        style={{
          backgroundColor: "#EAF6FA",
          height: 130,
          borderBottomLeftRadius: 110,
          borderBottomRightRadius: 110,
          alignItems: "center",
          paddingTop: 70, // ✅ ОПУСТИЛИ ТЕКСТ (змінюй 45–60)
        }}
      >
        
        <Text style={{ fontSize: 30, fontWeight: "800", color: "#0F172A" }}>
          Додати продукт
        </Text>

        
      </View>

      <View style={{ padding: 20 }}>
        {/* Назва */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Назва продукту</Text>

          <TextInput
            placeholder="Наприклад: Молоко"
            placeholderTextColor="#9AA3AF"
            value={name}
            onChangeText={setName}
            style={[inputStyle, errors.name && errorBorder]}
          />

          {errors.name && (
            <Text style={errorText}>Ви повинні ввести назву продукту</Text>
          )}
        </View>

        {/* Кількість + dropdown */}
<View style={[sectionStyle, { zIndex: 50, elevation: 50 }]}>
  <Text style={labelStyle}>Кількість</Text>

  {/* ROW тільки для інпута + кнопки */}
  <View style={{ flexDirection: "row" }}>
    <TextInput
      placeholder="0"
      placeholderTextColor="#9AA3AF"
      value={quantity}
      onChangeText={setQuantity}
      keyboardType="numeric"
      style={[
        inputStyle,
        { flex: 1, marginRight: 10 },
        errors.quantity && errorBorder,
      ]}
    />

    <View style={{ width: 120, position: "relative" }}>
      <TouchableOpacity
        onPress={() => setShowUnits(!showUnits)}
        activeOpacity={0.85}
        style={[inputStyle, { justifyContent: "center" }]}
      >
        <Text style={{ color: "#0F172A", fontWeight: "600" }}>
          {UNIT_LABELS[unit] || unit}
        </Text>
      </TouchableOpacity>

      {showUnits && (
        <View
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: 120,
            maxHeight: 240,
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            zIndex: 9999,
            elevation: 20,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 10 },
            overflow: "hidden",
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {UNITS.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setUnit(item);
                  setShowUnits(false);
                }}
                activeOpacity={0.8}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F1F5F9",
                }}
              >
                <Text style={{ color: "#0F172A", fontWeight: "600", fontSize: 15 }}>
                  {UNIT_LABELS[item]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  </View>

  {/* ✅ ПОМИЛКА ПІСЛЯ ROW */}
  {errors.quantity && (
    <Text style={errorText}>Ви повинні вказати кількість</Text>
  )}
</View>

        {/* Місце зберігання */}<View style={sectionStyle}>
          <Text style={labelStyle}>Місце зберігання</Text>

          <TouchableOpacity
            onPress={() =>
              setStorage(
                storage === "Холодильник"
                  ? "Морозилка"
                  : storage === "Морозилка"
                  ? "Комора"
                  : "Холодильник"
              )
            }
            activeOpacity={0.85}
          >
            <View
              style={{
                backgroundColor: "rgba(255,122,0,0.14)",
                borderWidth: 1,
                borderColor: "rgba(255,122,0,0.28)",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 18,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#FF7A00", fontWeight: "800" }}>
                {storage}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Категорії */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Категорії</Text>

          {errors.category && (
            <Text style={errorText}>Ви повинні обрати категорію</Text>
          )}

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            {CATEGORIES.map((cat) => {
              const selected = selectedCategory?.id === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.85}
                  style={{
                    width: "25%",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: cat.color,
                      justifyContent: "center",
                      alignItems: "center",

                      borderWidth: selected ? 3 : 1,
                      borderColor: selected
                        ? "#FF7A00"
                        : "rgba(0,0,0,0.05)",

                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 6 },
                      elevation: 2,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon}
                      size={26}
                      color="#fff"
                    />
                  </View>

                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      textAlign: "center",
                      color: "#0F172A",
                      opacity: selected ? 1 : 0.75,
                      fontWeight: selected ? "800" : "600",
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Дата */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Термін придатності</Text>

          <TextInput
            placeholder="ДД-ММ-РРРР"
            placeholderTextColor="#9AA3AF"
            value={expiration}
            onChangeText={formatDate}
            keyboardType="numeric"
            maxLength={10}
            style={[inputStyle, errors.expiration && errorBorder]}
          />

          {errors.expiration && (
            <Text style={errorText}>Ви повинні вказати термін придатності</Text>
          )}
        </View>

        {/* Коментар */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Коментар</Text>

          <TextInput
            placeholder="Додайте декілька слів"
            placeholderTextColor="#9AA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            style={[inputStyle, { height: 90, paddingTop: 12 }]}
          />
        </View>

        {/* Кнопка */}
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#FF7A00",
            paddingVertical: 16,
            borderRadius: 22,
            alignItems: "center",
            marginBottom: 40,

            shadowColor: "#000",
            shadowOpacity: 0.10,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 10 },
            elevation: 5,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "800",
              letterSpacing: 0.2,
            }}
          >
            Додати
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </Pressable>
  </KeyboardAvoidingView>
);
}
/* ===== СТИЛІ ===== */

const sectionStyle = {
  backgroundColor: "rgba(255,255,255,0.92)",
  padding: 16,
  borderRadius: 22,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.04)",
  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2,
};

const labelStyle = {
  marginBottom: 10,
  fontSize: 14,
  fontWeight: "700",
  color: "#0F172A",
};

const inputStyle = {
  height: 46,
  backgroundColor: "rgba(234,246,250,0.85)",
  paddingHorizontal: 14,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.04)",
  fontSize: 16,
  color: "#0F172A",
};

const errorBorder = {
  borderColor: "#FF3B30",
};

const errorText = {
  color: "#FF3B30",
  marginTop: 8,
  fontSize: 12,
  fontWeight: "600",
}; 

