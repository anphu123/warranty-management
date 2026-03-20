'use client';

import { useState } from 'react';
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
import { toast } from 'sonner';

interface CompletionFormProps {
  claimId: string;
  defaultValues?: {
    completionStatus?: string;
    deliveryType?: string;
    shippingInfo?: {
      carrier?: string;
      trackingCode?: string;
      weight?: number;
      fromAddress?: string;
      toAddress?: string;
    };
    returnNotes?: string;
    documents?: {
      claimForm?: string;
      jobsheet?: string;
      jobcard?: string;
      repairReceipt?: string;
    };
  };
  onSaved?: () => void;
}

export function CompletionForm({ claimId, defaultValues, onSaved }: CompletionFormProps) {
  const [loading, setLoading] = useState(false);
  const [completionStatus, setCompletionStatus] = useState(defaultValues?.completionStatus || '');
  const [deliveryType, setDeliveryType] = useState(defaultValues?.deliveryType || 'direct');
  const [returnNotes, setReturnNotes] = useState(defaultValues?.returnNotes || '');
  const [carrier, setCarrier] = useState(defaultValues?.shippingInfo?.carrier || '');
  const [trackingCode, setTrackingCode] = useState(defaultValues?.shippingInfo?.trackingCode || '');
  const [weight, setWeight] = useState(defaultValues?.shippingInfo?.weight || 0);
  const [fromAddress, setFromAddress] = useState(defaultValues?.shippingInfo?.fromAddress || '');
  const [toAddress, setToAddress] = useState(defaultValues?.shippingInfo?.toAddress || '');

  const handleSave = async () => {
    if (!completionStatus) {
      toast.error('Vui lòng chọn trạng thái hoàn thành');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completion: {
            completionStatus,
            deliveryType,
            shippingInfo: deliveryType === 'shipping' ? {
              carrier,
              trackingCode,
              weight,
              fromAddress,
              toAddress,
            } : undefined,
            returnNotes,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to complete claim');

      toast.success('Hoàn thiện hồ sơ thành công!');
      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error('Lưu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Trạng thái hoàn thành *</Label>
          <Select value={completionStatus} onValueChange={setCompletionStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed_insurance">Hoàn thành - Bảo hiểm</SelectItem>
              <SelectItem value="completed_service">Hoàn thành - Dịch vụ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Hình thức trả máy *</Label>
          <Select value={deliveryType} onValueChange={setDeliveryType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Trực tiếp</SelectItem>
              <SelectItem value="shipping">Vận chuyển</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label>Ghi chú trả máy</Label>
          <Input
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="Ghi chú khi trả máy"
          />
        </div>
      </div>

      {deliveryType === 'shipping' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium md:col-span-2">Thông tin vận chuyển</h3>
          <div>
            <Label>Đơn vị vận chuyển</Label>
            <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="VD: GHTK, GHN" />
          </div>
          <div>
            <Label>Mã vận đơn</Label>
            <Input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="Mã tracking" />
          </div>
          <div>
            <Label>Khối lượng (gram)</Label>
            <Input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} min={0} />
          </div>
          <div>
            <Label>Địa chỉ gửi</Label>
            <Input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="Địa chỉ gửi" />
          </div>
          <div className="md:col-span-2">
            <Label>Địa chỉ nhận</Label>
            <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Địa chỉ nhận" />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Hoàn tất & Trả máy'}
        </Button>
      </div>
    </div>
  );
}
