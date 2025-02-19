import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Initialize Solana connection using environment variable
const baseUrl = 'https://mainnet.helius-rpc.com';
const apiKey = '2c8fd547-a255-4d11-b0a1-833ddc543ad7';
const rpcUrl = `${baseUrl}/?api-key=${apiKey}`;

// Create the connection with proper configuration
export const connection = new Connection(rpcUrl, {
  commitment: 'confirmed'
});

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

    // First, log all tokens and their amounts
    tokens.value.forEach((token) => {
      const info = token.account.data.parsed.info;
      console.log('Raw token data:', {
        mint: info.mint,
        uiAmountString: info.tokenAmount.uiAmountString,
        amount: info.tokenAmount.amount,
        decimals: info.tokenAmount.decimals
      });
    });

    // Process and filter tokens
    const processedTokens = tokens.value
      .map((token) => {
        const info = token.account.data.parsed.info;
        const amount = parseFloat(info.tokenAmount.uiAmountString || '0');
        console.log(`Processing ${info.mint}:`, { amount, isValid: !isNaN(amount) });
        return {
          mint: info.mint,
          amount,
          decimals: info.tokenAmount.decimals,
        };
      })
      .filter(token => {
        const isValid = !isNaN(token.amount) && token.amount > 0.001;
        console.log(`Filtering ${token.mint}:`, { amount: token.amount, isValid });
        return isValid;
      })
      .sort((a, b) => b.amount - a.amount);

    console.log('Final filtered tokens:', processedTokens);
    return processedTokens;
  } catch (error) {
    console.error('Error getting token balances:', error);
    throw error;
  }
}; 