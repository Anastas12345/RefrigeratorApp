import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { CATEGORIES } from "../constants/categories";

const API_URL = "https://myfridgebackend.onrender.com/api/products";

const UNIT_LABELS = {
  pcs: "шт",
  kg: "кг",
  g: "г",
  l: "л",
  ml: "мл",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // 🔥 Категорія з AsyncStorage (як у тебе), але без проблем з типами id
      const stored = await AsyncStorage.getItem("productCategories");
      if (stored) {
        const categoriesMap = JSON.parse(stored);

        // JSON keys = string, тому приводимо ключ до string
        const productKey = String(data.id ?? data._id ?? id);

        const categoryId =
          categoriesMap[productKey] ??
          categoriesMap[data.id] ??
          categoriesMap[String(data.id)];

        if (categoryId != null) {
          const categoryObj = CATEGORIES.find(
            (cat) => String(cat.id) === String(categoryId)
          );
          if (categoryObj) setCategory(categoryObj);
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
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={{ color: "#0F172A", fontWeight: "800" }}>
          Продукт не знайдено
        </Text>
      </View>
    );
  }

  const formattedDate = product.expiration_date
    ? new Date(product.expiration_date).toLocaleDateString("uk-UA")
    : "—";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 70,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Інформація</Text>

          {/* КАРТКА 1 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Назва продукту</Text>
            <View style={styles.field}>
              <Text style={styles.fieldValue}>{product.name}</Text>
            </View>

            <Text style={[styles.cardTitle, { marginTop: 16 }]}>
              Місце зберігання
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {product.storage_places?.name || "—"}
              </Text>
            </View>
          </View>

          {/* КАРТКА 3 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Кількість</Text>
            <View style={styles.field}>
              <Text style={styles.fieldValue}>
                {product.quantity} {UNIT_LABELS[product.unit] || product.unit}
              </Text>
            </View>

            <Text style={[styles.cardTitle, { marginTop: 16 }]}>
              Термін придатності
            </Text>
            <View style={styles.field}>
              <Text style={[styles.fieldValue, { color: "#FF7A00" }]}>
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* КНОПКИ */}
          <View style={styles.rowButtons}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/edit-product",
                  params: { id: product.id },
                })
              }
              activeOpacity={0.9}
              style={styles.btnSoft}
            >
              <Text style={styles.btnSoftText}>Редагувати</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteModalVisible(true)}
              activeOpacity={0.9}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>З’їв</Text>
            </TouchableOpacity>
          </View>

          
        </ScrollView>

        {/* МОДАЛКА */}
        {deleteModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Вам було смачно?</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={deleteProduct}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modalBtnTextWhite}>Так</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSoft]}
                  onPress={() => setDeleteModalVisible(false)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.modalBtnTextDark}>Ні</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalHint}>
                “Так” — продукт буде видалено.{"\n"}
                “Ні” — продукт залишиться у списку.
              </Text>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#EAF6FA" },
  center: { justifyContent: "center", alignItems: "center" },

  pageTitle: {
    fontSize: 28,           // було 34
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 20,
    opacity: 0.92,
  textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,       // було 26
    padding: 14,            // було 16
    marginBottom: 12,       // було 16
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  cardTitle: {
    fontSize: 15,           // було 18
    fontWeight: "800",
    color: "#64748B",       // світло-сірий
  },

  field: {
    marginTop: 8,           // було 10
    backgroundColor: "#EAF6FA",
    borderRadius: 16,       // було 18
    paddingVertical: 12,    // було 14
    paddingHorizontal: 14,  // було 16
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },

  fieldValue: {
    fontSize: 16,           // було 18
    fontWeight: "800",
    color: "#334155",       // м’який сірий (не чорний)
  },

  badge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,122,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,122,0,0.24)",
    paddingVertical: 8,     // було 10
    paddingHorizontal: 14,  // було 16
    borderRadius: 16,
  },

  badgeText: {
    color: "#FF7A00",
    fontWeight: "900",
    fontSize: 14,           // було 16
  },

  rowButtons: {
    flexDirection: "row",
    gap: 10,                // було 12
    marginTop: 6,
  },

  btnPrimary: {
    flex: 1,
    backgroundColor: "#FF7A00",
    paddingVertical: 14,    // було 16
    borderRadius: 20,       // було 22
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  btnPrimaryText: {
    color: "#fff",
    fontSize: 15,           // було 16
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  btnSoft: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,    // було 16
    borderRadius: 20,       // було 22
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  btnSoftText: {
    color: "#334155",       // м’який сірий
    fontSize: 15,
    fontWeight: "900",
  },

  // modal без змін по логіці, просто компактніше і “м’якіше”
  modalOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#334155",
    textAlign: "center",
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  modalBtnPrimary: { backgroundColor: "#FF7A00" },
  modalBtnSoft: { backgroundColor: "#F1F5F9" },
  modalBtnTextWhite: { color: "#fff", fontWeight: "900" },
  modalBtnTextDark: { color: "#334155", fontWeight: "900" },
  modalHint: {
    marginTop: 10,
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
});