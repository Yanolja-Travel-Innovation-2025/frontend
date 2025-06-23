import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { useBadges } from '../BadgeContext';

function MyPage() {
  const { badges } = useBadges();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        마이페이지
      </Typography>
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
    </Box>
  );
}

export default MyPage; 