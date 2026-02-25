import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Stack } from "expo-router";
const CATEGORY_MAP = {
  Dairy: 1,
  Meat: 2,
  Vegetables: 3,
  Fruits: 4,
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function AiScan() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Немає доступу до камери</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ marginTop: 10, color: 'blue' }}>
            Надати доступ
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      console.log('PHOTO URI:', photo.uri);

      setIsProcessing(true);

      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(
        'https://myfridgebackend.onrender.com/api/Scan/product',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log('AI RESPONSE:', data);

      if (!response.ok) {
        setIsProcessing(false);
        return;
      }

      const mappedProducts = data.map((item, index) => ({
        id: `ai-${index}`,
        name: item.name,
        quantity: item.quantity ?? 1,
        unit: item.unit ?? 'шт',
        categoryId: CATEGORY_MAP[item.category] ?? 1,
        expiration_date: item.expiryDate,
      }));

      router.replace({
        pathname: '/batch-confirm',
        params: {
          products: JSON.stringify(mappedProducts),
        },
      });

    } catch (error) {
      console.log('SCAN ERROR:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      {!isProcessing ? (
        <>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            ref={cameraRef}
          />

          <TouchableOpacity
            onPress={takePhoto}
            style={{
              position: 'absolute',
              bottom: 40,
              alignSelf: 'center',
              backgroundColor: '#FF7A00',
              padding: 20,
              borderRadius: 50,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Зробити фото
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text style={{ marginTop: 20 }}>
            Аналізуємо продукти...
          </Text>
        </View>
      )}
    </View>
  );
}
