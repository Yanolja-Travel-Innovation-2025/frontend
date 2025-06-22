import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function HomePage() {
  return (
    <div style={{ width: '100%', height: '70vh', margin: '0 auto', maxWidth: 600 }}>
      <h1>홈 (지도)</h1>
      <Map
        center={{ lat: 33.3617, lng: 126.5292 }} // 제주도 중심
        style={{ width: '100%', height: '400px', borderRadius: '12px' }}
        level={9}
      >
        <MapMarker position={{ lat: 33.3617, lng: 126.5292 }}>
          <div style={{ padding: '4px', color: '#000' }}>제주도 중심</div>
        </MapMarker>
      </Map>
      <p style={{marginTop: 16}}>카카오맵 API를 사용하여 지도가 표시됩니다.</p>
    </div>
  );
}

export default HomePage; 