import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.ovex.io/api/v2/currencies?type=coin');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
} 