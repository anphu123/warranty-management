import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SparePart from '@/lib/models/SparePart';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const part = await SparePart.findById(id).lean();
    if (!part) {
      return NextResponse.json({ error: 'Không tìm thấy linh kiện' }, { status: 404 });
    }
    return NextResponse.json(part);
  } catch (error) {
    console.error('GET part error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const part = await SparePart.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!part) {
      return NextResponse.json({ error: 'Không tìm thấy linh kiện' }, { status: 404 });
    }
    return NextResponse.json(part);
  } catch (error) {
    console.error('PUT part error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const part = await SparePart.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!part) {
      return NextResponse.json({ error: 'Không tìm thấy linh kiện' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Đã xóa linh kiện thành công' });
  } catch (error) {
    console.error('DELETE part error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
