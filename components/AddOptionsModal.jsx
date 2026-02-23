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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      {/* затемнення фону */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* bottom sheet */}
      <View style={styles.container}>
        <Text style={styles.title}>Додати продукт</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onClose();
            router.push('/add-product');
          }}
        >
          <Text style={styles.buttonText}>✍️ Ввести вручну</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onClose();
            router.push('/ai-scan');
          }}
        >
          <Text style={styles.buttonText}>📸 Сфотографувати</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancel}>Скасувати</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF7A00',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  cancel: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
});
