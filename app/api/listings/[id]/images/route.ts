import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { uploadToR2 } from '@/lib/r2-client';
import { validateImageFile } from '@/domain/listing-utils';
import { APP_CONFIG } from '@/config/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.images.length >= APP_CONFIG.maxImagesPerListing) {
      return NextResponse.json(
        { success: false, error: 'Maximum 8 images per listing' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    const uploadedImages: Array<{ id: string; listingId: string; r2Key: string; sortOrder: number; createdAt: Date }> = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        continue;
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || 'jpg';
      const key = `listings/${params.id}/${timestamp}-${random}.${extension}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      await uploadToR2(key, buffer, file.type);

      const image = await prisma.listingImage.create({
        data: {
          listingId: params.id,
          r2Key: key,
          sortOrder: listing.images.length + uploadedImages.length,
        },
      });

      uploadedImages.push(image);
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid images uploaded. Only JPG, PNG, WebP under 5MB allowed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: uploadedImages });
  } catch (error) {
    console.error('POST /api/listings/[id]/images error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Image ID required' },
        { status: 400 }
      );
    }

    const image = await prisma.listingImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.listingId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    const { deleteFromR2 } = await import('@/lib/r2-client');
    await deleteFromR2(image.r2Key);

    await prisma.listingImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/listings/[id]/images error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
