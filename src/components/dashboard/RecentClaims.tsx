'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Claim {
  _id: string;
  claimCode: string;
  status: string;
  deviceInfo: { imei: string; brand: string; model: string };
  customer: { name: string; phone: string };
  createdAt: string;
  updatedAt: string;
}

interface RecentClaimsProps {
  claims: Claim[];
}

export function RecentClaims({ claims }: RecentClaimsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hồ sơ gần đây</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/claims">Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã hồ sơ</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  Chưa có hồ sơ nào
                </TableCell>
              </TableRow>
            ) : (
              claims.map((claim) => (
                <TableRow key={claim._id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link href={`/claims/${claim._id}`} className="text-green-700 hover:underline font-medium">
                      {claim.claimCode}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{claim.deviceInfo.imei}</TableCell>
                  <TableCell>
                    <div>{claim.customer.name}</div>
                    <div className="text-xs text-gray-500">{claim.customer.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{claim.deviceInfo.brand}</div>
                    <div className="text-xs text-gray-500">{claim.deviceInfo.model}</div>
                  </TableCell>
                  <TableCell>
                    <ClaimStatusBadge status={claim.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDateTime(claim.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
