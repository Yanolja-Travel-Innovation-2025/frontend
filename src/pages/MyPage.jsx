import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Divider, List, ListItem, ListItemText, Chip, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { useBadges } from '../BadgeContext';
import { useAuth } from '../contexts/AuthContext';
import DeleteIcon from '@mui/icons-material/Delete';

// 제휴 상점 목업 데이터
const initialPartnerStores = [
  {
    _id: 'p1',
    name: '제주카페 바다향기',
    category: '카페',
    discountRate: 5,
    minimumBadges: 1,
    contact: '064-123-4567',
  },
  {
    _id: 'p2',
    name: '성산 해물 식당',
    category: '식당',
    discountRate: 10,
    minimumBadges: 3,
    contact: '064-234-5678',
  },
  {
    _id: 'p3',
    name: '한라산 게스트하우스',
    category: '숙박',
    discountRate: 15,
    minimumBadges: 5,
    contact: '010-3456-7890',
  },
];

// 추천 명소/코스 목업 데이터
const allSpots = [
  { _id: '1', name: '한라산', desc: '제주 최고봉, 사계절 등산 명소' },
  { _id: '2', name: '성산일출봉', desc: '유네스코 세계자연유산, 일출 명소' },
  { _id: '3', name: '우도', desc: '섬 속의 섬, 자전거 일주 추천' },
  { _id: '4', name: '협재해수욕장', desc: '에메랄드빛 바다, 여름 해수욕' },
  { _id: '5', name: '제주 올레길 7코스', desc: '봄·가을 걷기 여행 추천' },
];
const seasonalCourses = [
  { season: '봄', course: '올레길 7코스 + 협재해수욕장' },
  { season: '여름', course: '협재해수욕장 + 우도' },
  { season: '가을', course: '한라산 + 올레길 7코스' },
  { season: '겨울', course: '한라산 설경 트레킹' },
];

function getDiscountByBadgeCount(count) {
  if (count >= 5) return { rate: 15, desc: '15% 할인 + 특별 쿠폰' };
  if (count >= 3) return { rate: 10, desc: '10% 할인' };
  if (count >= 1) return { rate: 5, desc: '5% 할인' };
  return { rate: 0, desc: '할인 없음' };
}

function getLastVisitDate(badges) {
  // 목업: 가장 마지막에 추가된 배지의 id가 클수록 최근(실제 서비스라면 timestamp 사용)
  if (!badges.length) return null;
  // 실제로는 badges.sort((a,b)=>b.timestamp-a.timestamp)[0].timestamp
  // 여기선 id 기준으로 대충 흉내
  const last = badges.reduce((a, b) => (a._id > b._id ? a : b));
  // 목업: id가 100이면 오늘, 1~4면 2024-06-01~04로 가정
  if (last._id === '100') return '2024-06-22';
  return `2024-06-0${last._id}`;
}

// 쿠폰 발급 규칙 (배지 개수별)
function getCouponsByBadgeCount(count) {
  if (count >= 5) return [
    { id: 'c3', label: '15% 할인 쿠폰', desc: '제휴 상점 15% 할인', special: true },
    { id: 'c4', label: '특별 쿠폰', desc: '한정 이벤트 쿠폰', special: true },
  ];
  if (count >= 3) return [
    { id: 'c2', label: '10% 할인 쿠폰', desc: '제휴 상점 10% 할인' },
  ];
  if (count >= 1) return [
    { id: 'c1', label: '5% 할인 쿠폰', desc: '제휴 상점 5% 할인' },
  ];
  return [];
}

function MyPage() {
  const { badges } = useBadges();
  const { isLoggedIn, user } = useAuth();
  const discount = getDiscountByBadgeCount(badges.length);
  const lastVisit = getLastVisitDate(badges);

  // 제휴점 등록/삭제 상태 관리
  const [partnerStores, setPartnerStores] = useState(initialPartnerStores);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', contact: '', discountRate: '', minimumBadges: '' });

  // 쿠폰 상태 관리(사용 시 삭제)
  const [usedCoupons, setUsedCoupons] = useState([]);
  const coupons = getCouponsByBadgeCount(badges.length).filter(c => !usedCoupons.includes(c.id));
  const handleUseCoupon = (id) => setUsedCoupons(prev => [...prev, id]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setForm({ name: '', category: '', contact: '', discountRate: '', minimumBadges: '' }); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAdd = () => {
    setPartnerStores(prev => [
      ...prev,
      { ...form, _id: 'p' + (Date.now()), discountRate: Number(form.discountRate), minimumBadges: Number(form.minimumBadges) }
    ]);
    handleClose();
  };
  const handleDelete = (id) => setPartnerStores(prev => prev.filter(s => s._id !== id));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        마이페이지
      </Typography>
      {isLoggedIn && (
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          <b>{user?.nickname}</b> 님, 환영합니다!
        </Typography>
      )}
      {/* 방문 기록/통계 */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 2 }}>
        <Chip label={`방문한 장소 수: ${badges.length}곳`} color="info" />
        <Chip label={`마지막 방문일: ${lastVisit ? lastVisit : '기록 없음'}`} color="secondary" />
      </Stack>
      <Typography variant="h6" gutterBottom>
        수집한 배지 갤러리 ({badges.length}개)
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {badges.map((badge) => (
          <Grid item xs={6} sm={4} md={3} key={badge._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={badge.image}
                alt={badge.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {badge.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {badge.description}
                </Typography>
                <Typography variant="caption" color="primary" sx={{mt: 1, display: 'block'}}>
                  등급: {badge.rarity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* 제휴 상점/할인 안내 */}
      <Divider sx={{ my: 4 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">
          제휴 상점 & 할인 혜택
        </Typography>
        <Button variant="outlined" size="small" onClick={handleOpen}>
          제휴점 등록
        </Button>
      </Stack>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>제휴점 등록</DialogTitle>
        <DialogContent>
          <TextField label="상점명" name="name" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="카테고리" name="category" value={form.category} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="연락처" name="contact" value={form.contact} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="할인율(%)" name="discountRate" value={form.discountRate} onChange={handleChange} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="최소 배지 개수" name="minimumBadges" value={form.minimumBadges} onChange={handleChange} type="number" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleAdd} variant="contained">등록</Button>
        </DialogActions>
      </Dialog>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        내 배지 개수: <b>{badges.length}개</b> → <Chip label={discount.desc} color={discount.rate > 0 ? 'success' : 'default'} size="small" />
      </Typography>
      <List>
        {partnerStores.map((store) => (
          <ListItem key={store._id} sx={{ mb: 1, border: '1px solid #eee', borderRadius: 2 }}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(store._id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={store.name + ' (' + store.category + ')'}
              secondary={`최소 배지 ${store.minimumBadges}개 → ${store.discountRate}% 할인 | 문의: ${store.contact}`}
            />
            {badges.length >= store.minimumBadges ? (
              <Chip label="할인 가능" color="primary" />
            ) : (
              <Chip label={`배지 ${store.minimumBadges}개 필요`} color="default" />
            )}
          </ListItem>
        ))}
      </List>
      {/* 쿠폰 섹션 */}
      <Typography variant="h5" gutterBottom>
        사용 가능한 쿠폰
      </Typography>
      {coupons.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          현재 사용 가능한 쿠폰이 없습니다.
        </Typography>
      ) : (
        <List sx={{ mb: 2 }}>
          {coupons.map(coupon => (
            <ListItem key={coupon.id} sx={{ border: '1px solid #eee', borderRadius: 2, mb: 1 }}
              secondaryAction={
                <Button size="small" color="error" onClick={() => handleUseCoupon(coupon.id)}>
                  사용
                </Button>
              }
            >
              <ListItemText
                primary={<span style={{ fontWeight: 600 }}>{coupon.label} {coupon.special && <Chip label="특별" color="warning" size="small" />}</span>}
                secondary={coupon.desc}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* 추천 명소/코스 */}
      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" gutterBottom>
        추천 명소 & 계절별 추천 코스
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        아직 방문하지 않은 명소
      </Typography>
      <List>
        {allSpots.filter(spot => !badges.find(b => b.name.includes(spot.name))).map(spot => (
          <ListItem key={spot._id}>
            <ListItemText primary={spot.name} secondary={spot.desc} />
            <Chip label="추천" color="warning" size="small" />
          </ListItem>
        ))}
        {allSpots.filter(spot => !badges.find(b => b.name.includes(spot.name))).length === 0 && (
          <ListItem>
            <ListItemText primary="모든 명소를 방문하셨습니다!" />
          </ListItem>
        )}
      </List>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        계절별 추천 코스
      </Typography>
      <List>
        {seasonalCourses.map((c) => (
          <ListItem key={c.season}>
            <ListItemText primary={`${c.season} 추천`} secondary={c.course} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default MyPage; 