'use client';

import { useState, useEffect } from 'react';
import { getSolBalance, getTokenBalances, type TokenBalance } from '@/utils/solana';

const WALLET_ADDRESS = '75pGXf9UFNFct1vY6aGhbWVgLu55Y2WoJwjMvBvoD8ex';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  const fetchBalances = async () => {
    setIsLoading(true);
    
    const [sol, tokens] = await Promise.all([
      getSolBalance(WALLET_ADDRESS),
      getTokenBalances(WALLET_ADDRESS)
    ]);
    
    setSolBalance(sol);
    setTokenBalances(tokens);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto pt-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Wallet Balance</h1>
          <button
            onClick={fetchBalances}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="mb-4 font-mono text-sm text-gray-400">
          {WALLET_ADDRESS}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">SOL Balance</h2>
            <p className="text-3xl font-bold text-blue-400">
              {solBalance.toFixed(4)} SOL
            </p>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
            {tokenBalances.length === 0 ? (
              <p className="text-gray-400">No tokens found</p>
            ) : (
              <div className="space-y-4">
                {tokenBalances.map((token) => (
                  <div
                    key={token.mint}
                    className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 flex justify-between items-center"
                  >
                    <p className="font-mono text-sm text-gray-400">
                      {token.mint}
                    </p>
                    <p className="text-lg font-bold text-blue-400 ml-4">
                      {token.amount.toFixed(3)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 