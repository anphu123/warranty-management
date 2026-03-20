import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Don't allow password update through this route
    delete body.password;

    const user = await User.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Đã vô hiệu hóa người dùng' });
  } catch (error) {
    console.error('DELETE user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
