import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Initialize Solana connection using environment variable
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
console.log('Using RPC URL:', rpcUrl); // Debug log

// Create the connection with proper configuration
export const connection = new Connection(rpcUrl, {
  commitment: 'confirmed'
});

export const getSolBalance = async (address: string): Promise<number> => {
  try {
    console.log('Fetching balance for address:', address); // Debug log
    const publicKey = new PublicKey(address);
    console.log('Public key created:', publicKey.toBase58()); // Debug log
    
    const balance = await connection.getBalance(publicKey);
    console.log('Raw balance received:', balance); // Debug log
    const solBalance = balance / LAMPORTS_PER_SOL;
    console.log('Converted SOL balance:', solBalance); // Debug log
    
    return solBalance;
  } catch (error) {
    console.error('Detailed error getting SOL balance:', {
      error,
      address,
      rpcUrl,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const getTokenBalances = async (address: string) => {
  try {
    console.log('Fetching token balances for address:', address); // Debug log
    const publicKey = new PublicKey(address);
    
    const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    console.log('Token accounts found:', tokens.value.length); // Debug log

    // Log raw token data for debugging
    tokens.value.forEach((token, index) => {
      console.log(`Token ${index + 1}:`, {
        mint: token.account.data.parsed.info.mint,
        rawAmount: token.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: token.account.data.parsed.info.tokenAmount.decimals,
      });
    });

    const significantTokens = tokens.value
      .map((token) => {
        const amount = Number(token.account.data.parsed.info.tokenAmount.uiAmount || 0);
        console.log(`Processed amount for ${token.account.data.parsed.info.mint}:`, amount);
        return {
          mint: token.account.data.parsed.info.mint,
          amount,
          decimals: token.account.data.parsed.info.tokenAmount.decimals,
        };
      })
      .filter(token => {
        const isSignificant = token.amount > 0;
        console.log(`Token ${token.mint} amount ${token.amount} is significant: ${isSignificant}`);
        return isSignificant;
      });

    console.log('Final tokens with non-zero balance:', significantTokens);
    return significantTokens;
  } catch (error) {
    console.error('Detailed error getting token balances:', {
      error,
      address,
      rpcUrl,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}; 