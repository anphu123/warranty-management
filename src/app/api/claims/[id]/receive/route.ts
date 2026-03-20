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
  const { conditionReport, conditionImages, isEligible, ineligibleReason } = await req.json();

  await connectDB();
  const claim = await WarrantyClaim.findById(id);
  if (!claim) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  if (claim.status !== 'active') {
    return NextResponse.json({ error: 'Hồ sơ không ở trạng thái có thể tiếp nhận' }, { status: 400 });
  }

  // Kiểm tra hạn bảo hành
  const now = new Date();
  if (claim.warrantyExpiry < now) {
    claim.status = 'expired';
    await claim.save();
    return NextResponse.json({ error: 'Bảo hành đã hết hạn', status: 'expired' }, { status: 400 });
  }

  claim.reception = {
    receivedAt: now,
    receivedBy: session.user.id as unknown as import('mongoose').Types.ObjectId,
    receivedByName: session.user.name || '',
    conditionReport,
    conditionImages: conditionImages || [],
    isEligible,
    ineligibleReason: isEligible ? undefined : ineligibleReason,
  };
  claim.approval = { status: 'pending' };
  claim.status = 'pending_approval';
  await claim.save();

  // Tạo thông báo cho Staff 1 (người tạo bảo hành)
  await Notification.create({
    userId: claim.createdBy,
    type: 'reception_submitted',
    title: `Yêu cầu duyệt bảo hành ${claim.claimCode}`,
    message: isEligible
      ? `${session.user.name} đã tiếp nhận máy ${claim.device.brand} ${claim.device.model} (IMEI: ${claim.device.imei}). Máy đủ điều kiện bảo hành, chờ bạn phê duyệt.`
      : `${session.user.name} đã tiếp nhận máy ${claim.device.brand} ${claim.device.model} (IMEI: ${claim.device.imei}). Máy KHÔNG đủ điều kiện: ${ineligibleReason}. Chờ bạn xem xét.`,
    claimId: claim._id,
    claimCode: claim.claimCode,
  });

  return NextResponse.json(claim);
}
