import React, { useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { Button, Snackbar, Alert } from '@mui/material';
import { useBadges } from '../BadgeContext';

const hallasanBadge = {
  _id: '100',
  name: '한라산 QR 인증',
  description: 'QR코드 인증으로 한라산 배지를 획득했습니다!',
  image: 'https://images.unsplash.com/photo-1579834410263-41c3075a359b?q=80&w=1974&auto=format&fit=crop',
  rarity: 'gold',
};

function HomePage() {
  const { addBadge } = useBadges();
  const [open, setOpen] = useState(false);

  const handleGetBadge = () => {
    addBadge(hallasanBadge);
    setOpen(true);
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <h1 style={{ margin: '20px 0' }}>홈 (지도)</h1>
      <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden' }}>
        <Map
          center={{ lat: 33.3617, lng: 126.5292 }} // 제주도 중심
          style={{ width: '100%', height: '500px' }} // 높이를 고정값으로 변경
          level={9}
        >
          <MapMarker position={{ lat: 33.3617, lng: 126.5292 }}>
            <div style={{ padding: '5px', color: '#000' }}>제주도</div>
          </MapMarker>
        </Map>
      </div>
      <Button
        variant="contained"
        color="success"
        size="large"
        sx={{ mt: 3, width: '100%' }}
        onClick={handleGetBadge}
      >
        QR코드 인증 (배지 획득)
      </Button>
      <Snackbar open={open} autoHideDuration={2000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>
          한라산 배지를 획득했습니다!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default HomePage; 