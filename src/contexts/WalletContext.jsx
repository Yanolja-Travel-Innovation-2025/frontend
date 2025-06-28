import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import api from '../api/axios';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const { user, isLoggedIn, updateUser } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [wallet, setWallet] = useState({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    isMetaMaskInstalled: false
  });
  const [connecting, setConnecting] = useState(false);

  // MetaMask 설치 여부 확인
  useEffect(() => {
    const checkMetaMask = () => {
      const isInstalled = typeof window !== 'undefined' && 
                         typeof window.ethereum !== 'undefined' && 
                         window.ethereum.isMetaMask;
      
      setWallet(prev => ({
        ...prev,
        isMetaMaskInstalled: isInstalled
      }));

      if (isInstalled) {
        // 계정 변경 감지
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        // 네트워크 변경 감지
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    };

    checkMetaMask();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // 사용자 로그인 시 지갑 주소 확인
  useEffect(() => {
    if (isLoggedIn && user?.walletAddress) {
      checkWalletConnection();
    }
  }, [isLoggedIn, user?.walletAddress]);

  // 계정 변경 핸들러
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setWallet(prev => ({
        ...prev,
        address: accounts[0]
      }));
      
      // 서버의 지갑 주소와 다르면 업데이트
      if (user?.walletAddress !== accounts[0]) {
        updateWalletAddress(accounts[0]);
      }
    }
  };

  // 네트워크 변경 핸들러
  const handleChainChanged = (chainId) => {
    setWallet(prev => ({
      ...prev,
      chainId: parseInt(chainId, 16)
    }));
    
    // 잔액 다시 조회
    getBalance();
  };

  // 지갑 연결 상태 확인
  const checkWalletConnection = async () => {
    if (!wallet.isMetaMaskInstalled) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        setWallet(prev => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
          chainId: parseInt(chainId, 16)
        }));
        
        await getBalance();
      }
    } catch (error) {
      console.error('지갑 연결 상태 확인 실패:', error);
    }
  };

  // MetaMask 연결
  const connectWallet = async () => {
    if (!wallet.isMetaMaskInstalled) {
      showError('MetaMask가 설치되지 않았습니다. 설치 후 다시 시도해주세요.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    if (!isLoggedIn) {
      showWarning('먼저 로그인을 해주세요.');
      return;
    }

    setConnecting(true);

    try {
      // 계정 연결 요청
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('MetaMask에서 계정을 찾을 수 없습니다.');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // 지갑 상태 업데이트
      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address,
        chainId: parseInt(chainId, 16)
      }));

      // 서버에 지갑 주소 저장
      await updateWalletAddress(address);
      
      // 잔액 조회
      await getBalance();

      showSuccess(`지갑이 연결되었습니다!\n주소: ${address.slice(0, 6)}...${address.slice(-4)}`);

    } catch (error) {
      console.error('지갑 연결 실패:', error);
      
      if (error.code === 4001) {
        showWarning('지갑 연결이 거부되었습니다.');
      } else {
        showError('지갑 연결에 실패했습니다: ' + error.message);
      }
    } finally {
      setConnecting(false);
    }
  };

  // 지갑 연결 해제
  const disconnectWallet = async () => {
    try {
      // 서버에서 지갑 주소 제거
      await updateWalletAddress(null);
      
      handleDisconnect();
      showSuccess('지갑 연결이 해제되었습니다.');
    } catch (error) {
      console.error('지갑 연결 해제 실패:', error);
      showError('지갑 연결 해제에 실패했습니다.');
    }
  };

  // 로컬 지갑 상태 초기화
  const handleDisconnect = () => {
    setWallet(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      chainId: null,
      balance: null
    }));
  };

  // 서버에 지갑 주소 업데이트
  const updateWalletAddress = async (address) => {
    try {
      const response = await api.patch('/auth/wallet', { walletAddress: address });
      
      // 로컬 사용자 정보 업데이트
      updateUser({ ...user, walletAddress: address });
      
      return response.data;
    } catch (error) {
      console.error('지갑 주소 업데이트 실패:', error);
      throw error;
    }
  };

  // 잔액 조회
  const getBalance = async () => {
    if (!wallet.address) return;

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [wallet.address, 'latest']
      });

      // wei를 ETH로 변환
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      
      setWallet(prev => ({
        ...prev,
        balance: ethBalance.toFixed(4)
      }));
    } catch (error) {
      console.error('잔액 조회 실패:', error);
    }
  };

  // 네트워크 전환
  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('네트워크 전환 실패:', error);
      
      if (error.code === 4902) {
        showError('해당 네트워크가 MetaMask에 추가되지 않았습니다.');
      } else {
        showError('네트워크 전환에 실패했습니다.');
      }
    }
  };

  // 트랜잭션 전송
  const sendTransaction = async (transaction) => {
    if (!wallet.isConnected) {
      throw new Error('지갑이 연결되지 않았습니다.');
    }

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      return txHash;
    } catch (error) {
      console.error('트랜잭션 전송 실패:', error);
      throw error;
    }
  };

  // 네트워크 정보 조회
  const getNetworkInfo = () => {
    const networks = {
      1: { name: 'Ethereum Mainnet', symbol: 'ETH' },
      5: { name: 'Goerli Testnet', symbol: 'ETH' },
      11155111: { name: 'Sepolia Testnet', symbol: 'ETH' },
      137: { name: 'Polygon Mainnet', symbol: 'MATIC' },
      80002: { name: 'Polygon Amoy Testnet', symbol: 'MATIC' },
      1337: { name: 'Localhost', symbol: 'ETH' }
    };

    return networks[wallet.chainId] || { name: 'Unknown Network', symbol: 'ETH' };
  };

  const value = {
    wallet,
    connecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
    getBalance,
    getNetworkInfo
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}