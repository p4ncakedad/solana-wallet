import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Initialize Solana connection using environment variable
const baseUrl = 'https://mainnet.helius-rpc.com';
const apiKey = '2c8fd547-a255-4d11-b0a1-833ddc543ad7';
const rpcUrl = `${baseUrl}/?api-key=${apiKey}`;

// Create the connection with proper configuration
const connection = new Connection(rpcUrl, {
  commitment: 'confirmed'
});

export const getSolBalance = async (address: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    throw error;
  }
};

export const getTokenBalances = async (address: string) => {
  try {
    const publicKey = new PublicKey(address);
    const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Filter tokens with significant balances
    const significantTokens = tokens.value
      .map(token => {
        const tokenAmount = token.account.data.parsed.info.tokenAmount;
        return {
          mint: token.account.data.parsed.info.mint,
          amount: Number(tokenAmount.uiAmountString),
          decimals: tokenAmount.decimals,
        };
      })
      .filter(token => token.amount > 0.001) // Strict filtering for balances > 0.001
      .sort((a, b) => b.amount - a.amount); // Sort by highest balance first

    return significantTokens;
  } catch (error) {
    throw error;
  }
}; 