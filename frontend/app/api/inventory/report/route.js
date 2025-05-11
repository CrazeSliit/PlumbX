import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const queryParams = new URLSearchParams({
      filter: filter || 'daily'
    });

    if (start) queryParams.append('start', start);
    if (end) queryParams.append('end', end);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/report?${queryParams.toString()}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch report data');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch report data' },
      { status: 500 }
    );
  }
} 