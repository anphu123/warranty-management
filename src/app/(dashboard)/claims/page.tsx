'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { formatDateTime } from '@/lib/utils';
import { Plus, Search, Eye } from 'lucide-react';

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'reception', label: 'Tiếp nhận' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'pending_approval', label: 'Chờ duyệt' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
];

interface Claim {
  _id: string;
  claimCode: string;
  status: string;
  deviceInfo: { imei: string; brand: string; model: string };
  customer: { name: string; phone: string };
  createdAt: string;
  updatedAt: string;
}

function ClaimsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (search) params.set('search', search);

      const res = await fetch(`/api/claims?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setClaims(data.claims || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const timer = setTimeout(fetchClaims, 300);
    return () => clearTimeout(timer);
  }, [fetchClaims]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/claims${value !== 'all' ? `?status=${value}` : ''}`);
  };

  return (
    <div>
      <PageHeader
        title="Hồ sơ bảo hành"
        description={`Tổng số: ${total} hồ sơ`}
        actions={
          <Button asChild>
            <Link href="/claims/new">
              <Plus className="w-4 h-4 mr-2" />
              Tạo hồ sơ mới
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm IMEI, mã hồ sơ, tên KH..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hồ sơ</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian tạo</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Không có hồ sơ nào
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim._id} className="hover:bg-gray-50">
                    <TableCell>
                      <Link href={`/claims/${claim._id}`} className="text-green-700 hover:underline font-medium text-sm">
                        {claim.claimCode}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{claim.deviceInfo.imei}</TableCell>
                    <TableCell>
                      <div className="text-sm">{claim.customer.name}</div>
                      <div className="text-xs text-gray-500">{claim.customer.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{claim.deviceInfo.brand}</div>
                      <div className="text-xs text-gray-500">{claim.deviceInfo.model}</div>
                    </TableCell>
                    <TableCell>
                      <ClaimStatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDateTime(claim.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDateTime(claim.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/claims/${claim._id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClaimsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Đang tải...</div>}>
      <ClaimsContent />
    </Suspense>
  );
}
