'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div>
      <PageHeader title="Cài đặt" description="Thông tin hệ thống và tài khoản" />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center text-white font-semibold text-lg">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Vai trò</p>
                <p className="font-medium">
                  {session?.user?.role === 'admin' ? 'Quản trị viên' :
                   session?.user?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                </p>
              </div>
              {session?.user?.centerName && (
                <div>
                  <p className="text-gray-500">Trung tâm</p>
                  <p className="font-medium">{session.user.centerName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tên hệ thống</span>
              <span className="font-medium">Refurbest Warranty Management</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Phiên bản</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Framework</span>
              <span className="font-medium">Next.js 14 + MongoDB</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Định dạng ngày</span>
              <span className="font-medium">DD/MM/YYYY</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-500">Đơn vị tiền tệ</span>
              <span className="font-medium">VNĐ (₫)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
