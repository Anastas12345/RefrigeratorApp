import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onGoProducts: () => void;
  onGoAddProduct?: () => void;
  onGoLogin?: () => void;
};

const SCREEN_W = Dimensions.get("window").width;
const PANEL_W = Math.round(SCREEN_W * 0.78);

export function SideMenu({
  visible,
  onClose,
  onGoProducts,
  onGoAddProduct,
  onGoLogin,
}: Props) {
  const x = useRef(new Animated.Value(-PANEL_W)).current; // зліва за екраном

  useEffect(() => {
    Animated.timing(x, {
      toValue: visible ? 0 : -PANEL_W,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, x]);

  // не рендеримо, якщо закрито (щоб не блокувало тапи)
  if (!visible) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* затемнення */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* панель */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: x }] }]}>
        <Text style={styles.title}>Меню</Text>

        <Pressable style={styles.item} onPress={onGoProducts}>
          <Text style={styles.itemText}>Продукти</Text>
        </Pressable>

        {!!onGoAddProduct && (
          <Pressable style={styles.item} onPress={onGoAddProduct}>
            <Text style={styles.itemText}>Додати продукт</Text>
          </Pressable>
        )}

        {!!onGoLogin && (
          <Pressable style={styles.item} onPress={onGoLogin}>
            <Text style={styles.itemText}>Вийти / Увійти</Text>
          </Pressable>
        )}

        <Pressable style={[styles.item, styles.close]} onPress={onClose}>
          <Text style={[styles.itemText, styles.closeText]}>Закрити</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_W,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 18 },
  item: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemText: { fontSize: 18 },
  close: { marginTop: 12, borderBottomWidth: 0 },
  closeText: { fontWeight: "600" },
});