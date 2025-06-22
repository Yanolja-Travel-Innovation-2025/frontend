import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';

// 실제로는 API로부터 받아올 목업 데이터
const mockBadges = [
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


function MyPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        마이페이지
      </Typography>
      <Typography variant="h6" gutterBottom>
        수집한 배지 갤러리 ({mockBadges.length}개)
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {mockBadges.map((badge) => (
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
    </Box>
  );
}

export default MyPage; 