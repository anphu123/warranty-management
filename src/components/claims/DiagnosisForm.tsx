'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

interface DiagnosisFormData {
  mainSymptom: string;
  otherSymptoms: string;
  remediation: string;
  processingPlan: string;
  conclusion: string;
  diagnosedBy: string;
  diagnosisImages: string[];
}

interface DiagnosisFormProps {
  claimId: string;
  defaultValues?: Partial<DiagnosisFormData>;
  onSaved?: () => void;
}

export function DiagnosisForm({ claimId, defaultValues, onSaved }: DiagnosisFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(defaultValues?.diagnosisImages || []);
  const [conclusion, setConclusion] = useState(defaultValues?.conclusion || '');

  const { register, handleSubmit } = useForm<DiagnosisFormData>({
    defaultValues: {
      mainSymptom: defaultValues?.mainSymptom || '',
      otherSymptoms: defaultValues?.otherSymptoms || '',
      remediation: defaultValues?.remediation || '',
      processingPlan: defaultValues?.processingPlan || '',
      diagnosedBy: defaultValues?.diagnosedBy || '',
    },
  });

  const onSubmit = async (data: DiagnosisFormData) => {
    if (!conclusion) {
      toast.error('Vui lòng chọn kết luận');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/diagnosis`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          otherSymptoms: data.otherSymptoms ? data.otherSymptoms.split(',').map(s => s.trim()) : [],
          conclusion,
          diagnosisImages: images,
        }),
      });

      if (!response.ok) throw new Error('Failed to save diagnosis');

      toast.success('Lưu chẩn đoán thành công');
      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error('Lưu chẩn đoán thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Triệu chứng chính *</Label>
          <Input {...register('mainSymptom', { required: true })} placeholder="VD: Màn hình bị vỡ" />
        </div>

        <div>
          <Label>Triệu chứng khác</Label>
          <Input {...register('otherSymptoms')} placeholder="Phân cách bằng dấu phẩy" />
        </div>

        <div className="md:col-span-2">
          <Label>Biện pháp khắc phục</Label>
          <Input {...register('remediation')} placeholder="Mô tả biện pháp khắc phục" />
        </div>

        <div className="md:col-span-2">
          <Label>Kế hoạch xử lý</Label>
          <Input {...register('processingPlan')} placeholder="Kế hoạch xử lý..." />
        </div>

        <div>
          <Label>Kết luận *</Label>
          <Select value={conclusion} onValueChange={setConclusion}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn kết luận" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="repair_parts">Sửa chữa linh kiện</SelectItem>
              <SelectItem value="replace_device">Thay thế thiết bị</SelectItem>
              <SelectItem value="return_to_customer">Trả lại khách hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Người chẩn đoán</Label>
          <Input {...register('diagnosedBy')} placeholder="Tên kỹ thuật viên" />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Ảnh chẩn đoán</Label>
        <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu chẩn đoán'}
        </Button>
      </div>
    </form>
  );
}
