// File: src/services/storage.js

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getToken() {
    try {
      return await AsyncStorage.getItem('movepay_token');
    } catch (e) {
      return null;
    }
  },
  async setToken(token) {
    await AsyncStorage.setItem('movepay_token', token);
  },
  async removeToken() {
    await AsyncStorage.removeItem('movepay_token');
  },
  async getUser() {
    const user = await AsyncStorage.getItem('movepay_user');
    return user ? JSON.parse(user) : null;
  },
  async setUser(user) {
    await AsyncStorage.setItem('movepay_user', JSON.stringify(user));
  },
  async clearAll() {
    await AsyncStorage.clear();
  }
};