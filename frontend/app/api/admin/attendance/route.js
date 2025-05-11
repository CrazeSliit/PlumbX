import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const token = cookies().get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ 
                success: false, 
                message: 'Authentication required' 
            }, { status: 401 });
        }

        // Get query parameters from the request
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const status = searchParams.get('status');
        const employeeId = searchParams.get('employeeId');
        
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (date) queryParams.append('date', date);
        if (status) queryParams.append('status', status);
        if (employeeId) queryParams.append('employeeId', employeeId);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/attendance${queryString}`, {
            method: 'GET',
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
        console.error('Error fetching attendance records:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}