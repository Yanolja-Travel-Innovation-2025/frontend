import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Paper, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';

import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import { BadgeProvider } from './BadgeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PartnerProvider } from './contexts/PartnerContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AuthDialog from './components/AuthDialog';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoggedIn } = useAuth();
  
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

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

  const handleLogin = () => {
    setAuthDialogOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // 로그아웃 시 홈으로 이동
  };

  return (
    <Box sx={{ pb: 7 }}>
      <CssBaseline />
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            디지털 관광 여권
          </Typography>
          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>
              로그아웃 ({user?.nickname})
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              로그인
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <AuthDialog 
        open={authDialogOpen} 
        onClose={() => setAuthDialogOpen(false)} 
      />
      
      {/* Add Toolbar to create space for fixed AppBar */}
      <Toolbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mypage" element={<MyPage />} />
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
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BadgeProvider>
          <PartnerProvider>
            <AppContent />
          </PartnerProvider>
        </BadgeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
