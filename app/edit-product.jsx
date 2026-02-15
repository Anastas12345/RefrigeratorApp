import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { MOCK_PRODUCTS, updateMockProduct } from '../data/mockProducts';

export default function EditProduct() {
  const { id } = useLocalSearchParams();

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Штуки');
  const [expiration, setExpiration] = useState('');
  const [comment, setComment] = useState('');
  const [storage, setStorage] = useState('Холодильник');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setQuantity(product.quantity?.toString());
      setUnit(product.unit);
      setExpiration(product.expiration_date);
      setComment(product.comment || '');
      setStorage(product.storage_places?.name);
      setSelectedCategory(
        CATEGORIES.find((c) => c.id === product.categoryId) || null
      );
    }
  }, []);

  const UNITS = ['Штуки', 'Кілограми', 'Літри', 'Грами'];

  const handleSave = () => {
    updateMockProduct({
      id,
      name,
      quantity: Number(quantity),
      unit,
      expiration_date: expiration,
      comment,
      storage_places: { name: storage },
      categoryId: selectedCategory?.id,
    });

    router.replace('/(tabs)');
  };

  return (
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
          Редагувати
        </Text>
      </View>

      <View style={{ padding: 20 }}>

        {/* Назва */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Назва продукту</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={inputStyle}
          />
        </View>

        {/* Кількість */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Кількість</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={inputStyle}
          />
        </View>

        {/* Одиниця */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Одиниця виміру</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u)}
                style={{
                  backgroundColor: unit === u ? '#FF7A00' : '#ccc',
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#fff' }}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Місце зберігання */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Місце зберігання</Text>
          <TouchableOpacity
            onPress={() =>
              setStorage(
                storage === 'Холодильник'
                  ? 'Морозилка'
                  : storage === 'Морозилка'
                  ? 'Комора'
                  : 'Холодильник'
              )
            }
          >
            <View style={pillStyle}>
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
                  width: '25%',
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

        {/* Термін придатності */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Термін придатності</Text>
          <TextInput
            value={expiration}
            onChangeText={setExpiration}
            placeholder="ДД-ММ-РРРР"
            style={inputStyle}
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

        {/* Кнопка */}
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
  );
}

/* СТИЛІ */

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
};

const pillStyle = {
  backgroundColor: '#FF7A00',
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 20,
  alignSelf: 'flex-start',
};
