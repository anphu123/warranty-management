import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ['reception', 'overdue', 'pending_approval', 'processing', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const claim = await WarrantyClaim.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!claim) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
