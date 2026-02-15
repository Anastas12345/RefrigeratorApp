import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';



export default function EditProduct() {
  const params = useLocalSearchParams();

  // Дані приходять через navigation
  const [name, setName] = useState(params.name || '');
  const [quantity, setQuantity] = useState(params.quantity || '');
  const [unit, setUnit] = useState(params.unit || 'Штуки');
  const [expiration, setExpiration] = useState(params.expiration || '');
  const [comment, setComment] = useState(params.comment || '');
  const [storage, setStorage] = useState(params.storage || 'Холодильник');
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.find((c) => c.id == params.categoryId) || null
  );

  const UNITS = ['Штуки', 'Кілограми', 'Літри', 'Грами'];

  const handleSave = () => {
    console.log('Оновлений продукт:', {
      name,
      quantity,
      unit,
      expiration,
      comment,
      storage,
      categoryId: selectedCategory?.id,
    });

    router.back();
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

        {/* Термін */}
        <View style={sectionStyle}>
          <Text style={labelStyle}>Термін придатності</Text>
          <TextInput
            value={expiration}
            onChangeText={setExpiration}
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
