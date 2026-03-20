import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const claim = await WarrantyClaim.findByIdAndUpdate(
      id,
      {
        diagnosis: {
          ...body,
          diagnosedBy: body.diagnosedBy || session.user.name,
        },
        status: 'processing',
      },
      { new: true, runValidators: true }
    );

    if (!claim) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Diagnosis update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
