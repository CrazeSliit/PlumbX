import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const token = cookies().get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/leave`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data: data.data });
    } catch (error) {
        console.error('Error in leave requests API:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const token = cookies().get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, status, comments } = body;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/leave/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, comments })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data: data.data });
    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
} 