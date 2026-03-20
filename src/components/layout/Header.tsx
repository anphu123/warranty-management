'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    seller: 'Nhân viên bán hàng',
    warranty_staff: 'Nhân viên bảo hành',
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div></div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium leading-tight">{session?.user?.name || 'Người dùng'}</p>
                <p className="text-xs text-gray-500">{roleLabels[session?.user?.role || ''] || 'Nhân viên'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 font-normal">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
