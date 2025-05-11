import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to add employee');
    }

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to add employee' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = await response.json();
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch employees' },
      { status: 500 }
    );
  }
} 