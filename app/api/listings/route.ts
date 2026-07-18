import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { listingSchema } from '@/validators/listing.validator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'available';
    const make = searchParams.get('make');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    const bodyType = searchParams.get('bodyType');
    const transmission = searchParams.get('transmission');
    const fuel = searchParams.get('fuel');
    const color = searchParams.get('color');
    const condition = searchParams.get('condition');

    const where: Record<string, unknown> = {};

    if (status === 'available') {
      where.status = 'available';
    } else if (status !== 'all') {
      where.status = status;
    }

    if (make) where.make = make;
    if (bodyType) where.bodyType = bodyType;
    if (transmission) where.transmission = transmission;
    if (fuel) where.fuel = fuel;
    if (color) where.color = color;
    if (condition) where.condition = condition;

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) (where.year as Record<string, number>).gte = parseInt(minYear);
      if (maxYear) (where.year as Record<string, number>).lte = parseInt(maxYear);
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice);
    }

    const listings = await prisma.listing.findMany({
      where,
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('GET /api/listings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = listingSchema.parse(body);

    const listing = await prisma.listing.create({
      data: validated,
    });

    return NextResponse.json({ success: true, data: listing }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    console.error('POST /api/listings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
