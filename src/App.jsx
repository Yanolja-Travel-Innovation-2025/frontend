import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Paper, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';

import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import { BadgeProvider } from './BadgeContext';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 상태/닉네임 관리
  const [loggedIn, setLoggedIn] = useState(false);
  const [nickname, setNickname] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [inputName, setInputName] = useState('');

  // Get current value from path for BottomNavigation
  const getCurrentNavValue = (pathname) => {
    if (pathname === '/mypage') return 1;
    return 0;
  };

  const [value, setValue] = useState(getCurrentNavValue(location.pathname));

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      navigate('/');
    } else if (newValue === 1) {
      navigate('/mypage');
    }
  };

  // 로그인/로그아웃 핸들러
  const handleLogin = () => {
    setLoginOpen(true);
  };
  const handleLoginSubmit = () => {
    setNickname(inputName || '게스트');
    setLoggedIn(true);
    setLoginOpen(false);
    setInputName('');
  };
  const handleLogout = () => {
    setLoggedIn(false);
    setNickname('');
    window.location.reload(); // 시연 편의상 전체 초기화
  };

  return (
    <BadgeProvider>
      <Box sx={{ pb: 7 }}>
        <CssBaseline />
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              디지털 관광 여권
            </Typography>
            {loggedIn ? (
              <Button color="inherit" onClick={handleLogout}>
                로그아웃
              </Button>
            ) : (
              <Button color="inherit" onClick={handleLogin}>
                로그인
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Dialog open={loginOpen} onClose={() => setLoginOpen(false)}>
          <DialogTitle>로그인</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="닉네임"
              fullWidth
              value={inputName}
              onChange={e => setInputName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoginOpen(false)}>취소</Button>
            <Button onClick={handleLoginSubmit} variant="contained">확인</Button>
          </DialogActions>
        </Dialog>
        {/* Add Toolbar to create space for fixed AppBar */}
        <Toolbar />

        <main>
          <Routes>
            <Route path="/" element={<HomePage loggedIn={loggedIn} nickname={nickname} />} />
            <Route path="/mypage" element={<MyPage loggedIn={loggedIn} nickname={nickname} />} />
          </Routes>
        </main>

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={handleChange}
          >
            <BottomNavigationAction label="홈" icon={<HomeIcon />} />
            <BottomNavigationAction label="마이페이지" icon={<PersonIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
    </BadgeProvider>
  );
}

export default App;
