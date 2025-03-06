import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.ovex.io/api/v2/markets');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch markets: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter markets where rfq_enabled is true
    const rfqEnabledMarkets = data.filter((market: any) => market.rfq_enabled);
    
    return NextResponse.json(rfqEnabledMarkets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
} 