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

interface TokenMetadata {
  name: string;
  symbol: string;
  logo: string;
  address: string;
}

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
}

// Cache the Jupiter token list to avoid fetching it multiple times
let jupiterTokenListCache: JupiterToken[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getJupiterTokenList(): Promise<JupiterToken[]> {
  const now = Date.now();
  if (jupiterTokenListCache && (now - lastFetchTime) < CACHE_DURATION) {
    return jupiterTokenListCache;
  }

  try {
    const response = await fetch('https://token.jup.ag/strict');
    if (!response.ok) {
      throw new Error('Failed to fetch Jupiter token list');
    }

    const data = await response.json();
    jupiterTokenListCache = data.tokens;
    lastFetchTime = now;
    return jupiterTokenListCache || [];
  } catch (error) {
    console.error('Error fetching Jupiter token list:', error);
    return jupiterTokenListCache || []; // Return cached data if available, empty array if not
  }
}

export const fetchTokenMetadata = async (addresses: string[]): Promise<Record<string, TokenMetadata>> => {
  console.log('Fetching metadata for tokens:', addresses);

  try {
    const tokenList = await getJupiterTokenList();
    console.log('Got Jupiter token list with', tokenList.length, 'tokens');
    
    const metadata: Record<string, TokenMetadata> = {};
    const addressSet = new Set(addresses.map(addr => addr.toLowerCase()));

    // Create a map of token addresses to their metadata
    tokenList.forEach(token => {
      if (addressSet.has(token.address.toLowerCase())) {
        metadata[token.address.toLowerCase()] = {
          name: token.name,
          symbol: token.symbol,
          logo: token.logoURI || '',
          address: token.address
        };
        console.log('Found token metadata:', token.address, metadata[token.address.toLowerCase()]);
      }
    });

    console.log('Final metadata object:', metadata);
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
    console.log('Getting token balances for address:', address);
    const publicKey = new PublicKey(address);
    const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    console.log('Number of token accounts found:', tokens.value.length);

    // Map and log all tokens before filtering
    const allTokens = tokens.value.map(token => {
      const tokenAmount = token.account.data.parsed.info.tokenAmount;
      const amount = Number(tokenAmount.uiAmountString);
      console.log('Token found:', {
        mint: token.account.data.parsed.info.mint,
        amount,
        decimals: tokenAmount.decimals
      });
      return {
        mint: token.account.data.parsed.info.mint,
        amount,
        decimals: tokenAmount.decimals,
      };
    });

    // Filter tokens with significant balances
    const significantTokens = allTokens
      .filter(token => {
        const isSignificant = token.amount > 0.001;
        console.log(`Token ${token.mint} amount ${token.amount} is significant: ${isSignificant}`);
        return isSignificant;
      })
      .sort((a, b) => b.amount - a.amount);

    console.log('Significant tokens after filtering:', significantTokens);

    if (significantTokens.length === 0) {
      console.log('No significant token balances found');
      return [];
    }

    // Fetch metadata for all tokens
    const tokenMetadata = await fetchTokenMetadata(significantTokens.map(t => t.mint));
    console.log('Retrieved metadata:', tokenMetadata);

    // Combine balance data with metadata
    const tokensWithMetadata = significantTokens.map(token => {
      const metadata = tokenMetadata[token.mint.toLowerCase()] || null;
      console.log(`Metadata for token ${token.mint}:`, metadata);
      return {
        ...token,
        metadata
      };
    });

    console.log('Final tokens with metadata:', tokensWithMetadata);
    return tokensWithMetadata;
  } catch (error) {
    console.error('Error in getTokenBalances:', error);
    throw error;
  }
}; 