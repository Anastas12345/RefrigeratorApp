import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';

export default function BatchConfirm() {
  const params = useLocalSearchParams();

  const parsedProducts = useMemo(() => {
    try {
      return JSON.parse(params.products || '[]');
    } catch {
      return [];
    }
  }, [params.products]);

  const initialProducts = parsedProducts.map((p, index) => ({
    id: `${Date.now()}-${index}`,
    name: p.name || '',
    quantity: p.quantity || 1,
    unit: p.unit || 'pcs',
    categoryId: p.categoryId || 1,
    expiration_date: p.expiration_date
  ? (() => {
      const [y, m, d] = p.expiration_date.split('-');
      return `${d}-${m}-${y}`;
    })()
  : '',
    storage_places: { name: 'Холодильник' },
    comment: '',
  }));

  const [items, setItems] = useState(initialProducts);
  const [activeUnitIndex, setActiveUnitIndex] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);

  const UNITS = ['pcs', 'kg', 'g', 'l', 'ml'];
  const UNIT_LABELS = {
  pcs: 'шт',
  kg: 'кг',
  g: 'г',
  l: 'л',
  ml: 'мл',
};

  const updateField = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };
  const formatDateInput = (index, text) => {
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

  updateField(index, 'expiration_date', formatted);
};
  const getStoragePlaceId = async () => {
  const token = await AsyncStorage.getItem('token');

  const response = await fetch(
    'https://myfridgebackend.onrender.com/api/StoragePlace/all',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const places = await response.json();

  const fridge = places.find(p => p.name === 'Холодильник');

  return fridge?.id;
};

const handleSaveAll = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const storagePlaceId = await getStoragePlaceId();

    const payload = items.map((item) => {
  let isoDate = null;

  if (item.expiration_date) {
    const [day, month, year] = item.expiration_date.split('-');
    isoDate = `${year}-${month}-${day}`;
  }

  return {
    Name: item.name,
    Quantity: Number(item.quantity),
    Unit: item.unit,
    Expiration_Date: isoDate,
    Storage_Place_Id: storagePlaceId,
    Comment: item.comment || "",
  };
});

    const response = await fetch(
      'https://myfridgebackend.onrender.com/api/products/batch',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.log("BATCH SAVE ERROR:", text);
      return;
    }

    // 🔥 ТЕПЕР ОТРИМУЄМО ВСІ ПРОДУКТИ
    const productsResponse = await fetch(
      'https://myfridgebackend.onrender.com/api/products',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!productsResponse.ok) {
      console.log("GET PRODUCTS ERROR");
      router.replace('/(tabs)');
      return;
    }

    const allProducts = await productsResponse.json();

    // 🔥 Беремо останні створені
    const lastCreated = allProducts
      .slice(-items.length);

    // 🔥 Зберігаємо категорії локально
    const stored = await AsyncStorage.getItem("productCategories");
let categoriesMap = stored ? JSON.parse(stored) : {};

for (let i = 0; i < lastCreated.length; i++) {
  categoriesMap[lastCreated[i].id] = items[i].categoryId;
}

await AsyncStorage.setItem(
  "productCategories",
  JSON.stringify(categoriesMap)
);

    router.replace('/(tabs)');

  } catch (error) {
    console.log("BATCH ERROR:", error);
  }
};

  const renderItem = ({ item, index }) => (
    <View style={cardStyle}>
      <Text style={titleStyle}>Продукт {index + 1}</Text>

      <TextInput
        value={item.name}
        onChangeText={(text) => updateField(index, 'name', text)}
        placeholder="Назва"
        style={inputStyle}
      />

      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          value={String(item.quantity)}
          onChangeText={(text) => updateField(index, 'quantity', text)}
          keyboardType="numeric"
          style={[inputStyle, { flex: 1, marginRight: 10 }]}
        />

        <TouchableOpacity
          style={[inputStyle, { width: 80, justifyContent: 'center' }]}
          onPress={() =>
            setActiveUnitIndex(activeUnitIndex === index ? null : index)
          }
        >
          <Text>{UNIT_LABELS[item.unit] || item.unit}</Text>
        </TouchableOpacity>
      </View>

      {activeUnitIndex === index && (
        <View style={dropdownStyle}>
          {UNITS.map((unit) => (
            <TouchableOpacity
              key={unit}
              onPress={() => {
                updateField(index, 'unit', unit);
                setActiveUnitIndex(null);
              }}
              style={dropdownItemStyle}
            >
              <Text>{UNIT_LABELS[unit]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={categoryButtonStyle}
        onPress={() => setActiveCategoryIndex(index)}
      >
        <MaterialCommunityIcons
          name={
            CATEGORIES.find((c) => c.id === item.categoryId)?.icon || 'shape'
          }
          size={22}
          color="#fff"
        />
        <Text style={{ color: '#fff', marginLeft: 8 }}>
          {
            CATEGORIES.find((c) => c.id === item.categoryId)?.name
          }
        </Text>
      </TouchableOpacity>
<Text style={{ marginBottom: 5 }}>
  Термін придатності
</Text>

<TextInput
  value={item.expiration_date}
  onChangeText={(text) => formatDateInput(index, text)}
  placeholder="ДД-ММ-РРРР"
  keyboardType="numeric"
  maxLength={10}
  style={inputStyle}
/>
      <TextInput
        value={item.comment}
        onChangeText={(text) => updateField(index, 'comment', text)}
        placeholder="Коментар"
        style={[inputStyle, { height: 60 }]}
        multiline
      />
    </View>
  );

  return (
    <View style={containerStyle}>
      <Text style={headerStyle}>Перевірте продукти та за потреби відредагуйте</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity onPress={handleSaveAll} style={saveButtonStyle}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          Зберегти всі
        </Text>
      </TouchableOpacity>

      <Modal
        visible={activeCategoryIndex !== null}
        transparent
        animationType="slide"
      >
        <Pressable
          style={modalOverlay}
          onPress={() => setActiveCategoryIndex(null)}
        >
          <View style={modalContent}>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.id.toString()}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={categoryItemStyle}
                  onPress={() => {
                    if (activeCategoryIndex !== null) {
                      updateField(activeCategoryIndex, 'categoryId', item.id);
                    }
                    setActiveCategoryIndex(null);
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: item.color,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={26}
                      color="#fff"
                    />
                  </View>
                  <Text style={categoryTextStyle}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ================== СТИЛІ ================== */

const containerStyle = {
  flex: 1,
  padding: 20,
  backgroundColor: '#EAF6FA',
};

const headerStyle = {
  fontSize: 22,
  fontWeight: '700',
  marginBottom: 20,
  textAlign: 'center',
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: 15,
  borderRadius: 15,
  marginBottom: 15,
};

const titleStyle = {
  fontWeight: '600',
  marginBottom: 10,
};

const inputStyle = {
  backgroundColor: '#F2F2F2',
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
};

const dropdownStyle = {
  backgroundColor: '#fff',
  borderRadius: 10,
  marginBottom: 10,
  elevation: 4,
};

const dropdownItemStyle = {
  padding: 10,
};

const categoryButtonStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FF7A00',
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
};

const saveButtonStyle = {
  position: 'absolute',
  bottom: 30,
  left: 20,
  right: 20,
  backgroundColor: '#FF7A00',
  padding: 18,
  borderRadius: 30,
  alignItems: 'center',
};

const modalOverlay = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
};

const modalContent = {
  backgroundColor: '#fff',
  padding: 20,
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
};

const categoryItemStyle = {
  width: '25%',
  alignItems: 'center',
  marginBottom: 15,
};

const categoryTextStyle = {
  fontSize: 10,
  textAlign: 'center',
  marginTop: 5,
};