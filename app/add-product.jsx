import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';

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

  const UNITS = ['шт', 'кг', 'г', 'л', 'мл'];

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

  const handleSubmit = () => {
    if (!validate()) return;

    console.log({
      name,
      quantity,
      unit,
      expiration,
      comment,
      storage,
      categoryId: selectedCategory.id,
    });

    router.back();
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
            Додати продукт
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Назва */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Назва продукту</Text>
            <TextInput
              placeholder="Наприклад: Молоко"
              value={name}
              onChangeText={setName}
              style={[inputStyle, errors.name && errorBorder]}
            />
            {errors.name && (
              <Text style={errorText}>
                Ви повинні ввести назву продукту
              </Text>
            )}
          </View>

          {/* Кількість + dropdown */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Кількість</Text>

            <View style={{ flexDirection: 'row' }}>
              <TextInput
                placeholder="0"
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
                  style={[
                    inputStyle,
                    { justifyContent: 'center' },
                  ]}
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
                      shadowColor: '#000',
                      shadowOpacity: 0.2,
                      shadowRadius: 5,
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

            {errors.quantity && (
              <Text style={errorText}>
                Ви повинні вказати кількість
              </Text>
            )}
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

            {errors.category && (
              <Text style={errorText}>
                Ви повинні обрати категорію
              </Text>
            )}

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

          {/* Дата */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>
              Термін придатності
            </Text>

            <TextInput
              placeholder="ДД-ММ-РРРР"
              value={expiration}
              onChangeText={formatDate}
              keyboardType="numeric"
              maxLength={10}
              style={[inputStyle, errors.expiration && errorBorder]}
            />

            {errors.expiration && (
              <Text style={errorText}>
                Ви повинні вказати термін придатності
              </Text>
            )}
          </View>

          {/* Коментар */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>Коментувати</Text>
            <TextInput
              placeholder="Додайте декілька слів"
              value={comment}
              onChangeText={setComment}
              multiline
              style={[inputStyle, { height: 80 }]}
            />
          </View>

          {/* Кнопка */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: '#FF7A00',
              paddingVertical: 18,
              borderRadius: 40,
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Додати
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Pressable>
  );
}

/* ===== СТИЛІ ===== */

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

const errorText = {
  color: '#FF3B30',
  marginTop: 6,
  fontSize: 12,
};
