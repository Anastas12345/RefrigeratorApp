import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CATEGORIES } from "../constants/categories";
import { Stack } from 'expo-router';


const API_URL = "https://myfridgebackend.onrender.com/api/products";
const UNIT_LABELS = {
  pcs: 'шт',
  kg: 'кг',
  g: 'г',
  l: 'л',
  ml: 'мл',
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Токен відсутній");

      const response = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Помилка завантаження");

      const data = await response.json();
      setProduct(data);

      // 🔥 Читаємо категорію з productCategories
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
    } catch (err) {
      console.log("DETAIL ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Токен відсутній");

      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setDeleteModalVisible(false);
      router.replace("/(tabs)");
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Продукт не знайдено</Text>
      </View>
    );
  }

  const formattedDate = product.expiration_date
    ? new Date(product.expiration_date).toLocaleDateString("uk-UA")
    : "—";

  return (
  <>
    <Stack.Screen
  options={{
    headerTransparent: true,
    headerTitle: '',
    headerShadowVisible: false,
    headerBackVisible: false,
    headerStyle: {
      backgroundColor: 'transparent',
    },
  }}
/>

    <View style={{ flex: 1, backgroundColor: "#CFE8F1" }}>
      <View
        style={{
          backgroundColor: "#F6E2A7",
          height: 120,
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "700" }}>
          Інформація
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <View
          style={{
            backgroundColor: "#D9EEF6",
            padding: 15,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <Text>Назва продукту</Text>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            {product.name}
          </Text>


          <Text style={{ marginTop: 15 }}>
            Місце зберігання
          </Text>
          <Text
            style={{
              color: "#FF7A00",
              fontWeight: "600",
            }}
          >
            {product.storage_places?.name || "—"}
          </Text>
        </View>

        {category && (
          <View
            style={{
              backgroundColor: "#D9EEF6",
              padding: 15,
              borderRadius: 20,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ marginBottom: 10 }}>
              Категорія
            </Text>

            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: category.color,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
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
        <Text style={{ marginBottom: 20 }}>
  {product.quantity} {UNIT_LABELS[product.unit] || product.unit}
</Text>

        <Text>Термін придатності</Text>
        <Text
          style={{
            color: "#FF7A00",
            fontWeight: "600",
            marginBottom: 30,
          }}
        >
          {formattedDate}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/edit-product",
                params: { id: product.id },
              })
            }
            style={{
              backgroundColor: "#F6E2A7",
              padding: 12,
              borderRadius: 10,
              width: "45%",
              alignItems: "center",
            }}
          >
            <Text>Редагувати</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setDeleteModalVisible(true)
            }
            style={{
              backgroundColor: "#F39C12",
              paddingVertical: 12,
              paddingHorizontal: 25,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              З’їв
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#FF7A00",
            paddingVertical: 16,
            borderRadius: 40,
            alignItems: "center",
            marginTop: 40,
          }}
          onPress={() => router.back()}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
            }}
          >
            Назад
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 МОДАЛЬНЕ ВІКНО */}
      {deleteModalVisible && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>
        Вам було смачно?
      </Text>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.modalYes}
          onPress={deleteProduct}
        >
          <Text style={styles.modalText}>
            Так
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalNo}
          onPress={() =>
            setDeleteModalVisible(false)
          }
        >
          <Text style={styles.modalText}>
            Ні
          </Text>
        </TouchableOpacity>
      </View>

      {/* 👇 Ось тут має бути підказка */}
      <Text style={styles.modalHint}>
        "Так" — продукт буде видалено.
        {"\n"}
        "Ні" — продукт залишиться у списку.
      </Text>


    </View>
  </View>
)}
        </View>
  </>
);
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    
  },

  modalCard: {
    backgroundColor: "#f1c555",
    width: "80%",
    padding: 25,
    borderRadius: 30,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  modalYes: {
    backgroundColor: "#FF7A00",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },

  modalNo: {
    backgroundColor: "#FF7A00",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
modalHint: {
  marginTop: 15,
  fontSize: 12,
  color: "#555",
  textAlign: "center",
  lineHeight: 18,
},
  modalText: {
    color: "#fff",
    fontWeight: "700",
  },
});
