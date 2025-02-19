import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Initialize Solana connection (using devnet for development)
export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const getSolBalance = async (address: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    throw error;
  }
};

export const getTokenBalances = async (address: string) => {
  try {
    const publicKey = new PublicKey(address);
    const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    return tokens.value.map((token) => ({
      mint: token.account.data.parsed.info.mint,
      amount: token.account.data.parsed.info.tokenAmount.uiAmount,
      decimals: token.account.data.parsed.info.tokenAmount.decimals,
    }));
  } catch (error) {
    console.error('Error getting token balances:', error);
    throw error;
  }
}; 