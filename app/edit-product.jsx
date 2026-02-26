import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
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
import { Stack } from "expo-router";

const API_URL = 'https://myfridgebackend.onrender.com/api/products';
const STORAGE_API =
  'https://myfridgebackend.onrender.com/api/StoragePlace/all';

export default function EditProduct() {
  const { id } = useLocalSearchParams();

  const [storagePlaces, setStoragePlaces] = useState([]);
  const [storageId, setStorageId] = useState(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [showUnits, setShowUnits] = useState(false);
  const [expiration, setExpiration] = useState('');
  const [comment, setComment] = useState('');
  const [storage, setStorage] = useState('Холодильник');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errors, setErrors] = useState({});

  const UNITS = ['pcs', 'kg', 'g', 'l', 'ml'];
  const UNIT_LABELS = {
  pcs: 'шт',
  kg: 'кг',
  g: 'г',
  l: 'л',
  ml: 'мл',
};

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

    // 1️⃣ Завантажуємо storage
    const storageRes = await fetch(STORAGE_API, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!storageRes.ok) {
      console.log("STORAGE LOAD ERROR:", await storageRes.text());
      return;
    }

    const storageData = await storageRes.json();
    setStoragePlaces(storageData);

    // 2️⃣ Завантажуємо продукт
    const productRes = await fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!productRes.ok) {
      console.log("PRODUCT LOAD ERROR:", await productRes.text());
      return;
    }

    const data = await productRes.json();

    setName(data.name || '');
    setQuantity(data.quantity ? String(data.quantity) : '');
    setUnit(data.unit || 'pcs');
    setComment(data.comments || '');

    // 📅 Дата
    if (data.expiration_date) {
      const d = new Date(data.expiration_date);
      const formatted = `${String(d.getDate()).padStart(2, '0')}-${String(
        d.getMonth() + 1
      ).padStart(2, '0')}-${d.getFullYear()}`;
      setExpiration(formatted);
    }

    // 🧊 STORAGE — ІГНОРУЄМО Guid.Empty
    const backendStorageId = data.storage_places?.id;

    if (
      backendStorageId &&
      backendStorageId !== EMPTY_GUID
    ) {
      setStorageId(backendStorageId);
      setStorage(data.storage_places.name);
    } else if (storageData.length > 0) {
      // якщо бек повернув null або Guid.Empty
      const defaultStorage = storageData[0];
      setStorageId(defaultStorage.id);
      setStorage(defaultStorage.name);
    } else {
      console.log("NO STORAGE AVAILABLE");
      setStorageId(null);
    }

    // 🏷 Категорія
    const savedCategory = await AsyncStorage.getItem(
      `category_${id}`
    );

    if (savedCategory) {
      setSelectedCategory(JSON.parse(savedCategory));
    }

  } catch (err) {
    console.log('EDIT LOAD ERROR:', err);
  }
};

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

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      if (!storageId) {
        console.log('INVALID STORAGE ID');
        return;
      }

      const [day, month, year] = expiration.split('-');
      const isoDate = `${year}-${month}-${day}`;

      const updatedProduct = {
        name: name.trim(),
        quantity: Number(quantity),
        unit,
        expiration_date: isoDate,
        comments: comment,
        storage_place_id: storageId,
      };

      console.log('PATCH ID:', id);
      console.log('STORAGE ID:', storageId);
      console.log('PAYLOAD:', updatedProduct);

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        console.log(await response.text());
        return;
      }

      await AsyncStorage.setItem(
        `category_${id}`,
        JSON.stringify(selectedCategory)
      );

      await new Promise((r) => setTimeout(r, 300));

      router.replace('/(tabs)');

    } catch (error) {
      console.log('EDIT SAVE ERROR:', error);
    }
  };

  return (
  <Pressable style={{ flex: 1 }} onPress={() => setShowUnits(false)}>
    <Stack.Screen options={{ headerShown: false }} />

    <ScrollView style={{ flex: 1, backgroundColor: "#EAF6FA" }}>

      {/* Верх */}
      <View style={styles.top}>
        <Text style={styles.title}>Редагувати продукт</Text>
      </View>

      <View style={styles.content}>

        {/* Назва */}
        <View style={styles.card}>
          <Text style={styles.label}>Назва продукту</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Наприклад: Молоко"
            placeholderTextColor="#9AA3AF"
            style={[styles.input, errors.name && styles.errorBorder]}
          />
        </View>

        {/* Кількість + dropdown */}
        <View style={[styles.card, { zIndex: 50, elevation: 50 }]}>
          <Text style={styles.label}>Кількість</Text>

          <View style={{ flexDirection: "row" }}>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9AA3AF"
              style={[
                styles.input,
                { flex: 1, marginRight: 10 },
                errors.quantity && styles.errorBorder,
              ]}
            />

            <View style={{ width: 120, position: "relative" }}>
              <TouchableOpacity
                onPress={() => setShowUnits(!showUnits)}
                activeOpacity={0.85}
                style={[styles.input, { justifyContent: "center" }]}
              >
                <Text style={styles.unitText}>
                  {UNIT_LABELS[unit] || unit}
                </Text>
              </TouchableOpacity>

              {showUnits && (
                <View style={styles.unitsDropdown}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {UNITS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          setUnit(item);
                          setShowUnits(false);
                        }}
                        activeOpacity={0.85}
                        style={styles.unitRow}
                      >
                        <Text style={styles.unitRowText}>
                          {UNIT_LABELS[item]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Storage */}
        <View style={styles.card}>
          <Text style={styles.label}>Місце зберігання</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              if (!storagePlaces.length) return;

              const currentIndex = storagePlaces.findIndex(
                (s) => s.id === storageId
              );

              const nextIndex =
                currentIndex === -1 ||
                currentIndex === storagePlaces.length - 1
                  ? 0
                  : currentIndex + 1;

              setStorage(storagePlaces[nextIndex].name);
              setStorageId(storagePlaces[nextIndex].id);
            }}
          >
            <View style={styles.storagePill}>
              <Text style={styles.storagePillText}>{storage}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Категорії */}
        <View style={styles.card}>
          <Text style={styles.label}>Категорії</Text>

          <View style={styles.categoriesWrap}>
            {CATEGORIES.map((cat) => {
              const selected = selectedCategory?.id === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.85}style={styles.categoryItem}
                >
                  <View
                    style={[
                      styles.categoryCircle,
                      { backgroundColor: cat.color },
                      selected && styles.categorySelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon}
                      size={26}
                      color="#fff"
                    />
                  </View>

                  <Text
                    style={[
                      styles.categoryName,
                      selected && styles.categoryNameSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Дата */}
        <View style={styles.card}>
          <Text style={styles.label}>Термін придатності</Text>
          <TextInput
            value={expiration}
            onChangeText={formatDate}
            keyboardType="numeric"
            maxLength={10}
            placeholder="ДД-ММ-РРРР"
            placeholderTextColor="#9AA3AF"
            style={[styles.input, errors.expiration && styles.errorBorder]}
          />
        </View>

        {/* Коментар */}
        <View style={styles.card}>
          <Text style={styles.label}>Коментар</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            placeholder="Додайте декілька слів"
            placeholderTextColor="#9AA3AF"
            style={[styles.input, { height: 96, paddingTop: 12 }]}
          />
        </View>

        {/* Кнопка */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.9}
          style={styles.saveBtn}
        >
          <Text style={styles.saveText}>Зберегти</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  </Pressable>
);
}
const styles = {
  top: {
    height: 170,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#EAF6FA",
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  label: {
    marginBottom: 8,
    fontWeight: "800",
    fontSize: 15,
    color: "#64748B",
  },

  input: {
    backgroundColor: "#EAF6FA",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    color: "#0F172A",
    fontWeight: "700",
  },

  errorBorder: {
    borderColor: "#FF3B30",
  },

  unitText: {
    color: "#0F172A",
    fontWeight: "800",
  },

  unitsDropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 120,
    maxHeight: 160,
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
  },

  unitRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  unitRowText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },

  storagePill: {
    backgroundColor: "rgba(255,122,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,122,0,0.24)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignSelf: "flex-start",
  },

  storagePillText: {
    color: "#FF7A00",
    fontWeight: "900",
    fontSize: 14,
  },

  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },

  categoryItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 14,
  },

  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  categorySelected: {
    borderWidth: 3,
    borderColor: "#FF7A00",
  },

  categoryName: {
    marginTop: 6,
    fontSize: 11,
    textAlign: "center",
    color: "#334155",
    fontWeight: "700",
    opacity: 0.85,
  },

  categoryNameSelected: {
    opacity: 1,
    fontWeight: "900",
  },

  saveBtn: {
    backgroundColor: "#FF7A00",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
};
