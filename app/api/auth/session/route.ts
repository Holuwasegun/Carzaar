import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtSecret } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'No active session' });
    }

    const { payload } = await jwtVerify(token, jwtSecret);

    if (!payload || !payload.id) {
      return NextResponse.json({ success: false, error: 'No active session' });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'No active session' });
  }
}
