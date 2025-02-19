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

// Helper function to chunk array into smaller pieces
const chunkArray = (array: string[], size: number): string[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const fetchTokenMetadata = async (addresses: string[]): Promise<Record<string, TokenMetadata>> => {
  console.log('Fetching metadata for tokens:', addresses);
  console.log('Using CMC API Key:', CMC_API_KEY ? 'Present' : 'Missing');

  if (!CMC_API_KEY || addresses.length === 0) {
    console.warn('CoinMarketCap API key not found or no addresses provided');
    return {};
  }

  try {
    // Split addresses into chunks of 10 to avoid URL length limits
    const addressChunks = chunkArray(addresses, 10);
    const allMetadata: Record<string, TokenMetadata> = {};

    for (const chunk of addressChunks) {
      const apiUrl = `https://cors-proxy.fringe.zone/https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?address=${chunk.join(',')}`;
      console.log('Calling CoinMarketCap API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          'Accept': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        continue; // Skip this chunk if there's an error, but continue with others
      }

      const data = await response.json();
      console.log('API Response data:', JSON.stringify(data, null, 2));

      // Process the response data
      Object.values(data.data || {}).forEach((token: any) => {
        if (token.platform?.token_address) {
          const address = token.platform.token_address.toLowerCase();
          allMetadata[address] = {
            name: token.name,
            symbol: token.symbol,
            logo: token.logo,
            address: token.platform.token_address
          };
          console.log('Processed token metadata:', address, allMetadata[address]);
        }
      });
    }

    console.log('Final metadata object:', allMetadata);
    return allMetadata;
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

    console.log('Raw token accounts:', tokens.value);

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
      .filter(token => token.amount > 0.001);

    console.log('Significant tokens:', significantTokens);

    // Fetch metadata for all tokens
    const tokenMetadata = await fetchTokenMetadata(significantTokens.map(t => t.mint));
    console.log('Retrieved metadata:', tokenMetadata);

    // Combine balance data with metadata
    const tokensWithMetadata = significantTokens.map(token => ({
      ...token,
      metadata: tokenMetadata[token.mint.toLowerCase()] || null
    }));

    console.log('Final tokens with metadata:', tokensWithMetadata);
    return tokensWithMetadata;
  } catch (error) {
    console.error('Error in getTokenBalances:', error);
    throw error;
  }
}; 