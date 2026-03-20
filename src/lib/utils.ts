import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
}

export function formatDateTime(date: Date | string | undefined | null): string {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}


export const BRANDS = [
  'APPLE',
  'SAMSUNG',
  'XIAOMI',
  'OPPO',
  'VIVO',
  'REALME',
  'HUAWEI',
  'LG',
  'NOKIA',
  'SONY',
  'ASUS',
  'LENOVO',
  'DELL',
  'HP',
  'ACER',
  'MICROSOFT',
  'KHÁC',
];

export const STATUS_LABELS: Record<string, string> = {
  reception: 'Tiếp nhận',
  overdue: 'Quá hạn',
  pending_approval: 'Chờ duyệt',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
};

export const INSURANCE_TYPE_LABELS: Record<string, string> = {
  repair: 'Sửa chữa',
  replacement: 'Thay thế',
  extended_warranty: 'Bảo hành mở rộng',
};
