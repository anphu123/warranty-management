import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';
import Notification from '@/lib/models/Notification';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action, note } = await req.json(); // action: 'approve' | 'reject'

  await connectDB();
  const claim = await WarrantyClaim.findById(id);
  if (!claim) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });

  if (claim.status !== 'pending_approval') {
    return NextResponse.json({ error: 'Hồ sơ không ở trạng thái chờ duyệt' }, { status: 400 });
  }

  // Chỉ người tạo bảo hành hoặc admin mới được duyệt
  if (claim.createdBy.toString() !== session.user.id && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Không có quyền phê duyệt' }, { status: 403 });
  }

  const now = new Date();
  claim.approval = {
    status: action === 'approve' ? 'approved' : 'rejected',
    decidedBy: session.user.id as unknown as import('mongoose').Types.ObjectId,
    decidedAt: now,
    note,
  };
  claim.status = action === 'approve' ? 'processing' : 'rejected';
  await claim.save();

  // Thông báo cho Staff 2
  if (claim.reception?.receivedBy) {
    await Notification.create({
      userId: claim.reception.receivedBy,
      type: action === 'approve' ? 'claim_approved' : 'claim_rejected',
      title: action === 'approve'
        ? `Bảo hành ${claim.claimCode} đã được duyệt`
        : `Bảo hành ${claim.claimCode} bị từ chối`,
      message: action === 'approve'
        ? `${session.user.name} đã phê duyệt. Tiến hành sửa chữa.${note ? ' Ghi chú: ' + note : ''}`
        : `${session.user.name} đã từ chối.${note ? ' Lý do: ' + note : ''}`,
      claimId: claim._id,
      claimCode: claim.claimCode,
    });
  }

  return NextResponse.json(claim);
}
