import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api/axios';
import { useAuth } from './contexts/AuthContext';

const BadgeContext = createContext();

export function BadgeProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [allBadges, setAllBadges] = useState([]); // 전체 배지 목록
  const [myBadges, setMyBadges] = useState([]); // 내가 획득한 배지
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 전체 배지 목록 불러오기
  const fetchAllBadges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/badge');
      setAllBadges(response.data);
    } catch (err) {
      setError('배지 목록을 불러오는데 실패했습니다.');
      console.error('배지 목록 로드 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  // 내 배지 목록 불러오기 (로그인한 경우에만)
  const fetchMyBadges = async () => {
    if (!isLoggedIn) {
      setMyBadges([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/badge/my');
      setMyBadges(response.data);
    } catch (err) {
      setError('내 배지 목록을 불러오는데 실패했습니다.');
      console.error('내 배지 로드 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  // 배지 발급 (실제 API 호출)
  const issueBadge = async (badgeId) => {
    if (!isLoggedIn) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setLoading(true);
      await api.post('/badge/issue', { badgeId });
      // 성공 시 내 배지 목록 다시 불러오기
      await fetchMyBadges();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || '배지 발급에 실패했습니다.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 기존 addBadge 함수는 호환성을 위해 유지 (목업에서 사용하던 것들)
  const addBadge = async (badge) => {
    // 실제 배지 ID가 있으면 API 호출, 없으면 목업 처리
    if (badge._id && badge._id !== '100') {
      return await issueBadge(badge._id);
    } else {
      // 목업 배지인 경우 (한라산 QR 인증 등)
      // 실제 서비스에서는 이 부분을 제거하고 모두 실제 배지 ID로 처리
      if (!myBadges.find(b => b._id === badge._id)) {
        setMyBadges(prev => [...prev, badge]);
      }
      return { success: true };
    }
  };

  // 에러 초기화
  const clearError = () => setError(null);

  // 앱 시작 시 전체 배지 목록 불러오기
  useEffect(() => {
    fetchAllBadges();
  }, []);

  // 로그인 상태 변경 시 내 배지 목록 불러오기
  useEffect(() => {
    fetchMyBadges();
  }, [isLoggedIn]);

  const value = {
    allBadges,
    badges: myBadges, // 기존 호환성을 위해 badges로도 제공
    myBadges,
    loading,
    error,
    addBadge,
    issueBadge,
    fetchAllBadges,
    fetchMyBadges,
    clearError,
  };

  return (
    <BadgeContext.Provider value={value}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadges() {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
} 