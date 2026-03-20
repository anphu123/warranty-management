'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface QuotePart {
  partCode: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface QuoteFormProps {
  claimId: string;
  defaultValues?: {
    parts?: QuotePart[];
    laborCost?: number;
    quotedBy?: string;
    quotedByPhone?: string;
    sentAt?: string;
    approvedAt?: string;
  };
  onSaved?: () => void;
}

export function QuoteForm({ claimId, defaultValues, onSaved }: QuoteFormProps) {
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<QuotePart[]>(defaultValues?.parts || []);
  const [laborCost, setLaborCost] = useState(defaultValues?.laborCost || 0);
  const [quotedBy, setQuotedBy] = useState(defaultValues?.quotedBy || '');
  const [quotedByPhone, setQuotedByPhone] = useState(defaultValues?.quotedByPhone || '');

  const totalAmount = parts.reduce((sum, p) => sum + p.totalPrice, 0);
  const grandTotal = totalAmount + laborCost;

  const addPart = () => {
    setParts([...parts, { partCode: '', partName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof QuotePart, value: string | number) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice;
    }

    setParts(updated);
  };

  const handleSave = async (action: 'save' | 'send') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/quote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'send' ? 'send' : undefined,
          parts,
          totalAmount,
          laborCost,
          grandTotal,
          quotedBy,
          quotedByPhone,
        }),
      });

      if (!response.ok) throw new Error('Failed to save quote');

      toast.success(action === 'send' ? 'Đã gửi báo giá!' : 'Lưu báo giá thành công');
      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error('Lưu báo giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/quote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve quote');

      toast.success('Đã duyệt báo giá!');
      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error('Duyệt báo giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Danh sách linh kiện</h3>
          <Button type="button" variant="outline" size="sm" onClick={addPart}>
            <Plus className="w-4 h-4 mr-1" />
            Thêm linh kiện
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã linh kiện</TableHead>
              <TableHead>Tên linh kiện</TableHead>
              <TableHead className="text-right">SL</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-6">
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
                      placeholder="LK001"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={part.partName}
                      onChange={(e) => updatePart(index, 'partName', e.target.value)}
                      placeholder="Tên linh kiện"
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
                  <TableCell className="text-right">{formatCurrency(part.totalPrice)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePart(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Người báo giá</Label>
              <Input value={quotedBy} onChange={(e) => setQuotedBy(e.target.value)} placeholder="Tên người báo giá" />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input value={quotedByPhone} onChange={(e) => setQuotedByPhone(e.target.value)} placeholder="SĐT người báo giá" />
            </div>
            <div>
              <Label>Chi phí nhân công (VNĐ)</Label>
              <Input type="number" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} min={0} />
            </div>
          </div>

          <div className="mt-4 space-y-2 text-right">
            <div className="flex justify-end gap-8">
              <span className="text-gray-600">Tiền linh kiện:</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-gray-600">Nhân công:</span>
              <span className="font-medium">{formatCurrency(laborCost)}</span>
            </div>
            <div className="flex justify-end gap-8 border-t pt-2">
              <span className="text-gray-800 font-semibold">Tổng cộng:</span>
              <span className="font-bold text-lg text-blue-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        {defaultValues?.sentAt && !defaultValues?.approvedAt && (
          <Button type="button" variant="outline" onClick={handleApprove} disabled={loading}>
            Duyệt báo giá
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => handleSave('save')} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu nháp'}
        </Button>
        {!defaultValues?.sentAt && (
          <Button type="button" onClick={() => handleSave('send')} disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Đang gửi...' : 'Gửi báo giá'}
          </Button>
        )}
      </div>
    </div>
  );
}
