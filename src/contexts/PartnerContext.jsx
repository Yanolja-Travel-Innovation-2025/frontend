import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const PartnerContext = createContext();

export function PartnerProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 제휴점 목록 불러오기
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/partner');
      setPartners(response.data);
    } catch (err) {
      const message = '제휴점 목록을 불러오는데 실패했습니다.';
      setError(message);
      showError(message);
      console.error('제휴점 목록 로드 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  // 제휴점 등록
  const addPartner = async (partnerData) => {
    if (!isLoggedIn) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setLoading(true);
      const response = await api.post('/partner', partnerData);
      // 성공 시 목록 다시 불러오기
      await fetchPartners();
      showSuccess('제휴점이 성공적으로 등록되었습니다!');
      return { success: true, partner: response.data.partner };
    } catch (err) {
      const message = err.response?.data?.message || '제휴점 등록에 실패했습니다.';
      setError(message);
      showError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 제휴점 삭제
  const deletePartner = async (partnerId) => {
    if (!isLoggedIn) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setLoading(true);
      await api.delete(`/partner/${partnerId}`);
      // 성공 시 목록 다시 불러오기
      await fetchPartners();
      showSuccess('제휴점이 성공적으로 삭제되었습니다.');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || '제휴점 삭제에 실패했습니다.';
      setError(message);
      showError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 제휴점 수정
  const updatePartner = async (partnerId, updateData) => {
    if (!isLoggedIn) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      setLoading(true);
      const response = await api.patch(`/partner/${partnerId}`, updateData);
      // 성공 시 목록 다시 불러오기
      await fetchPartners();
      showSuccess('제휴점 정보가 성공적으로 수정되었습니다.');
      return { success: true, partner: response.data.partner };
    } catch (err) {
      const message = err.response?.data?.message || '제휴점 수정에 실패했습니다.';
      setError(message);
      showError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // 에러 초기화
  const clearError = () => setError(null);

  // 앱 시작 시 제휴점 목록 불러오기
  useEffect(() => {
    fetchPartners();
  }, []);

  const value = {
    partners,
    loading,
    error,
    addPartner,
    deletePartner,
    updatePartner,
    fetchPartners,
    clearError,
  };

  return (
    <PartnerContext.Provider value={value}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartners() {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartners must be used within a PartnerProvider');
  }
  return context;
} 