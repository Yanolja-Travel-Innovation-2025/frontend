import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { Button, CircularProgress, Typography, Box, Card, CardContent, Grid, Chip } from '@mui/material';
import { useBadges } from '../BadgeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import QRScanner from '../components/QRScanner';

// 제주도 관광지 좌표 (실제 배지 위치)
const BADGE_LOCATIONS = {
  'HALLASAN_SUMMIT_2024': { lat: 33.3617, lng: 126.5312, name: '한라산 백록담' },
  'SEONGSAN_SUNRISE_2024': { lat: 33.4584, lng: 126.9423, name: '성산일출봉' },
  'UDO_LIGHTHOUSE_2024': { lat: 33.5064, lng: 126.9502, name: '우도 등대' },
  'HYEOPJAE_BEACH_2024': { lat: 33.3939, lng: 126.2394, name: '협재해수욕장' },
  'OLLE_TRAIL_7_2024': { lat: 33.2450, lng: 126.2654, name: '올레길 7코스' },
};

const JEJU_CENTER = { lat: 33.4996, lng: 126.5312 };

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
  const { allBadges, myBadges, issueBadge, loading: badgeLoading } = useBadges();
  const { isLoggedIn } = useAuth();
  const { showWarning, showSuccess, showError } = useNotification();
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(null);

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

  // 테스트용 위치 강제 세팅 (랜덤 위치)
  const handleSetTestLocation = () => {
    const locations = Object.values(BADGE_LOCATIONS);
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    setUserPos(randomLocation);
    setError(null);
    setLoading(false);
  };

  // 현재 위치에서 획득 가능한 배지들 찾기
  const getAvailableBadges = () => {
    if (!userPos || !allBadges.length) return [];
    
    return allBadges.filter(badge => {
      // 이미 획득한 배지는 제외
      if (myBadges.find(myBadge => myBadge._id === badge._id)) return false;
      
      // 위치 정보가 있는 배지만 체크
      if (!badge.location?.coordinates) return false;
      
      const [lng, lat] = badge.location.coordinates;
      const distance = getDistanceFromLatLonInM(userPos.lat, userPos.lng, lat, lng);
      
      // 1km 이내의 배지만 획득 가능
      return distance < 1000;
    });
  };

  const availableBadges = getAvailableBadges();

  const handleGetBadge = (badge) => {
    if (!isLoggedIn) {
      showWarning('배지를 획득하려면 로그인이 필요합니다.');
      return;
    }
    
    setCurrentBadge(badge);
    setQrScannerOpen(true);
  };

  const handleQRScan = async (qrData) => {
    if (!currentBadge) return;
    
    try {
      // QR 코드가 해당 배지의 QR 코드와 일치하는지 확인
      if (qrData === currentBadge.location.qrCode) {
        await issueBadge(currentBadge._id);
        showSuccess(`${currentBadge.name} 배지를 획득했습니다!`);
      } else {
        showError('올바른 QR 코드가 아닙니다.');
      }
    } catch (error) {
      showError('배지 발급 중 오류가 발생했습니다.');
    } finally {
      setCurrentBadge(null);
    }
  };

  const handleQRScanClose = () => {
    setQrScannerOpen(false);
    setCurrentBadge(null);
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <h1 style={{ margin: '20px 0' }}>제주도 디지털 여권</h1>
      
      <Button
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        onClick={handleSetTestLocation}
      >
        🎲 랜덤 관광지로 이동 (테스트)
      </Button>
      
      {/* 지도 */}
      <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden' }}>
        <Map
          center={JEJU_CENTER}
          style={{ width: '100%', height: '400px' }}
          level={10}
        >
          {/* 모든 배지 위치 마커 표시 */}
          {allBadges.map((badge) => {
            if (!badge.location?.coordinates) return null;
            const [lng, lat] = badge.location.coordinates;
            const isObtained = myBadges.find(myBadge => myBadge._id === badge._id);
            
            return (
              <MapMarker 
                key={badge._id} 
                position={{ lat, lng }}
                image={{ 
                  src: isObtained 
                    ? 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png' // 획득한 배지 (체크)
                    : 'https://cdn-icons-png.flaticon.com/512/684/684908.png',   // 미획득 배지 (보물상자)
                  size: { width: 30, height: 30 } 
                }}
              >
                <div style={{ padding: '5px', color: isObtained ? '#4caf50' : '#ff9800', fontWeight: 'bold' }}>
                  {badge.location.name}
                </div>
              </MapMarker>
            );
          })}
          
          {/* 내 위치 마커 */}
          {userPos && (
            <MapMarker 
              position={userPos} 
              image={{ src: 'https://cdn-icons-png.flaticon.com/512/64/64113.png', size: { width: 32, height: 32 } }}
            >
              <div style={{ padding: '2px', color: '#1976d2', fontWeight: 'bold' }}>내 위치</div>
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
          {/* 획득 가능한 배지 목록 */}
          {availableBadges.length > 0 ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                🎯 현재 위치에서 획득 가능한 배지 ({availableBadges.length}개)
              </Typography>
              <Grid container spacing={2}>
                {availableBadges.map((badge) => {
                  const [lng, lat] = badge.location.coordinates;
                  const distance = getDistanceFromLatLonInM(userPos.lat, userPos.lng, lat, lng);
                  
                  return (
                    <Grid item xs={12} sm={6} key={badge._id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {badge.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {badge.description}
                          </Typography>
                          <Chip 
                            label={badge.rarity} 
                            color={badge.rarity === 'gold' ? 'warning' : badge.rarity === 'silver' ? 'info' : 'default'}
                            size="small" 
                            sx={{ mb: 2 }}
                          />
                          <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                            📍 {badge.location.name} (약 {Math.round(distance)}m)
                          </Typography>
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            onClick={() => handleGetBadge(badge)}
                            disabled={badgeLoading}
                            startIcon={badgeLoading ? <CircularProgress size={20} /> : null}
                          >
                            QR 인증하고 배지 획득
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                🗺️ 현재 위치에서 획득 가능한 배지가 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                제주도 관광지 근처(1km 이내)로 이동해보세요!
              </Typography>
            </Box>
          )}

          {/* 현재 상태 요약 */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="subtitle1">
              📊 나의 배지 수집 현황
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              전체 배지: {allBadges.length}개 | 획득한 배지: {myBadges.length}개 | 
              진행률: {allBadges.length > 0 ? Math.round((myBadges.length / allBadges.length) * 100) : 0}%
            </Typography>
          </Box>
        </>
      )}

      {/* QR 스캐너 컴포넌트 */}
      <QRScanner
        open={qrScannerOpen}
        onClose={handleQRScanClose}
        onScan={handleQRScan}
        expectedQRCode={currentBadge?.location?.qrCode}
      />
    </div>
  );
}

export default HomePage; 