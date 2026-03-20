import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';
import Notification from '@/lib/models/Notification';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  active: 'Đang bảo hành',
  pending_approval: 'Chờ duyệt',
  approved: 'Đã duyệt',
  processing: 'Đang sửa',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
  expired: 'Hết hạn',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  processing: 'bg-orange-100 text-orange-800',
  completed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-red-100 text-red-800',
};

export default async function DashboardPage() {
  const session = await auth();
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (session?.user?.role === 'seller') filter.createdBy = session.user.id;

  const [total, active, pendingApproval, processing, completed, recent, unread] = await Promise.all([
    WarrantyClaim.countDocuments(filter),
    WarrantyClaim.countDocuments({ ...filter, status: 'active' }),
    WarrantyClaim.countDocuments({ ...filter, status: 'pending_approval' }),
    WarrantyClaim.countDocuments({ ...filter, status: 'processing' }),
    WarrantyClaim.countDocuments({ ...filter, status: 'completed' }),
    WarrantyClaim.find(filter).sort({ createdAt: -1 }).limit(8).lean(),
    session?.user?.id ? Notification.countDocuments({ userId: session.user.id, isRead: false }) : 0,
  ]);

  const stats = [
    { label: 'Tổng bảo hành', value: total, color: 'bg-green-600', href: '/claims' },
    { label: 'Đang bảo hành', value: active, color: 'bg-emerald-500', href: '/claims?status=active' },
    { label: 'Chờ duyệt', value: pendingApproval, color: 'bg-yellow-500', href: '/claims?status=pending_approval' },
    { label: 'Đang sửa', value: processing, color: 'bg-orange-500', href: '/claims?status=processing' },
    { label: 'Hoàn thành', value: completed, color: 'bg-gray-500', href: '/claims?status=completed' },
    { label: 'Thông báo chưa đọc', value: unread, color: 'bg-red-500', href: '/notifications' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
          <p className="text-sm text-gray-500 mt-1">Xin chào, {session?.user?.name}</p>
        </div>
        {(session?.user?.role === 'seller' || session?.user?.role === 'admin') && (
          <Link href="/claims/new" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
            + Tạo bảo hành
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white font-bold text-lg">{s.value}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent claims */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Hồ sơ gần đây</h2>
          <Link href="/claims" className="text-sm text-green-700 hover:underline">Xem tất cả</Link>
        </div>
        <div className="divide-y">
          {recent.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400">Chưa có hồ sơ nào</p>
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(recent as any[]).map((c) => {
            const claim = c as {
              _id: string; claimCode: string; status: string;
              customer: { name: string; phone: string };
              device: { brand: string; model: string; imei: string };
              warrantyExpiry: string; createdAt: string;
            };
            const expired = new Date(claim.warrantyExpiry) < new Date();
            return (
              <Link key={String(claim._id)} href={`/claims/${claim._id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-sm">{claim.claimCode}</p>
                    <p className="text-xs text-gray-500">{claim.customer.name} · {claim.device.brand} {claim.device.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {expired && claim.status === 'active' && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Hết hạn</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[claim.status] || 'bg-gray-100'}`}>
                    {STATUS_LABELS[claim.status] || claim.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(claim.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
