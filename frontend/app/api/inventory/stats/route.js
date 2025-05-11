import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/stats`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch inventory stats');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch inventory stats' },
      { status: 500 }
    );
  }
}
