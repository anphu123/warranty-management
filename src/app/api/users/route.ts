import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const user = await User.create(body);
    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = userObj;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('POST user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
