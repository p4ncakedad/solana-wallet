import { useState } from 'react';
import { getSolBalance, getTokenBalances } from '@/utils/solana';

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
}

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
    setIsLoading(true);
    setError(null);
    try {
      const [solBalance, tokenBalances] = await Promise.all([
        getSolBalance(walletAddress),
        getTokenBalances(walletAddress),
      ]);
      
      setBalances({
        solBalance,
        tokenBalances,
      });
    } catch (err) {
      setError('Error fetching wallet balances. Please check the address and try again.');
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