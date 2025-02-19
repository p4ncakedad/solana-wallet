'use client';

import { useState, useEffect } from 'react';
import { getSolBalance, getTokenBalances, type TokenBalance } from '@/utils/solana';

const WALLET_ADDRESS = '75pGXf9UFNFct1vY6aGhbWVgLu55Y2WoJwjMvBvoD8ex';

export default function Home() {
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);

  async function fetchBalances() {
    const [sol, tokenBalances] = await Promise.all([
      getSolBalance(WALLET_ADDRESS),
      getTokenBalances(WALLET_ADDRESS)
    ]);
    setSolBalance(sol);
    setTokens(tokenBalances);
  }

  useEffect(() => {
    fetchBalances();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-12 font-mono">
        <div>
          <div className="text-gray-400">Wallet Address:</div>
          <div className="mt-4 break-all">
            {WALLET_ADDRESS}
          </div>
        </div>

        <div>
          <div className="text-gray-400">SOL Balance:</div>
          <div className="mt-4">
            {solBalance.toFixed(4)} SOL
          </div>
        </div>

        <div>
          <div className="text-gray-400">Token Balances:</div>
          <div className="mt-4 space-y-8">
            {tokens.map(token => (
              <div key={token.mint}>
                <div className="break-all">
                  {token.mint}
                </div>
                <div className="mt-2">
                  {token.amount.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 