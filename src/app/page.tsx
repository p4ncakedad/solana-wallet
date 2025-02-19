'use client';

import type { FormEvent, ChangeEvent } from 'react';
import { useWalletBalance } from '@/hooks/useWalletBalance';

export default function Home() {
  const {
    address,
    setAddress,
    isLoading,
    error,
    balances,
    fetchBalances,
  } = useWalletBalance();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (address.trim()) {
      fetchBalances(address.trim());
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          Solana Wallet Balance Checker
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Solana wallet address"
              value={address}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Check Balance'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg mb-6">
            {error}
          </div>
        )}

        {balances && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">SOL Balance</h2>
              <p className="text-3xl font-bold text-blue-400">
                {balances.solBalance.toFixed(4)} SOL
              </p>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
              {balances.tokenBalances.length === 0 ? (
                <p className="text-gray-400">No significant token balances found (minimum 0.0001)</p>
              ) : (
                <div className="space-y-4">
                  {balances.tokenBalances.map((token) => (
                    <div
                      key={token.mint}
                      className="p-4 bg-gray-700/50 rounded-lg"
                    >
                      <p className="text-sm text-gray-400 mb-1">
                        Token: {token.mint}
                      </p>
                      <p className="text-lg font-semibold">
                        {token.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 8
                        })} tokens
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 