import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { documents, completion } = body;

    const claim = await WarrantyClaim.findByIdAndUpdate(
      id,
      {
        completion: {
          ...completion,
          returnedAt: new Date(),
        },
        ...(documents && { documents }),
        status: 'completed',
      },
      { new: true, runValidators: true }
    );

    if (!claim) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Complete claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
