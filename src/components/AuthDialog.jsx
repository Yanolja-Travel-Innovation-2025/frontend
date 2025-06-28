import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  Typography
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function AuthDialog({ open, onClose }) {
  const { register, login, loading, error, clearError } = useAuth();
  const { showSuccess } = useNotification();
  const [tab, setTab] = useState(0);
  
  // 로그인 폼 상태
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  // 회원가입 폼 상태
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '', 
    nickname: '' 
  });
  
  // 유효성 검사 에러
  const [validationErrors, setValidationErrors] = useState({});

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    clearError();
    setValidationErrors({});
  };

  const handleClose = () => {
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ email: '', password: '', confirmPassword: '', nickname: '' });
    setValidationErrors({});
    clearError();
    onClose();
  };

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 로그인 처리
  const handleLogin = async () => {
    const errors = {};
    
    if (!loginForm.email) errors.email = '이메일을 입력하세요';
    else if (!validateEmail(loginForm.email)) errors.email = '올바른 이메일 형식이 아닙니다';
    
    if (!loginForm.password) errors.password = '비밀번호를 입력하세요';
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      handleClose();
    }
  };

  // 회원가입 처리
  const handleRegister = async () => {
    const errors = {};
    
    if (!registerForm.email) errors.email = '이메일을 입력하세요';
    else if (!validateEmail(registerForm.email)) errors.email = '올바른 이메일 형식이 아닙니다';
    
    if (!registerForm.password) errors.password = '비밀번호를 입력하세요';
    else if (registerForm.password.length < 6) errors.password = '비밀번호는 6자 이상이어야 합니다';
    
    if (!registerForm.confirmPassword) errors.confirmPassword = '비밀번호 확인을 입력하세요';
    else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    if (!registerForm.nickname) errors.nickname = '닉네임을 입력하세요';
    else if (registerForm.nickname.length < 2) errors.nickname = '닉네임은 2자 이상이어야 합니다';
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    const result = await register(registerForm.email, registerForm.password, registerForm.nickname);
    if (result.success) {
      showSuccess('회원가입이 완료되었습니다. 로그인해주세요.');
      setTab(0); // 로그인 탭으로 이동
      setRegisterForm({ email: '', password: '', confirmPassword: '', nickname: '' });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="로그인" />
          <Tab label="회원가입" />
        </Tabs>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* 로그인 탭 */}
        <TabPanel value={tab} index={0}>
          <TextField
            autoFocus
            margin="dense"
            label="이메일"
            type="email"
            fullWidth
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="비밀번호"
            type="password"
            fullWidth
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
          />
        </TabPanel>
        
        {/* 회원가입 탭 */}
        <TabPanel value={tab} index={1}>
          <TextField
            autoFocus
            margin="dense"
            label="이메일"
            type="email"
            fullWidth
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="닉네임"
            fullWidth
            value={registerForm.nickname}
            onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })}
            error={!!validationErrors.nickname}
            helperText={validationErrors.nickname}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="비밀번호"
            type="password"
            fullWidth
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="비밀번호 확인"
            type="password"
            fullWidth
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
          />
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button 
          onClick={tab === 0 ? handleLogin : handleRegister}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {tab === 0 ? '로그인' : '회원가입'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AuthDialog; 