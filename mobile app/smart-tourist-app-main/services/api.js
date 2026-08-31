import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = "http://192.168.1.7:5000/api";


/**
 * Helper to communicate with backend 
 */
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const token = await AsyncStorage.getItem('user_token');

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await axios({
      url: `${API_BASE}${endpoint}`,
      method,
      headers,
      data: body,
    });

    return response.data;
  } catch (error) {
    console.error(`API Error on ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
};