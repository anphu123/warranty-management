'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SparePart {
  _id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  isActive: boolean;
}

const CATEGORIES = ['ĐIỆN THOẠI', 'LAPTOP', 'SMARTWATCH', 'TABLET'];

const EMPTY_PART = { code: '', name: '', category: 'ĐIỆN THOẠI', brand: '', price: 0 };

export default function PartsPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [formData, setFormData] = useState(EMPTY_PART);
  const [saving, setSaving] = useState(false);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      if (category !== 'all') params.set('category', category);

      const res = await fetch(`/api/parts?${params}`);
      const data = await res.json();
      setParts(data.parts || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchParts, 300);
    return () => clearTimeout(timer);
  }, [fetchParts]);

  const openCreate = () => {
    setEditingPart(null);
    setFormData(EMPTY_PART);
    setDialogOpen(true);
  };

  const openEdit = (part: SparePart) => {
    setEditingPart(part);
    setFormData({ code: part.code, name: part.name, category: part.category, brand: part.brand, price: part.price });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.brand) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      const url = editingPart ? `/api/parts/${editingPart._id}` : '/api/parts';
      const method = editingPart ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success(editingPart ? 'Đã cập nhật linh kiện' : 'Đã thêm linh kiện mới');
      setDialogOpen(false);
      fetchParts();
    } catch (error) {
      console.error(error);
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa linh kiện này?')) return;
    try {
      const res = await fetch(`/api/parts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Đã xóa linh kiện');
      fetchParts();
    } catch (error) {
      console.error(error);
      toast.error('Xóa thất bại');
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý linh kiện"
        description={`Tổng: ${total} linh kiện`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm linh kiện
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã, tên, thương hiệu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã linh kiện</TableHead>
                <TableHead>Tên linh kiện</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Thương hiệu</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">Đang tải...</TableCell>
                </TableRow>
              ) : parts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">Không có linh kiện nào</TableCell>
                </TableRow>
              ) : (
                parts.map((part) => (
                  <TableRow key={part._id}>
                    <TableCell className="font-mono text-sm">{part.code}</TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{part.category}</span>
                    </TableCell>
                    <TableCell>{part.brand}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(part.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(part)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(part._id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPart ? 'Chỉnh sửa linh kiện' : 'Thêm linh kiện mới'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Mã linh kiện *</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="LK001" />
            </div>
            <div>
              <Label>Tên linh kiện *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Tên linh kiện" />
            </div>
            <div>
              <Label>Danh mục *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Thương hiệu *</Label>
              <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="APPLE, SAMSUNG..." />
            </div>
            <div>
              <Label>Giá (VNĐ) *</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} min={0} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
