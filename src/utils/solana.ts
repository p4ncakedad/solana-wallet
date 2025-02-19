import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
}

export const getSolBalance = async (address: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    throw error;
  }
};

export const getTokenBalances = async (address: string): Promise<TokenBalance[]> => {
  try {
    const publicKey = new PublicKey(address);
    const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    const balances = tokens.value
      .map(token => {
        const { amount, decimals } = token.account.data.parsed.info.tokenAmount;
        return {
          mint: token.account.data.parsed.info.mint,
          amount: Number(amount) / Math.pow(10, decimals),
          decimals
        };
      })
      .filter(token => token.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return balances;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
}; 