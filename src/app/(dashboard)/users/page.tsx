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
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatDateTime } from '@/lib/utils';
import { Plus, Pencil, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  centerId?: string;
  centerName?: string;
  isActive: boolean;
  createdAt: string;
}

const ROLES = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'staff', label: 'Nhân viên' },
];

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    centerName: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Forbidden');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'staff', centerName: '' });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role, centerName: user.centerName || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    setSaving(true);
    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = { ...formData };
      if (!body.password) delete body.password;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.success(editingUser ? 'Đã cập nhật người dùng' : 'Đã tạo người dùng mới');
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Xác nhận vô hiệu hóa người dùng này?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Đã vô hiệu hóa người dùng');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Thao tác thất bại');
    }
  };

  if (session?.user?.role !== 'admin') {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
  };

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        description={`Tổng: ${users.length} người dùng`}
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trung tâm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">Đang tải...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">Không có người dùng nào</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {roleLabels[user.role] || user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{user.centerName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDateTime(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {user.isActive && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeactivate(user._id)}>
                            <UserX className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
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
            <DialogTitle>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Họ tên *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="user@example.com" />
            </div>
            <div>
              <Label>Mật khẩu {editingUser ? '(để trống nếu không đổi)' : '*'}</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <Label>Vai trò *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tên trung tâm</Label>
              <Input value={formData.centerName} onChange={(e) => setFormData({ ...formData, centerName: e.target.value })} placeholder="Tên trung tâm bảo hành" />
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
