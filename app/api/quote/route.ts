import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const market = searchParams.get('market');
  const fromAmount = searchParams.get('from_amount');
  const side = searchParams.get('side');
  
  if (!market || !fromAmount || !side) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }
  
  try {
    const apiUrl = `https://www.ovex.io/api/v2/rfq/get_quote?market=${market}&from_amount=${fromAmount}&side=${side}&prefunded=0`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.status} ${response.statusText}`);
    }
    
    const quoteData = await response.json();
    
    return NextResponse.json(quoteData);
  } catch (error) {
    console.error('Error getting quote:', error);
    return NextResponse.json(
      { error: 'Failed to get quote' },
      { status: 500 }
    );
  }
} 