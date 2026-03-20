import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Header />
        <main className="ml-64 pt-16 min-h-screen">
          <div className="p-6">{children}</div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </SessionProvider>
  );
}
