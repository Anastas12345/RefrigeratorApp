import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const LAST_CHECK_KEY = 'lastExpirationNotificationDate';

export async function checkDailyExpiringProducts(token: string) {
  const today = new Date().toDateString();

  const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);

  if (lastCheck === today) {
    return; // вже показували сьогодні
  }

  try {
    const response = await fetch(
      'https://myfridgebackend.onrender.com/api/products?expirationCategory=soon',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return;

    const data = await response.json();

    if (data.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Є продукти, що скоро зіпсуються',
          body: `У вас ${data.length} продукт(ів) до 3 днів терміну.`,
          sound: true,
        },
        trigger: null,
      });

      await AsyncStorage.setItem(LAST_CHECK_KEY, today);
    }
  } catch (error) {
    console.log('Daily expiration check error:', error);
  }
}