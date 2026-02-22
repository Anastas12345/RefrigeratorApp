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
    <Pressable
      style={{ flex: 1 }}
      onPress={() => setShowUnits(false)}
    >
      <ScrollView style={{ flex: 1, backgroundColor: '#CFE8F1' }}>

        {/* Верхня дуга */}
        <View
          style={{
            backgroundColor: '#F6E2A7',
            height: 120,
            borderBottomLeftRadius: 100,
            borderBottomRightRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '700' }}>
            Редагувати продукт
          </Text>
        </View>

        <View style={{ padding: 20 }}>

          {/* Назва */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Назва продукту</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[inputStyle, errors.name && errorBorder]}
            />
          </View>

          {/* Кількість */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Кількість</Text>

            <View style={{ flexDirection: 'row' }}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={[
                  inputStyle,
                  { flex: 1, marginRight: 10 },
                  errors.quantity && errorBorder,
                ]}
              />

              <View style={{ width: 140, position: 'relative' }}>
                <TouchableOpacity
                  onPress={() => setShowUnits(!showUnits)}
                  style={[inputStyle, { justifyContent: 'center' }]}
                >
                  <Text>{unit}</Text>
                </TouchableOpacity>

                {showUnits && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 50,
                      width: '100%',
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      elevation: 6,
                      zIndex: 1000,
                    }}
                  >
                    {UNITS.map((item) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() => {
                          setUnit(item);
                          setShowUnits(false);
                        }}
                        style={{ padding: 12 }}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Storage */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Місце зберігання</Text>

            <TouchableOpacity
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
              <View
                style={{
                  backgroundColor: '#FF7A00',
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {storage}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Категорії */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Категорії</Text>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    width: '23%',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: cat.color,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth:
                        selectedCategory?.id === cat.id ? 3 : 0,
                      borderColor: '#000',
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
                      marginTop: 5,
                      fontSize: 10,
                      textAlign: 'center',
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Дата */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Термін придатності</Text>
            <TextInput
              value={expiration}
              onChangeText={formatDate}
              keyboardType="numeric"
              maxLength={10}
              style={[inputStyle, errors.expiration && errorBorder]}
            />
          </View>

          {/* Коментар */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Коментувати</Text>
            <TextInput
              value={comment}
              onChangeText={setComment}
              multiline
              style={[inputStyle, { height: 80 }]}
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: '#FF7A00',
              paddingVertical: 18,
              borderRadius: 40,
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Зберегти
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </Pressable>
  );
}

const sectionStyle = {
  backgroundColor: '#D9EEF6',
  padding: 15,
  borderRadius: 20,
  marginBottom: 20,
};

const labelStyle = {
  marginBottom: 8,
  fontWeight: '500',
};

const inputStyle = {
  backgroundColor: '#fff',
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: 'transparent',
};

const errorBorder = {
  borderColor: '#FF3B30',
};