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
    console.log('Raw token response:', JSON.stringify(tokens, null, 2));
    console.log('Token accounts found:', tokens.value.length); // Debug log

    // Log raw token data for debugging
    tokens.value.forEach((token, index) => {
      const info = token.account.data.parsed.info;
      console.log(`Token ${index + 1} Details:`, {
        mint: info.mint,
        rawAmount: info.tokenAmount.uiAmount,
        rawAmountString: info.tokenAmount.uiAmountString,
        decimals: info.tokenAmount.decimals,
        fullInfo: info
      });
    });

    // Only return tokens with non-zero balances
    return tokens.value
      .map((token) => {
        const info = token.account.data.parsed.info;
        return {
          mint: info.mint,
          amount: Number(info.tokenAmount.uiAmountString || 0),
          decimals: info.tokenAmount.decimals,
        };
      })
      .filter(token => token.amount > 0.001); // Only keep tokens with meaningful balances
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