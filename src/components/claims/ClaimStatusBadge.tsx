'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ClaimStatus } from '@/lib/models/WarrantyClaim';

interface ClaimStatusBadgeProps {
  status: ClaimStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  reception: {
    label: 'Tiếp nhận',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  overdue: {
    label: 'Quá hạn',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  pending_approval: {
    label: 'Chờ duyệt',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  processing: {
    label: 'Đang xử lý',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
};

export function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
