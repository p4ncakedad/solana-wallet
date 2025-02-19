'use client';

import { useState, useEffect } from 'react';
import { getSolBalance, getTokenBalances, type TokenBalance } from '@/utils/solana';

const WALLET_ADDRESS = '75pGXf9UFNFct1vY6aGhbWVgLu55Y2WoJwjMvBvoD8ex';

export default function Home() {
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchBalances() {
    try {
      setIsLoading(true);
      const [sol, tokenBalances] = await Promise.all([
        getSolBalance(WALLET_ADDRESS),
        getTokenBalances(WALLET_ADDRESS)
      ]);
      setSolBalance(sol);
      setTokens(tokenBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBalances();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Wallet Balances</h1>
          <button 
            onClick={fetchBalances}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        <div className="p-8 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400 mb-8">Wallet Address:</div>
          <div className="font-mono text-lg break-all leading-relaxed">
            {WALLET_ADDRESS}
          </div>
        </div>

        <div className="p-8 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400 mb-8">SOL Balance:</div>
          <div className="text-3xl font-bold leading-relaxed">
            {solBalance?.toFixed(4)} SOL
          </div>
        </div>

        <div className="p-8 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400 mb-12">Token Balances:</div>
          {tokens.length === 0 ? (
            <div className="text-gray-500">No tokens found</div>
          ) : (
            <div className="space-y-12">
              {tokens.map(token => (
                <div key={token.mint} className="flex flex-col gap-4">
                  <div className="font-mono text-sm break-all leading-relaxed text-gray-400">
                    {token.mint}
                  </div>
                  <div className="font-bold text-lg leading-relaxed">
                    {token.amount.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 