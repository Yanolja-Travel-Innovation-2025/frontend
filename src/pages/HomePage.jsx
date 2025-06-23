import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { useBadges } from '../BadgeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const hallasanBadge = {
  _id: '100',
  name: '한라산 QR 인증',
  description: 'QR코드 인증으로 한라산 배지를 획득했습니다!',
  image: 'https://images.unsplash.com/photo-1579834410263-41c3075a359b?q=80&w=1974&auto=format&fit=crop',
  rarity: 'gold',
};

const HALLASAN_COORD = { lat: 33.3617, lng: 126.5292 };

// 두 좌표(위도,경도) 사이 거리(m) 계산 함수 (Haversine 공식)
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // 지구 반지름(m)
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function HomePage() {
  const { addBadge, issueBadge, loading: badgeLoading } = useBadges();
  const { isLoggedIn } = useAuth();
  const { showWarning } = useNotification();
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 정보 사용이 불가합니다.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError('위치 정보를 가져올 수 없습니다. (권한 거부됨)');
        setLoading(false);
      }
    );
  }, []);

  // 테스트용 위치 강제 세팅
  const handleSetTestLocation = () => {
    setUserPos(HALLASAN_COORD);
    setError(null);
    setLoading(false);
  };

  let distance = null;
  if (userPos) {
    distance = getDistanceFromLatLonInM(userPos.lat, userPos.lng, HALLASAN_COORD.lat, HALLASAN_COORD.lng);
  }
  const canGetBadge = distance !== null && distance < 1000;

  const handleGetBadge = async () => {
    if (!isLoggedIn) {
      showWarning('배지를 획득하려면 로그인이 필요합니다.');
      return;
    }
    
    // 목업 배지(한라산 QR)는 임시로 addBadge 사용
    // 실제 서비스에서는 실제 배지 ID와 issueBadge 사용
    await addBadge(hallasanBadge);
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <h1 style={{ margin: '20px 0' }}>홈 (지도)</h1>
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 1 }}
        onClick={handleSetTestLocation}
      >
        테스트 위치(한라산 근처)로 이동
      </Button>
      <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden' }}>
        <Map
          center={HALLASAN_COORD}
          style={{ width: '100%', height: '500px' }}
          level={11}
        >
          <MapMarker position={HALLASAN_COORD}>
            <div style={{ padding: '5px', color: '#000' }}>제주도</div>
          </MapMarker>
          {userPos && (
            <MapMarker position={userPos} image={{ src: 'https://cdn-icons-png.flaticon.com/512/64/64113.png', size: { width: 32, height: 32 } }}>
              <div style={{ padding: '2px', color: '#1976d2' }}>내 위치</div>
            </MapMarker>
          )}
        </Map>
      </div>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 3 }}>{error}</Typography>
      ) : (
        <>
          <Button
            variant="contained"
            color="success"
            size="large"
            sx={{ mt: 3, width: '100%' }}
            onClick={handleGetBadge}
            disabled={!canGetBadge || badgeLoading}
          >
            {badgeLoading ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
            QR코드 인증 (배지 획득)
          </Button>
          <Typography sx={{ mt: 1, textAlign: 'center' }} color={canGetBadge ? 'success.main' : 'text.secondary'}>
            {canGetBadge
              ? '한라산 반경 1km 이내입니다!'
              : distance !== null
                ? `현재 한라산까지 약 ${(distance / 1000).toFixed(2)}km 떨어져 있습니다.`
                : ''}
          </Typography>
        </>
      )}
    </div>
  );
}

export default HomePage; 