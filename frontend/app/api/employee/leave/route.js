import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/leave`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return NextResponse.json({ success: false, message: 'Error fetching leave requests' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/leave`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error submitting leave request:', error);
        return NextResponse.json({ success: false, message: 'Error submitting leave request' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leaveId = searchParams.get('id');

        if (!leaveId) {
            return NextResponse.json({ success: false, message: 'Leave ID is required' }, { status: 400 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/leave/${leaveId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error deleting leave request:', error);
        return NextResponse.json({ success: false, message: 'Error deleting leave request' }, { status: 500 });
    }
} 