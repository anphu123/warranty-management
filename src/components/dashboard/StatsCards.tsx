'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertCircle, Clock, Wrench, CheckCircle } from 'lucide-react';

interface Stats {
  reception: number;
  overdue: number;
  pending_approval: number;
  processing: number;
  completed: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Tiếp nhận',
      value: stats.reception,
      icon: FileText,
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      title: 'Quá hạn',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      title: 'Chờ duyệt',
      value: stats.pending_approval,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    {
      title: 'Đang xử lý',
      value: stats.processing,
      icon: Wrench,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={`border ${card.border}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
