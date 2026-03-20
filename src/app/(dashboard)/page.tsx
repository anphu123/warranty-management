import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentClaims } from '@/components/dashboard/RecentClaims';

async function getDashboardData() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/dashboard/stats`, {
      cache: 'no-store',
    });
    if (!res.ok) return { stats: { reception: 0, overdue: 0, pending_approval: 0, processing: 0, completed: 0 }, recentClaims: [] };
    return res.json();
  } catch {
    return { stats: { reception: 0, overdue: 0, pending_approval: 0, processing: 0, completed: 0 }, recentClaims: [] };
  }
}

export default async function DashboardPage() {
  const { stats, recentClaims } = await getDashboardData();

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển"
        description="Tổng quan hệ thống quản lý bảo hành"
      />

      <Suspense fallback={<div>Đang tải...</div>}>
        <div className="space-y-6">
          <StatsCards stats={stats} />
          <RecentClaims claims={recentClaims} />
        </div>
      </Suspense>
    </div>
  );
}
