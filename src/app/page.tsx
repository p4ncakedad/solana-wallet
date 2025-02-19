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

  const handleRefresh = () => {
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
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="w-full flex-1">
            <input
              type="text"
              placeholder="Enter Solana wallet address"
              value={address}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => address.trim() && fetchBalances(address.trim())}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Check Balance'}
            </button>
            {balances && (
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh Balance"
              >
                <RefreshIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg mb-6">
            {error}
          </div>
        )}

        {balances && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">SOL Balance</h2>
                <p className="text-3xl font-bold text-blue-400">
                  {balances.solBalance.toFixed(4)} SOL
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Active Token Balances</h2>
              {balances.tokenBalances.length === 0 ? (
                <p className="text-gray-400">No active tokens found (minimum balance: 0.001)</p>
              ) : (
                <div className="space-y-4">
                  {balances.tokenBalances.map((token) => (
                    <div
                      key={token.mint}
                      className="p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                    >
                      <p className="text-sm text-gray-400 mb-1">
                        Token: {token.mint}
                      </p>
                      <p className="text-lg font-semibold">
                        {token.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
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

const RefreshIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
    />
  </svg>
); 