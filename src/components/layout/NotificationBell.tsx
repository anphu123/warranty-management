'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

interface Notif {
  _id: string;
  title: string;
  message: string;
  claimCode: string;
  claimId: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    const r = await fetch('/api/notifications');
    const d = await r.json();
    setNotifs(d.notifications || []);
    setUnread(d.unreadCount || 0);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    load();
  };

  const markOne = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-96 bg-white rounded-xl shadow-xl border z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Thông báo</h3>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-green-700 hover:underline">Đánh dấu tất cả đã đọc</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y">
            {notifs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Không có thông báo</p>
            )}
            {notifs.map(n => (
              <Link key={n._id} href={`/claims/${n.claimId}`}
                onClick={() => { markOne(n._id); setOpen(false); }}
                className={`block px-4 py-3 hover:bg-gray-50 ${!n.isRead ? 'bg-green-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-green-600' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
