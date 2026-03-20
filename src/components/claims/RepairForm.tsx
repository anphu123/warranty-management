'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner';

interface RepairPart {
  partCode: string;
  partName: string;
  doCode: string;
  doDate: string;
  quantity: number;
  unitPrice: number;
}

interface RepairFormProps {
  claimId: string;
  defaultValues?: {
    startedAt?: string;
    completedAt?: string;
    parts?: RepairPart[];
    afterRepairImages?: string[];
    repairNotes?: string;
  };
  onSaved?: () => void;
}

export function RepairForm({ claimId, defaultValues, onSaved }: RepairFormProps) {
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<RepairPart[]>(defaultValues?.parts || []);
  const [images, setImages] = useState<string[]>(defaultValues?.afterRepairImages || []);
  const [startedAt, setStartedAt] = useState(defaultValues?.startedAt ? defaultValues.startedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [completedAt, setCompletedAt] = useState(defaultValues?.completedAt ? defaultValues.completedAt.split('T')[0] : '');
  const [repairNotes, setRepairNotes] = useState(defaultValues?.repairNotes || '');

  const addPart = () => {
    setParts([...parts, { partCode: '', partName: '', doCode: '', doDate: '', quantity: 1, unitPrice: 0 }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof RepairPart, value: string | number) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/repair`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startedAt: startedAt || undefined,
          completedAt: completedAt || undefined,
          parts,
          afterRepairImages: images,
          repairNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to save repair');

      toast.success('Lưu thông tin sửa chữa thành công');
      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error('Lưu thông tin sửa chữa thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Ngày bắt đầu sửa</Label>
          <Input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
        </div>
        <div>
          <Label>Ngày hoàn thành</Label>
          <Input type="date" value={completedAt} onChange={(e) => setCompletedAt(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Ghi chú sửa chữa</Label>
          <Input value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)} placeholder="Ghi chú về quá trình sửa chữa" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Linh kiện đã thay</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPart}>
            <Plus className="w-4 h-4 mr-1" />
            Thêm linh kiện
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã LK</TableHead>
              <TableHead>Tên linh kiện</TableHead>
              <TableHead>Mã DO</TableHead>
              <TableHead>Ngày DO</TableHead>
              <TableHead className="text-right">SL</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-6">
                  Chưa có linh kiện nào
                </TableCell>
              </TableRow>
            ) : (
              parts.map((part, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={part.partCode}
                      onChange={(e) => updatePart(index, 'partCode', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.partName}
                      onChange={(e) => updatePart(index, 'partName', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.doCode}
                      onChange={(e) => updatePart(index, 'doCode', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={part.doDate}
                      onChange={(e) => updatePart(index, 'doDate', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={part.quantity}
                      onChange={(e) => updatePart(index, 'quantity', Number(e.target.value))}
                      min={1}
                      className="h-8 w-16 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={part.unitPrice}
                      onChange={(e) => updatePart(index, 'unitPrice', Number(e.target.value))}
                      min={0}
                      className="h-8 w-28 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePart(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <Label className="mb-2 block">Ảnh sau sửa chữa</Label>
        <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thông tin'}
        </Button>
      </div>
    </div>
  );
}
