import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';

function genCode() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `RB-${yy}${mm}${dd}-${rand}`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 20);

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (session.user.role === 'seller') filter.createdBy = session.user.id;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { claimCode: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'device.imei': { $regex: search, $options: 'i' } },
    ];
  }

  const total = await WarrantyClaim.countDocuments(filter);
  const claims = await WarrantyClaim.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ claims, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'seller' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Chỉ Seller mới được tạo bảo hành' }, { status: 403 });
  }

  const body = await req.json();
  const { customer, device, warrantyMonths, initialCondition, initialImages, notes } = body;

  if (!customer?.name || !customer?.phone || !device?.imei || !device?.brand || !device?.model) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  await connectDB();

  const warrantyStartDate = new Date(device.purchaseDate || Date.now());
  const warrantyExpiry = new Date(warrantyStartDate);
  warrantyExpiry.setMonth(warrantyExpiry.getMonth() + (warrantyMonths || 12));

  const claim = await WarrantyClaim.create({
    claimCode: genCode(),
    status: 'active',
    customer,
    device: { ...device, purchaseDate: warrantyStartDate },
    warrantyMonths: warrantyMonths || 12,
    warrantyStartDate,
    warrantyExpiry,
    initialCondition: initialCondition || 'Máy mới, chưa có hư hỏng',
    initialImages: initialImages || [],
    createdBy: session.user.id,
    createdByName: session.user.name ?? '',
    createdByEmail: session.user.email ?? '',
    notes,
  });

  return NextResponse.json(claim, { status: 201 });
}
