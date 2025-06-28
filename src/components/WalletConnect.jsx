import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';

function WalletConnect({ open, onClose }) {
  const { wallet, connecting, connectWallet, disconnectWallet, getNetworkInfo } = useWallet();
  const { isLoggedIn } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const networkInfo = getNetworkInfo();

  const handleConnect = async () => {
    await connectWallet();
    if (!connecting) {
      // 연결 성공 시 5초 후 자동 닫기
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onClose();
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WalletIcon />
          <Typography variant="h6">지갑 연결</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!isLoggedIn && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            지갑을 연결하려면 먼저 로그인이 필요합니다.
          </Alert>
        )}

        {!wallet.isMetaMaskInstalled ? (
          <Box textAlign="center" py={3}>
            <WarningIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              MetaMask가 설치되지 않았습니다
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              NFT 배지를 받으려면 MetaMask 지갑이 필요합니다.
            </Typography>
            <Button
              variant="contained"
              color="warning"
              startIcon={<WalletIcon />}
              onClick={handleInstallMetaMask}
              size="large"
            >
              MetaMask 설치하기
            </Button>
          </Box>
        ) : wallet.isConnected ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              지갑이 연결되었습니다! 이제 NFT 배지를 받을 수 있습니다.
            </Alert>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  지갑 주소
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </Typography>
              </Box>

              {wallet.balance && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    잔액
                  </Typography>
                  <Typography variant="body1">
                    {wallet.balance} {networkInfo.symbol}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  네트워크
                </Typography>
                <Chip 
                  label={networkInfo.name} 
                  size="small" 
                  color={wallet.chainId === 80002 ? "success" : "default"}
                />
              </Box>

              {wallet.chainId !== 80002 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    💡 <strong>권장:</strong> Polygon Amoy 테스트넷으로 전환하시면 
                    더 빠르고 저렴한 NFT 발행이 가능합니다.
                  </Typography>
                </Alert>
              )}

              <Button
                variant="text"
                size="small"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? '간단히 보기' : '자세히 보기'}
              </Button>

              {showDetails && (
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    지갑 정보
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    전체 주소: {wallet.address}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Chain ID: {wallet.chainId}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        ) : (
          <Box textAlign="center" py={2}>
            <WalletIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              MetaMask 지갑 연결
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              NFT 배지를 받고 블록체인에 영구 저장하려면 지갑 연결이 필요합니다.
            </Typography>
            
            <Stack spacing={2} alignItems="center">
              <Chip 
                icon={<LinkIcon />}
                label="안전한 연결"
                color="success"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                개인키는 절대 서버에 전송되지 않습니다
              </Typography>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          닫기
        </Button>
        
        {wallet.isMetaMaskInstalled && (
          <>
            {wallet.isConnected ? (
              <Button
                onClick={handleDisconnect}
                color="error"
                startIcon={<LinkOffIcon />}
              >
                연결 해제
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                variant="contained"
                disabled={!isLoggedIn || connecting}
                startIcon={connecting ? <CircularProgress size={20} /> : <LinkIcon />}
              >
                {connecting ? '연결 중...' : '지갑 연결'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default WalletConnect;