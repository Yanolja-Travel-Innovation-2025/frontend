import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

function HomePage() {
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
    </div>
  );
}

export default HomePage; 