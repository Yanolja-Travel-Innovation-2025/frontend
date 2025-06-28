import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 앱 시작 시 토큰 자동 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // 토큰 만료 체크
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ email: decoded.email, nickname: decoded.nickname });
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // 회원가입
  const register = async (email, password, nickname) => {
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/register', { email, password, nickname });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || '회원가입 실패';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 로그인
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || '로그인 실패';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  // 에러 초기화
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 