import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { timeRange } = body;

    console.log('Forecast request received with timeRange:', timeRange);

    if (!timeRange) {
      return NextResponse.json(
        { error: 'Time range is required' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/forecast`;
    console.log('Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timeRange }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch forecast data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Received forecast data:', JSON.stringify(data, null, 2));

    if (!data || !data.data) {
      return NextResponse.json(
        { error: 'Invalid response format from server' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch forecast data' },
      { status: 500 }
    );
  }
} 