'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Bảng điều khiển', href: '/', icon: LayoutDashboard },
  { name: 'Hồ sơ bảo hành', href: '/claims', icon: FileText },
  { name: 'Linh kiện', href: '/parts', icon: Wrench },
  { name: 'Người dùng', href: '/users', icon: Users },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-base leading-tight">GlobalSafe</p>
          <p className="text-xs text-gray-400">Quản lý bảo hành</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">v1.0.0 © 2024 GlobalSafe</p>
      </div>
    </div>
  );
}
