import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Notification from '@/lib/models/Notification';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  if (id === 'read-all') {
    await Notification.updateMany({ userId: session.user.id }, { isRead: true });
    return NextResponse.json({ success: true });
  }

  await Notification.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { isRead: true }
  );
  return NextResponse.json({ success: true });
}
