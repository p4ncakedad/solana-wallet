import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const addresses = searchParams.get('addresses');

    if (!addresses) {
      return NextResponse.json(
        { error: 'No addresses provided' },
        { status: 400 }
      );
    }

    const CMC_API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY;
    
    if (!CMC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?aux=logo,symbol,name&skip_invalid=true&platform=solana&address=${addresses}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300'
      }
    });
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token metadata' },
      { status: 500 }
    );
  }
} 