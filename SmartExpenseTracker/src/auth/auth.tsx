import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type User = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
};

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user/token from storage on mount
  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem('@token');
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
  try {
    const res = await axios.post('http://192.168.29.47:5001/api/auth/login', { email, password });
    const { token, user } = res.data;
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem('@token', token);
    await AsyncStorage.setItem('@user', JSON.stringify(user));
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};


  const signup = async (name: string, email: string, password: string) => {
    const res = await axios.post('http://192.168.29.47:5001/api/auth/signup', { name, email, password });
    const { token, user } = res.data;
    setToken(token);
    setUser(user);
    await AsyncStorage.setItem('@token', token);
    await AsyncStorage.setItem('@user', JSON.stringify(user));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@user');
  };

  return { user, token, loading, login, signup, logout };
}
