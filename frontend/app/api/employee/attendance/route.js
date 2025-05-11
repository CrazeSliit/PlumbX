import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        let endpoint = '/api/employee/attendance';
        if (id) endpoint += `/${id}`;
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend API error: ${response.status} - ${errorText}`);
            return NextResponse.json(
                { success: false, message: `Error from backend: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        // Validate required fields
        if (!body.date || !body.status) {
            return NextResponse.json(
                { success: false, message: 'Date and status are required' },
                { status: 400 }
            );
        }

        const requestData = {
            date: body.date,
            status: body.status,
            notes: body.reason || '' // Map 'reason' from frontend to 'notes' for backend
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/attendance`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend API error: ${response.status} - ${errorText}`);
            try {
                const errorData = JSON.parse(errorText);
                return NextResponse.json(
                    { success: false, message: errorData.message || `Error from backend: ${response.status}` },
                    { status: response.status }
                );
            } catch (parseError) {
                return NextResponse.json(
                    { success: false, message: errorText || `Error from backend: ${response.status}` },
                    { status: response.status }
                );
            }
        }
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating attendance record:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        if (!body.id) {
            return NextResponse.json(
                { success: false, message: 'Attendance ID is required' },
                { status: 400 }
            );
        }

        const requestData = {
            date: body.date,
            status: body.status,
            notes: body.reason || '' // Map 'reason' from frontend to 'notes' for backend
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/attendance/${body.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend API error: ${response.status} - ${errorText}`);
            return NextResponse.json(
                { success: false, message: `Error from backend: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error updating attendance record:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const token = cookies().get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Attendance ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employee/attendance/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend API error: ${response.status} - ${errorText}`);
            return NextResponse.json(
                { success: false, message: `Error from backend: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}