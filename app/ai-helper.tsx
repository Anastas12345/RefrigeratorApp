import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CATEGORIES } from "../constants/categories";

const AI_URL = "https://myfridgebackend.onrender.com/api/Recipe/generate";
const PRODUCTS_URL = "https://myfridgebackend.onrender.com/api/products";

export default function AiHelper() {
  const [products, setProducts] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    loadLocalCategories();
  }, []);

  const fetchProducts = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(PRODUCTS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data);
  };

  const loadLocalCategories = async () => {
    const stored = await AsyncStorage.getItem("productCategories");
    if (stored) {
      setProductCategories(JSON.parse(stored));
    }
  };

  const toggleProduct = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((i) => i !== name)
        : [...prev, name]
    );
  };

  // 🔥 ВИБІР ВСІХ
  const toggleAllProducts = () => {
    let productsToSelect: string[] = [];

    if (activeCategory !== null) {
      // якщо активна категорія — вибираємо всі з неї
      productsToSelect = products
        .filter(
          (item) =>
            productCategories[item.id] === activeCategory
        )
        .map((p) => p.name);
    } else {
      // якщо категорія не обрана — всі продукти
      productsToSelect = products.map((p) => p.name);
    }

    const allAlreadySelected =
      productsToSelect.every((p) =>
        selected.includes(p)
      ) && productsToSelect.length > 0;

    if (allAlreadySelected) {
      // очищаємо тільки ці
      setSelected((prev) =>
        prev.filter((p) => !productsToSelect.includes(p))
      );
    } else {
      // додаємо
      setSelected((prev) => [
        ...new Set([...prev, ...productsToSelect]),
      ]);
    }
  };

  const generateRecipe = async () => {
    if (!prompt.trim() || selected.length === 0) return;

    try {
      setLoading(true);
      setRecipes([]);

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          availableIngredients: selected,
          userPrompt: prompt,
        }),
      });

      const data = await res.json();

      console.log("AI RESPONSE FULL:", data);

      setRecipes(data);
    } catch (e) {
      console.log("AI ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    activeCategory === null
      ? []
      : products.filter(
          (item) =>
            productCategories[item.id] === activeCategory
        );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 180 }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>
              AI Помічник 👨‍🍳
            </Text>

            <TextInput
              placeholder="Наприклад: Що можна приготувати на вечерю з обраних продуктів? Попроси покроково."
              value={prompt}
              onChangeText={setPrompt}
              style={styles.input}
              multiline
            />

            {/* 🔥 КНОПКА ВСІ */}
            <Text style={styles.subtitle}>
              Швидкий вибір:
            </Text>

            <TouchableOpacity
              onPress={toggleAllProducts}
              style={styles.allButton}
            >
              <Text style={styles.allButtonText}>
                {activeCategory !== null
                  ? "Всі в категорії"
                  : "Всі продукти"}
              </Text>
            </TouchableOpacity>

            {/* Обрані продукти */}
            {selected.length > 0 && (
              <>
                <Text style={styles.subtitle}>
                  Обрані продукти:
                </Text>

                <View style={styles.selectedContainer}>
                  {selected.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => toggleProduct(item)}
                      style={styles.selectedChip}
                    >
                      <Text style={styles.selectedText}>
                        {item} ✕
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.subtitle}>
              Категорії:
            </Text>

            <FlatList
              horizontal
              data={CATEGORIES}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) =>
                item.id.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    setActiveCategory(
                      activeCategory === item.id
                        ? null
                        : item.id
                    )
                  }
                  style={[
                    styles.categoryChip,
                    activeCategory === item.id && {
                      backgroundColor: item.color,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color={
                      activeCategory === item.id
                        ? "#fff"
                        : "#333"
                    }
                  />
                  <Text
                    style={{
                      marginLeft: 6,
                      color:
                        activeCategory === item.id
                          ? "#fff"
                          : "#333",
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* 🔥 РЕЦЕПТИ */}
            {recipes.map((recipe, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.recipeTitle}>
                  {recipe.title}
                </Text>

                <Text style={styles.meta}>
                  Складність: {recipe.difficulty}
                </Text>

                <Text style={styles.meta}>
                  Час: {recipe.prepTime}
                </Text>

                <Text style={styles.meta}>
                  Співпадіння:{" "}
                  {recipe.matchPercentage}%
                </Text>

                {recipe.usedIngredients?.length >
                  0 && (
                  <>
                    <Text style={styles.section}>
                      Використані:
                    </Text>
                    <Text>
                      {recipe.usedIngredients.join(
                        ", "
                      )}
                    </Text>
                  </>
                )}

                {recipe.missingIngredients?.length >
                  0 && (
                  <>
                    <Text style={styles.section}>
                      Потрібно докупити:
                    </Text>
                    <Text>
                      {recipe.missingIngredients.join(
                        ", "
                      )}
                    </Text>
                  </>
                )}

                {recipe.instructions?.length >
                  0 && (
                  <>
                    <Text style={styles.section}>
                      Приготування:
                    </Text>
                    {recipe.instructions.map(
                      (
                        step: string,
                        i: number
                      ) => (
                        <Text
                          key={i}
                          style={styles.step}
                        >
                          {step}
                        </Text>
                      )
                    )}
                  </>
                )}
              </View>
            ))}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              toggleProduct(item.name)
            }
            style={[
              styles.productChip,
              selected.includes(item.name) &&
                styles.productChipActive,
            ]}
          >
            <Text
              style={
                selected.includes(item.name)
                  ? styles.productTextActive
                  : styles.productText
              }
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateRecipe}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateText}>
            Згенерувати рецепт
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF6FA" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 15 },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  subtitle: { fontWeight: "600", marginBottom: 10 },

  allButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
  },
  allButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },

  productChip: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    margin: 6,
    alignItems: "center",
  },
  productChipActive: { backgroundColor: "#FF7A00" },
  productText: { color: "#333" },
  productTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  selectedChip: {
    backgroundColor: "#FF7A00",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },

  generateButton: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: "#FF7A00",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  generateText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  meta: { marginBottom: 4 },
  section: {
    marginTop: 10,
    fontWeight: "600",
  },
  step: { marginTop: 4 },
});