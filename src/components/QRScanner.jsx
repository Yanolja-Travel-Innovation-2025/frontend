import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import QrScanner from 'qr-scanner';

function QRScanner({ open, onClose, onScan, expectedQRCode }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (open && videoRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    try {
      setError(null);
      setScanning(true);
      
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR 코드 감지:', result.data);
          handleScanResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      scannerRef.current = scanner;
      await scanner.start();
    } catch (err) {
      console.error('QR 스캐너 시작 실패:', err);
      setError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanResult = (qrData) => {
    if (expectedQRCode && qrData !== expectedQRCode) {
      setError(`잘못된 QR 코드입니다. 예상: ${expectedQRCode}, 스캔: ${qrData}`);
      return;
    }
    
    stopScanner();
    onScan(qrData);
    onClose();
  };

  const handleClose = () => {
    stopScanner();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>QR 코드 스캔</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 2 
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '300px',
              border: '2px solid #ccc',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
          
          {scanning && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">
                QR 코드를 카메라에 맞춰주세요...
              </Typography>
            </Box>
          )}
          
          {expectedQRCode && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              예상 QR 코드: {expectedQRCode}
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={startScanner} disabled={scanning}>
          {scanning ? '스캔 중...' : '다시 스캔'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QRScanner; 