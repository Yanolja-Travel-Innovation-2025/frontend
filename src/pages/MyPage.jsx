import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Divider, List, ListItem, ListItemText, Chip, Stack } from '@mui/material';
import { useBadges } from '../BadgeContext';

// 제휴 상점 목업 데이터
const partnerStores = [
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

function MyPage() {
  const { badges } = useBadges();
  const discount = getDiscountByBadgeCount(badges.length);
  const lastVisit = getLastVisitDate(badges);
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        마이페이지
      </Typography>
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
      <Typography variant="h5" gutterBottom>
        제휴 상점 & 할인 혜택
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        내 배지 개수: <b>{badges.length}개</b> → <Chip label={discount.desc} color={discount.rate > 0 ? 'success' : 'default'} size="small" />
      </Typography>
      <List>
        {partnerStores.map((store) => (
          <ListItem key={store._id} sx={{ mb: 1, border: '1px solid #eee', borderRadius: 2 }}>
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
    </Box>
  );
}

export default MyPage; 