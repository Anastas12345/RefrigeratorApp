import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

export default function AddOptionsModal({ visible, onClose }) {
  return (
  <Modal visible={visible} transparent animationType="slide">
    {/* затемнення фону */}
    <Pressable style={styles.overlay} onPress={onClose} />

    {/* bottom sheet */}
    <View style={styles.container}>
      <View style={styles.handle} />

      <Text style={styles.title}>Додати продукт</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.9}
        onPress={() => {
          onClose();
          router.push("/add-product");
        }}
      >
        <Text style={styles.primaryText}>✍️ Ввести вручну</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        activeOpacity={0.9}
        onPress={() => {
          onClose();
          router.push("/ai-scan");
        }}
      >
        <Text style={styles.secondaryText}>📸 Сфотографувати</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.cancel}>Скасувати</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)", // більш “дороге” затемнення
  },

  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    // тінь як у iOS bottom sheet
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },

  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#0F172A",
    marginBottom: 14,
  },

  primaryButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  secondaryButton: {
    backgroundColor: "rgba(255, 122, 0, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(255, 122, 0, 0.30)",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryText: {
    color: "#FF7A00",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  cancel: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 8,
  },
});