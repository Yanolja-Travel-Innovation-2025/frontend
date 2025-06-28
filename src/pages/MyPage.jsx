import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Divider, List, ListItem, ListItemText, Chip, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert, CircularProgress, Tabs, Tab } from '@mui/material';
import { useBadges } from '../BadgeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePartners } from '../contexts/PartnerContext';
import DeleteIcon from '@mui/icons-material/Delete';
import CouponIcon from '@mui/icons-material/LocalOffer';
import TokenIcon from '@mui/icons-material/Token';

// 추천 명소/코스 목업 데이터 (실제 서비스에서는 API로 관리)
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
  const { badges, loading: badgeLoading, error: badgeError } = useBadges();
  const { isLoggedIn, user } = useAuth();
  const { 
    partners, 
    coupons, 
    eligiblePartners,
    addPartner, 
    deletePartner, 
    fetchEligiblePartners,
    fetchMyCoupons,
    generateCoupon,
    useCoupon,
    loading: partnerLoading, 
    error: partnerError 
  } = usePartners();
  
  const discount = getDiscountByBadgeCount(badges.length);
  const lastVisit = getLastVisitDate(badges);

  // 탭 상태
  const [tabValue, setTabValue] = useState(0);
  
  // 제휴점 등록 폼 상태
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', contact: '', discountRate: '', minimumBadges: '' });
  const [formError, setFormError] = useState('');

  // 쿠폰 생성 다이얼로그
  const [couponDialog, setCouponDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // 쿠폰 사용 다이얼로그
  const [useDialog, setUseDialog] = useState(false);
  const [useCouponForm, setUseCouponForm] = useState({ couponCode: '', purchaseAmount: '' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => { 
    setOpen(false); 
    setForm({ name: '', category: '', contact: '', discountRate: '', minimumBadges: '' });
    setFormError('');
  };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleAdd = async () => {
    // 유효성 검사
    if (!form.name || !form.category || !form.contact || !form.discountRate || !form.minimumBadges) {
      setFormError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (isNaN(form.discountRate) || form.discountRate <= 0 || form.discountRate > 100) {
      setFormError('할인율은 1~100 사이의 숫자여야 합니다.');
      return;
    }
    
    if (isNaN(form.minimumBadges) || form.minimumBadges < 0) {
      setFormError('최소 배지 개수는 0 이상의 숫자여야 합니다.');
      return;
    }
    
    const result = await addPartner({
      name: form.name,
      category: form.category,
      contact: form.contact,
      discountRate: Number(form.discountRate),
      minimumBadges: Number(form.minimumBadges)
    });
    
    if (result.success) {
      handleClose();
    } else {
      setFormError(result.message);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deletePartner(id);
    }
  };

  // 데이터 로딩
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchMyCoupons();
      fetchEligiblePartners(user.id);
    }
  }, [isLoggedIn, user, badges.length]);

  // 쿠폰 생성 핸들러
  const handleGenerateCoupon = async () => {
    if (!selectedPartner) return;
    
    const result = await generateCoupon(selectedPartner._id);
    if (result.success) {
      setCouponDialog(false);
      setSelectedPartner(null);
    }
  };

  // 쿠폰 사용 핸들러
  const handleUseCouponSubmit = async () => {
    if (!useCouponForm.couponCode || !useCouponForm.purchaseAmount) {
      alert('쿠폰 코드와 구매 금액을 모두 입력해주세요.');
      return;
    }

    const result = await useCoupon(useCouponForm.couponCode, Number(useCouponForm.purchaseAmount));
    if (result.success) {
      setUseDialog(false);
      setUseCouponForm({ couponCode: '', purchaseAmount: '' });
      alert(`할인이 적용되었습니다!\n원가: ${result.discount.originalAmount}원\n할인: ${result.discount.discountAmount}원\n결제금액: ${result.discount.finalAmount}원`);
    }
  };

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
      
      {/* 배지 로딩/에러 처리 */}
      {badgeLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      {badgeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {badgeError}
        </Alert>
      )}
      
      {/* 방문 기록/통계 */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Chip label={`방문한 장소 수: ${badges.length}곳`} color="info" />
        <Chip label={`마지막 방문일: ${lastVisit ? lastVisit : '기록 없음'}`} color="secondary" />
        <Chip label={discount.desc} color={discount.rate > 0 ? 'success' : 'default'} />
      </Stack>
      
      {/* 탭 네비게이션 */}
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="배지 갤러리" icon={<TokenIcon />} />
        <Tab label="할인 쿠폰" icon={<CouponIcon />} />
        <Tab label="제휴점 관리" />
      </Tabs>

      {/* 탭 컨텐츠 */}
      {tabValue === 0 && (
        <Box>
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
      )}

      {/* 할인 쿠폰 탭 */}
      {tabValue === 1 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">내 할인 쿠폰</Typography>
            <Button 
              variant="outlined" 
              onClick={() => setUseDialog(true)}
              disabled={!coupons?.length}
            >
              쿠폰 사용
            </Button>
          </Stack>
          
          {/* 쿠폰 목록 */}
          {coupons?.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              현재 보유한 쿠폰이 없습니다. 아래에서 제휴점 쿠폰을 생성해보세요!
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {coupons?.map(coupon => (
                <Grid item xs={12} sm={6} key={coupon._id}>
                  <Card sx={{ p: 2 }}>
                    <Typography variant="h6" color="primary">
                      {coupon.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      할인율: {coupon.discountRate}%
                    </Typography>
                    <Typography variant="body2">
                      유효기간: {new Date(coupon.validUntil).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      쿠폰 코드: {coupon.couponCode}
                    </Typography>
                    <Stack direction="row" sx={{ mt: 1 }}>
                      {coupon.isValid ? (
                        <Chip label="사용 가능" color="success" size="small" />
                      ) : coupon.isExpired ? (
                        <Chip label="만료됨" color="error" size="small" />
                      ) : (
                        <Chip label="사용됨" color="default" size="small" />
                      )}
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* 할인 가능 제휴점 */}
          <Typography variant="h6" gutterBottom>
            쿠폰 생성 가능한 제휴점
          </Typography>
          <List>
            {eligiblePartners?.map(partner => (
              <ListItem 
                key={partner._id} 
                sx={{ border: '1px solid #eee', borderRadius: 2, mb: 1 }}
                secondaryAction={
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => {
                      setSelectedPartner(partner);
                      setCouponDialog(true);
                    }}
                  >
                    쿠폰 생성
                  </Button>
                }
              >
                <ListItemText
                  primary={`${partner.name} (${partner.category})`}
                  secondary={`${partner.availableDiscount}% 할인 가능 (최소 배지 ${partner.minimumBadges}개)`}
                />
                <Chip label={`${partner.availableDiscount}% 할인`} color="primary" size="small" />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* 제휴점 관리 탭 */}
      {tabValue === 2 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              제휴점 관리
            </Typography>
            {isLoggedIn && (
              <Button variant="outlined" onClick={handleOpen} disabled={partnerLoading}>
                제휴점 등록
              </Button>
            )}
          </Stack>
          
          {partnerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {partnerError}
            </Alert>
          )}
          
          {partnerLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
          
          <List>
            {partners.map((store) => (
              <ListItem key={store._id} sx={{ mb: 1, border: '1px solid #eee', borderRadius: 2 }}
                secondaryAction={
                  isLoggedIn && (
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(store._id)} disabled={partnerLoading}>
                      <DeleteIcon />
                    </IconButton>
                  )
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
          
          {/* 추천 명소 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            추천 명소
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
        </Box>
      )}

      {/* 다이얼로그들 */}
      {/* 제휴점 등록 다이얼로그 */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>제휴점 등록</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField label="상점명" name="name" value={form.name} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="카테고리" name="category" value={form.category} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="연락처" name="contact" value={form.contact} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="할인율(%)" name="discountRate" value={form.discountRate} onChange={handleChange} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="최소 배지 개수" name="minimumBadges" value={form.minimumBadges} onChange={handleChange} type="number" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleAdd} variant="contained" disabled={partnerLoading}>
            {partnerLoading ? <CircularProgress size={20} /> : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 쿠폰 생성 다이얼로그 */}
      <Dialog open={couponDialog} onClose={() => setCouponDialog(false)}>
        <DialogTitle>쿠폰 생성</DialogTitle>
        <DialogContent>
          {selectedPartner && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPartner.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedPartner.availableDiscount}% 할인 쿠폰을 생성하시겠습니까?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                생성된 쿠폰은 30일간 유효합니다.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCouponDialog(false)}>취소</Button>
          <Button onClick={handleGenerateCoupon} variant="contained" disabled={partnerLoading}>
            {partnerLoading ? <CircularProgress size={20} /> : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 쿠폰 사용 다이얼로그 */}
      <Dialog open={useDialog} onClose={() => setUseDialog(false)}>
        <DialogTitle>쿠폰 사용</DialogTitle>
        <DialogContent>
          <TextField 
            label="쿠폰 코드" 
            value={useCouponForm.couponCode} 
            onChange={(e) => setUseCouponForm({...useCouponForm, couponCode: e.target.value})}
            fullWidth 
            sx={{ mb: 2 }} 
          />
          <TextField 
            label="구매 금액 (원)" 
            type="number"
            value={useCouponForm.purchaseAmount} 
            onChange={(e) => setUseCouponForm({...useCouponForm, purchaseAmount: e.target.value})}
            fullWidth 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUseDialog(false)}>취소</Button>
          <Button onClick={handleUseCouponSubmit} variant="contained" disabled={partnerLoading}>
            {partnerLoading ? <CircularProgress size={20} /> : '사용'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyPage; 