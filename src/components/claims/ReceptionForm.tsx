'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BRANDS } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const receptionSchema = z.object({
  deviceInfo: z.object({
    imei: z.string().min(1, 'Vui lòng nhập IMEI'),
    brand: z.string().min(1, 'Vui lòng chọn thương hiệu'),
    model: z.string().min(1, 'Vui lòng nhập model'),
    purchaseDate: z.string().optional(),
    insuranceDate: z.string().optional(),
    price: z.string().optional(),
  }),
  customer: z.object({
    name: z.string().min(1, 'Vui lòng nhập tên khách hàng'),
    idCard: z.string().optional(),
    phone: z.string().min(1, 'Vui lòng nhập số điện thoại'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    address: z.string().optional(),
    province: z.string().optional(),
  }),
  insuranceInfo: z.object({
    contractCode: z.string().optional(),
    insuranceType: z.enum(['repair', 'replacement', 'extended_warranty']),
    policyNumber: z.string().optional(),
  }),
  reception: z.object({
    receivedFrom: z.enum(['direct', 'shipping']),
    receivedDate: z.string(),
    condition: z.string().optional(),
    notes: z.string().optional(),
  }),
});

type ReceptionFormData = z.infer<typeof receptionSchema>;

interface ReceptionFormProps {
  defaultImei?: string;
  defaultData?: Partial<ReceptionFormData>;
}

export function ReceptionForm({ defaultImei, defaultData }: ReceptionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReceptionFormData>({
    resolver: zodResolver(receptionSchema),
    defaultValues: {
      deviceInfo: {
        imei: defaultImei || defaultData?.deviceInfo?.imei || '',
        brand: defaultData?.deviceInfo?.brand || '',
        model: defaultData?.deviceInfo?.model || '',
      },
      customer: {
        name: defaultData?.customer?.name || '',
        phone: defaultData?.customer?.phone || '',
      },
      insuranceInfo: {
        insuranceType: 'repair',
      },
      reception: {
        receivedFrom: 'direct',
        receivedDate: new Date().toISOString().split('T')[0],
      },
    },
  });

  const watchedBrand = watch('deviceInfo.brand');
  const watchedReceivedFrom = watch('reception.receivedFrom');
  const watchedInsuranceType = watch('insuranceInfo.insuranceType');

  const onSubmit = async (data: ReceptionFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        deviceInfo: {
          ...data.deviceInfo,
          price: data.deviceInfo.price ? Number(data.deviceInfo.price) : undefined,
          purchaseDate: data.deviceInfo.purchaseDate || undefined,
          insuranceDate: data.deviceInfo.insuranceDate || undefined,
        },
      };

      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create claim');

      const claim = await response.json();
      toast.success('Tạo hồ sơ thành công!');
      router.push(`/claims/${claim._id}`);
    } catch (error) {
      console.error(error);
      toast.error('Tạo hồ sơ thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin thiết bị</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="imei">IMEI / Serial *</Label>
            <Input id="imei" {...register('deviceInfo.imei')} placeholder="Nhập IMEI hoặc serial" />
            {errors.deviceInfo?.imei && (
              <p className="text-red-500 text-sm mt-1">{errors.deviceInfo.imei.message}</p>
            )}
          </div>

          <div>
            <Label>Thương hiệu *</Label>
            <Select
              value={watchedBrand}
              onValueChange={(v) => setValue('deviceInfo.brand', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn thương hiệu" />
              </SelectTrigger>
              <SelectContent>
                {BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.deviceInfo?.brand && (
              <p className="text-red-500 text-sm mt-1">{errors.deviceInfo.brand.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="model">Model *</Label>
            <Input id="model" {...register('deviceInfo.model')} placeholder="VD: iPhone 15 Pro Max" />
            {errors.deviceInfo?.model && (
              <p className="text-red-500 text-sm mt-1">{errors.deviceInfo.model.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Giá trị thiết bị (VNĐ)</Label>
            <Input id="price" type="number" {...register('deviceInfo.price')} placeholder="0" />
          </div>

          <div>
            <Label htmlFor="purchaseDate">Ngày mua</Label>
            <Input id="purchaseDate" type="date" {...register('deviceInfo.purchaseDate')} />
          </div>

          <div>
            <Label htmlFor="insuranceDate">Ngày tham gia bảo hiểm</Label>
            <Input id="insuranceDate" type="date" {...register('deviceInfo.insuranceDate')} />
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Họ và tên *</Label>
            <Input id="customerName" {...register('customer.name')} placeholder="Nguyễn Văn A" />
            {errors.customer?.name && (
              <p className="text-red-500 text-sm mt-1">{errors.customer.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input id="phone" {...register('customer.phone')} placeholder="0912345678" />
            {errors.customer?.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.customer.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="idCard">CMND/CCCD</Label>
            <Input id="idCard" {...register('customer.idCard')} placeholder="012345678901" />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('customer.email')} placeholder="example@email.com" />
            {errors.customer?.email && (
              <p className="text-red-500 text-sm mt-1">{errors.customer.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="province">Tỉnh/Thành phố</Label>
            <Input id="province" {...register('customer.province')} placeholder="Hà Nội" />
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" {...register('customer.address')} placeholder="Số nhà, đường, phường/xã" />
          </div>
        </CardContent>
      </Card>

      {/* Insurance Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin bảo hiểm</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contractCode">Mã hợp đồng</Label>
            <Input id="contractCode" {...register('insuranceInfo.contractCode')} placeholder="HĐ-001" />
          </div>

          <div>
            <Label>Loại bảo hiểm *</Label>
            <Select
              value={watchedInsuranceType}
              onValueChange={(v) => setValue('insuranceInfo.insuranceType', v as 'repair' | 'replacement' | 'extended_warranty')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repair">Sửa chữa</SelectItem>
                <SelectItem value="replacement">Thay thế</SelectItem>
                <SelectItem value="extended_warranty">Bảo hành mở rộng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="policyNumber">Số hợp đồng bảo hiểm</Label>
            <Input id="policyNumber" {...register('insuranceInfo.policyNumber')} placeholder="POL-001" />
          </div>
        </CardContent>
      </Card>

      {/* Reception Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin tiếp nhận</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Hình thức tiếp nhận *</Label>
            <Select
              value={watchedReceivedFrom}
              onValueChange={(v) => setValue('reception.receivedFrom', v as 'direct' | 'shipping')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Trực tiếp</SelectItem>
                <SelectItem value="shipping">Vận chuyển</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="receivedDate">Ngày tiếp nhận *</Label>
            <Input id="receivedDate" type="date" {...register('reception.receivedDate')} />
            {errors.reception?.receivedDate && (
              <p className="text-red-500 text-sm mt-1">{errors.reception.receivedDate.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="condition">Tình trạng máy</Label>
            <Input id="condition" {...register('reception.condition')} placeholder="Mô tả tình trạng máy khi tiếp nhận" />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input id="notes" {...register('reception.notes')} placeholder="Ghi chú thêm..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo hồ sơ'}
        </Button>
      </div>
    </form>
  );
}
