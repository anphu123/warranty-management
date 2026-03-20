'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/claims/ImageUpload';

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Realme', 'Nokia', 'Sony', 'Khác'];
const DEVICE_TYPES = ['Điện thoại', 'Laptop', 'Tablet', 'Smartwatch', 'Khác'];

export default function NewClaimPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialImages, setInitialImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', customerIdCard: '',
    imei: '', brand: '', model: '', deviceType: 'Điện thoại', color: '', purchasePrice: '', purchaseDate: '',
    warrantyMonths: '12',
    initialCondition: 'Máy mới, nguyên seal, chưa có hư hỏng',
    notes: '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name: form.customerName, phone: form.customerPhone, email: form.customerEmail, address: form.customerAddress, idCard: form.customerIdCard },
          device: { imei: form.imei, brand: form.brand, model: form.model, type: form.deviceType, color: form.color, purchasePrice: Number(form.purchasePrice), purchaseDate: form.purchaseDate },
          warrantyMonths: Number(form.warrantyMonths),
          initialCondition: form.initialCondition,
          initialImages,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tạo bảo hành');
      router.push(`/claims/${data._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu bảo hành</h1>
        <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin khi bán hàng</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Khách hàng */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs flex items-center justify-center">1</span>
            Thông tin khách hàng
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} placeholder="0901234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} placeholder="email@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CCCD/CMND</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.customerIdCard} onChange={e => set('customerIdCard', e.target.value)} placeholder="012345678901" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.customerAddress} onChange={e => set('customerAddress', e.target.value)} placeholder="123 Đường ABC, Quận 1, TP.HCM" />
            </div>
          </div>
        </div>

        {/* Thiết bị */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs flex items-center justify-center">2</span>
            Thông tin thiết bị
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">IMEI / Serial Number <span className="text-red-500">*</span></label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.imei} onChange={e => set('imei', e.target.value)} placeholder="356938035643809" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hãng <span className="text-red-500">*</span></label>
              <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.brand} onChange={e => set('brand', e.target.value)}>
                <option value="">Chọn hãng</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model <span className="text-red-500">*</span></label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.model} onChange={e => set('model', e.target.value)} placeholder="iPhone 15 Pro Max" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại thiết bị</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.deviceType} onChange={e => set('deviceType', e.target.value)}>
                {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.color} onChange={e => set('color', e.target.value)} placeholder="Black Titanium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VND)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="25000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua <span className="text-red-500">*</span></label>
              <input required type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Bảo hành */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs flex items-center justify-center">3</span>
            Thời hạn bảo hành
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời hạn</label>
            <div className="flex gap-3">
              {['3', '6', '12', '18', '24'].map(m => (
                <button key={m} type="button"
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${form.warrantyMonths === m ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 hover:border-green-500'}`}
                  onClick={() => set('warrantyMonths', m)}>{m} tháng</button>
              ))}
            </div>
          </div>
        </div>

        {/* Tình trạng ban đầu */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-700 text-white rounded-full text-xs flex items-center justify-center">4</span>
            Tình trạng sản phẩm khi bán
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tình trạng <span className="text-red-500">*</span></label>
            <textarea required rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.initialCondition} onChange={e => set('initialCondition', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh tình trạng ban đầu</label>
            <ImageUpload images={initialImages} onImagesChange={setInitialImages} maxImages={8} />
          </div>
        </div>

        {/* Ghi chú */}
        <div className="bg-white rounded-xl border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
          <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Phụ kiện đi kèm, yêu cầu đặc biệt..." />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Hủy</button>
          <button type="submit" disabled={loading} className="flex-1 bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
            {loading ? 'Đang tạo...' : 'Tạo phiếu bảo hành'}
          </button>
        </div>
      </form>
    </div>
  );
}
