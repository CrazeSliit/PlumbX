import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/alerts`;
    console.log('Fetching alerts from:', apiUrl);

    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to fetch alerts');
    }

    const result = await response.json();
    console.log('Received data:', result);
    
    // Check if the response has the expected structure
    if (result.status === 'success' && Array.isArray(result.data)) {
      return NextResponse.json(result.data);
    } else {
      console.error('Invalid response format:', result);
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
} 