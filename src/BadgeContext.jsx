import React, { createContext, useContext, useState } from 'react';

const initialBadges = [
  {
    _id: '1',
    name: '한라산 정복',
    description: '대한민국에서 가장 높은 산, 한라산 등반을 완료했습니다.',
    image: 'https://images.unsplash.com/photo-1579834410263-41c3075a359b?q=80&w=1974&auto=format&fit=crop',
    rarity: 'gold',
  },
  {
    _id: '2',
    name: '성산일출봉',
    description: '유네스코 세계자연유산, 성산일출봉에서 일출을 감상했습니다.',
    image: 'https://images.unsplash.com/photo-1552526002-a45c3b17df54?q=80&w=2070&auto=format&fit=crop',
    rarity: 'silver',
  },
  {
    _id: '3',
    name: '우도 한 바퀴',
    description: '아름다운 섬 우도를 자전거로 일주했습니다.',
    image: 'https://images.unsplash.com/photo-1628521094191-ead27525373b?q=80&w=1964&auto=format&fit=crop',
    rarity: 'silver',
  },
  {
    _id: '4',
    name: '협재해수욕장',
    description: '에메랄드빛 바다, 협재해수욕장에서의 추억',
    image: 'https://images.unsplash.com/photo-1601275937719-f2de3955374e?q=80&w=2070&auto=format&fit=crop',
    rarity: 'bronze',
  },
];

const BadgeContext = createContext();

export function BadgeProvider({ children }) {
  const [badges, setBadges] = useState(initialBadges);

  // 이미 있는 배지는 중복 추가하지 않음
  const addBadge = (badge) => {
    setBadges((prev) => {
      if (prev.find((b) => b._id === badge._id)) return prev;
      return [...prev, badge];
    });
  };

  return (
    <BadgeContext.Provider value={{ badges, addBadge }}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadges() {
  return useContext(BadgeContext);
} 