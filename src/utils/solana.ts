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

// CoinMarketCap API configuration
const CMC_API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY;
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v2';

interface TokenMetadata {
  name: string;
  symbol: string;
  logo: string;
  address: string;
}

export const fetchTokenMetadata = async (addresses: string[]): Promise<Record<string, TokenMetadata>> => {
  if (!CMC_API_KEY) {
    console.warn('CoinMarketCap API key not found');
    return {};
  }

  try {
    const response = await fetch(`${CMC_API_URL}/cryptocurrency/info?address=${addresses.join(',')}`, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token metadata');
    }

    const data = await response.json();
    const metadata: Record<string, TokenMetadata> = {};

    // Process the response data
    Object.values(data.data).forEach((token: any) => {
      metadata[token.platform.token_address.toLowerCase()] = {
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        address: token.platform.token_address
      };
    });

    return metadata;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return {};
  }
};

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

    // Fetch metadata for all tokens
    const tokenMetadata = await fetchTokenMetadata(significantTokens.map(t => t.mint));

    // Combine balance data with metadata
    return significantTokens.map(token => ({
      ...token,
      metadata: tokenMetadata[token.mint.toLowerCase()] || null
    }));
  } catch (error) {
    throw error;
  }
}; 