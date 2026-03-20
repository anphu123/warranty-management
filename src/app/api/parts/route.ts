import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SparePart from '@/lib/models/SparePart';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const total = await SparePart.countDocuments(query);
    const parts = await SparePart.find(query)
      .sort({ category: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ parts, total, page, limit });
  } catch (error) {
    console.error('GET parts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const part = await SparePart.create(body);
    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    console.error('POST part error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
