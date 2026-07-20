import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { incrementSchema } from '@/validators/listing.validator';
import { ZodError } from 'zod';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { field } = incrementSchema.parse(body);

    await prisma.listing.update({
      where: { id: params.id },
      data: {
        [field]: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    console.error('POST /api/listings/[id]/increment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to increment counter' },
      { status: 500 }
    );
  }
}
