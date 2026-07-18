import { NextRequest, NextResponse } from 'next/server';
import { decode } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!token) {
      return NextResponse.json({});
    }

    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!decoded || !decoded.id) {
      return NextResponse.json({});
    }

    return NextResponse.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch {
    return NextResponse.json({});
  }
}
