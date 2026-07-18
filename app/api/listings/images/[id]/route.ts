import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalImageUrl } from '@/lib/r2-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.listingImage.findUnique({
      where: { id: params.id },
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    const imageUrl = getLocalImageUrl(image.r2Key);

    return NextResponse.redirect(new URL(imageUrl, _request.url));
  } catch (error) {
    console.error('GET /api/listings/images/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get image' },
      { status: 500 }
    );
  }
}
