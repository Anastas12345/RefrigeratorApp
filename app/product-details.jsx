import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { CATEGORIES } from '../constants/categories';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { deleteMockProduct } from '../data/mockProducts';




export default function ProductDetails() {
  const { id } = useLocalSearchParams();

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Продукт не знайдено</Text>
      </View>
    );
  }

  const category = CATEGORIES.find(
    (c) => c.id === product.categoryId
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#CFE8F1' }}>

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
        <Text style={{ fontSize: 26, fontWeight: '700' }}>
          Інформація
        </Text>
      </View>

      <View style={{ padding: 20 }}>

        {/* Назва + місце */}
        <View
          style={{
            backgroundColor: '#D9EEF6',
            padding: 15,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ marginBottom: 5 }}>Назва продукту</Text>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            {product.name}
          </Text>

          <Text style={{ marginTop: 15 }}>Місце зберігання</Text>
          <Text style={{ color: '#FF7A00', fontWeight: '600' }}>
            {product.storage_places?.name}
          </Text>
        </View>

        {/* Категорія */}
        {category && (
          <View
            style={{
              backgroundColor: '#D9EEF6',
              padding: 15,
              borderRadius: 20,
              marginBottom: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ marginBottom: 10 }}>Категорії</Text>

           <View
  style={{
    alignItems: 'center',
    marginTop: 10,
  }}
>
  {/* Кружок */}
  <View
    style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: category.color,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    }}
  >
    <MaterialCommunityIcons
      name={category.icon}
      size={28}
      color="#fff"
    />
  </View>

  {/* Назва категорії */}
  <Text
    style={{
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    }}
  >
    {category.name}
  </Text>
</View>



            <Text style={{ marginTop: 10 }}>
              {category.label}
            </Text>
          </View>
        )}

        {/* Термін придатності */}
        <Text style={{ marginBottom: 5 }}>
          Термін придатності
        </Text>
        <Text style={{ color: '#FF7A00', fontWeight: '600', marginBottom: 20 }}>
          {product.expiration_date}
        </Text>

        {/* Коментар */}
        <Text style={{ marginBottom: 5 }}>
          Коментувати
        </Text>
        <Text style={{ color: '#FF7A00', fontWeight: '600', marginBottom: 30 }}>
          {product.comment || '—'}
        </Text>

        {/* Кнопки */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#F6E2A7',
              padding: 12,
              borderRadius: 10,
              width: '45%',
              alignItems: 'center',
            }}
            onPress={() =>
              router.push({
                pathname: '/edit-product',
                params: { id: product.id },
              })
            }
          >
            <Text>Редагувати</Text>
          </TouchableOpacity>

          <TouchableOpacity
  onPress={() =>
    Alert.alert(
      'Вам було смачно?',
      '',
      [
        {
          text: 'Ні',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Так',
          onPress: () => {
            deleteMockProduct(product.id);
            router.replace('/(tabs)');
          },
        },
      ],
      { cancelable: true }
    )
  }
  style={{
    backgroundColor: '#F39C12',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  }}
>
  <Text style={{ color: '#000', fontWeight: '600' }}>
    З’їв
  </Text>
</TouchableOpacity>

        </View>

        {/* Назад */}
        <TouchableOpacity
          style={{
            backgroundColor: '#FF7A00',
            paddingVertical: 16,
            borderRadius: 40,
            alignItems: 'center',
            marginTop: 40,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            Назад
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
