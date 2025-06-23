# 디지털 관광 여권 - 프론트엔드

제주도 관광지를 방문하며 디지털 배지를 수집하고, 제휴점에서 할인 혜택을 받을 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **배지 수집**: GPS 위치 기반 관광지 배지 발급
- **제휴점 할인**: 배지 개수에 따른 할인 혜택
- **마이페이지**: 수집한 배지 갤러리 및 통계
- **추천 시스템**: 미방문 명소 및 계절별 코스 추천

## 🛠 기술 스택

- **React 19** + **Vite**
- **Material-UI** (디자인 시스템)
- **카카오맵 API** (지도 및 위치 서비스)
- **Axios** (API 통신)
- **React Router** (페이지 라우팅)
- **Context API** (상태 관리)

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 시작
```bash
npm run dev
```

### 3. 빌드
```bash
npm run build
```

### 4. 프리뷰
```bash
npm run preview
```

## 🔧 환경 설정

### 카카오맵 API 키 설정
`frontend/index.html` 파일의 카카오맵 API 키를 본인의 키로 변경하세요:

```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY"></script>
```

### 백엔드 서버 연결
`src/api/axios.js`에서 백엔드 서버 URL을 확인하세요:

```javascript
baseURL: 'http://localhost:4000/api'
```

## 📱 페이지 구성

- **홈페이지** (`/`): 제주도 지도 및 배지 획득
- **마이페이지** (`/mypage`): 배지 갤러리, 제휴점 관리, 추천 명소

## 🎯 사용 방법

1. **회원가입/로그인**: 상단 로그인 버튼 클릭
2. **위치 이동**: "랜덤 관광지로 이동" 버튼으로 테스트
3. **배지 획득**: 관광지 근처(1km 이내)에서 QR 인증
4. **제휴점 등록**: 마이페이지에서 제휴점 등록/관리
5. **할인 혜택**: 배지 개수에 따른 자동 할인 적용

## 🗂 프로젝트 구조

```
src/
├── api/              # API 통신 설정
├── components/       # 재사용 컴포넌트
├── contexts/         # Context API (상태 관리)
├── pages/           # 페이지 컴포넌트
├── App.jsx          # 메인 앱 컴포넌트
└── main.jsx         # 앱 진입점
```

## 📊 상태 관리

- **AuthContext**: 사용자 인증 및 로그인 상태
- **BadgeContext**: 배지 관련 데이터 및 API
- **PartnerContext**: 제휴점 관련 데이터 및 API
- **NotificationContext**: 전역 알림 시스템
