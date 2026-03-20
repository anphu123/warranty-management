import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';
import Notification from '@/lib/models/Notification';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'warranty_staff' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
  }

  const { id } = await params;
  const { repairNote, resultImages } = await req.json();

  await connectDB();
  const claim = await WarrantyClaim.findById(id);
  if (!claim) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  if (claim.status !== 'processing') {
    return NextResponse.json({ error: 'Hồ sơ chưa được duyệt để xử lý' }, { status: 400 });
  }

  const now = new Date();
  claim.processing = {
    startedAt: claim.processing?.startedAt || now,
    completedAt: now,
    repairNote,
    resultImages: resultImages || [],
  };
  claim.status = 'completed';
  await claim.save();

  // Thông báo cho Staff 1
  await Notification.create({
    userId: claim.createdBy,
    type: 'claim_completed',
    title: `Bảo hành ${claim.claimCode} hoàn thành`,
    message: `${session.user.name} đã hoàn thành sửa chữa máy ${claim.device.brand} ${claim.device.model}.${repairNote ? ' ' + repairNote : ''}`,
    claimId: claim._id,
    claimCode: claim.claimCode,
  });

  return NextResponse.json(claim);
}
