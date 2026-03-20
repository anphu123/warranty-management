import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const claim = await WarrantyClaim.findById(id).lean();
    if (!claim) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }
    return NextResponse.json(claim);
  } catch (error) {
    console.error('GET claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const claim = await WarrantyClaim.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!claim) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }
    return NextResponse.json(claim);
  } catch (error) {
    console.error('PUT claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const claim = await WarrantyClaim.findByIdAndDelete(id);
    if (!claim) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Đã xóa hồ sơ thành công' });
  } catch (error) {
    console.error('DELETE claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
