import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';


export default function AddProduct() {
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState('');
  const [comment, setComment] = useState('');
  const [storage, setStorage] = useState('Холодильник');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [errors, setErrors] = useState({});

  const categories = new Array(12).fill(null);

  const validate = () => {
    let newErrors = {};

    if (!name) newErrors.name = true;
    if (!expiration) newErrors.expiration = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

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
          Додати продукт
        </Text>
      </View>

      <View style={{ padding: 20 }}>

        {/* Назва продукту */}
        <View
          style={{
            backgroundColor: '#D9EEF6',
            padding: 15,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ marginBottom: 8 }}>Назва продукту</Text>

          <TextInput
            placeholder="Наприклад: Молоко"
            value={name}
            onChangeText={setName}
            style={{
              backgroundColor: '#fff',
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: errors.name ? '#FF3B30' : 'transparent',
            }}
          />

          {errors.name && (
            <Text style={{ color: '#FF3B30', marginTop: 6 }}>
              Ви повинні ввести назву продукту
            </Text>
          )}
        </View>

        {/* Місце зберігання */}
        <View
          style={{
            backgroundColor: '#D9EEF6',
            padding: 15,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ marginBottom: 8 }}>Місце зберігання</Text>

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
            <Text
              style={{
                color: '#FF7A00',
                fontWeight: '600',
              }}
            >
              {storage}
            </Text>
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


        {/* Термін придатності */}
        <View
          style={{
            backgroundColor: '#D9EEF6',
            padding: 15,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ marginBottom: 8 }}>
            Термін придатності
          </Text>

          <TextInput
            placeholder="YYYY-MM-DD"
            value={expiration}
            onChangeText={setExpiration}
            style={{
              backgroundColor: '#fff',
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: errors.expiration ? '#FF3B30' : 'transparent',
            }}
          />

          {errors.expiration && (
            <Text style={{ color: '#FF3B30', marginTop: 6 }}>
              Ви повинні вказати термін придатності
            </Text>
          )}
        </View>

        {/* Коментувати */}
        <View
          style={{
            backgroundColor: '#D9EEF6',
            padding: 15,
            borderRadius: 20,
            marginBottom: 40,
          }}
        >
          <Text style={{ marginBottom: 8 }}>
            Коментувати
          </Text>

          <TextInput
            placeholder="Додайте декілька слів"
            value={comment}
            onChangeText={setComment}
            multiline
            style={{
              backgroundColor: '#fff',
              padding: 12,
              borderRadius: 10,
              height: 80,
            }}
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
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            Додати
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
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
