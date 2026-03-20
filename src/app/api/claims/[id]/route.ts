import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const claim = await WarrantyClaim.findById(id).lean();
  if (!claim) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  return NextResponse.json(claim);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const claim = await WarrantyClaim.findByIdAndUpdate(id, body, { new: true });
  if (!claim) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  return NextResponse.json(claim);
}
