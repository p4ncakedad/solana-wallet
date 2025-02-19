import { useState } from 'react';
import { getSolBalance, getTokenBalances, type TokenBalance } from '@/utils/solana';

interface WalletBalance {
  solBalance: number;
  tokenBalances: TokenBalance[];
}

export const useWalletBalance = () => {
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalance | null>(null);

  const fetchBalances = async (walletAddress: string) => {
    console.log('Starting balance fetch for:', walletAddress);
    setIsLoading(true);
    setError(null);
    setBalances(null);

    if (!walletAddress || walletAddress.trim() === '') {
      setError('Please enter a valid Solana wallet address');
      setIsLoading(false);
      return;
    }

    try {
      if (!walletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        throw new Error('Invalid Solana address format');
      }

      console.log('Fetching SOL and token balances...');
      const [solBalance, tokenBalances] = await Promise.all([
        getSolBalance(walletAddress),
        getTokenBalances(walletAddress),
      ]);
      
      console.log('Balances received:', { solBalance, tokenBalances });
      
      setBalances({
        solBalance,
        tokenBalances,
      });
    } catch (err) {
      console.error('Error in useWalletBalance:', err);
      if (err instanceof Error) {
        if (err.message.includes('Invalid public key input')) {
          setError('Invalid wallet address. Please check the address and try again.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Error fetching wallet balances. Please check the address and try again.');
      }
      setBalances(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    address,
    setAddress,
    isLoading,
    error,
    balances,
    fetchBalances,
  };
};