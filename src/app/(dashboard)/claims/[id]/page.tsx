// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { ImageUpload } from '@/components/claims/ImageUpload';

const STATUS_LABELS: Record<string, string> = {
  active: 'Đang bảo hành', pending_approval: 'Chờ duyệt',
  approved: 'Đã duyệt', processing: 'Đang sửa',
  completed: 'Hoàn thành', rejected: 'Từ chối', expired: 'Hết hạn',
};
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800', pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800', processing: 'bg-orange-100 text-orange-800',
  completed: 'bg-gray-100 text-gray-800', rejected: 'bg-red-100 text-red-800', expired: 'bg-red-100 text-red-800',
};

export default function ClaimDetailPage(): React.ReactElement {
  
  const params = useParams(); const id = params.id as string;
  const { data: session } = useSession();
  const [claim, setClaim] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Reception form state
  const [conditionReport, setConditionReport] = useState('');
  const [conditionImages, setConditionImages] = useState<string[]>([]);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [ineligibleReason, setIneligibleReason] = useState('');

  // Approval form state
  const [approvalNote, setApprovalNote] = useState('');

  // Complete form state
  const [repairNote, setRepairNote] = useState('');
  const [resultImages, setResultImages] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/claims/${id}`).then(r => r.json()).then(d => { setClaim(d); setLoading(false); });
  }, [id]);

  const refresh = () => {
    fetch(`/api/claims/${id}`).then(r => r.json()).then(setClaim);
  };

  const act = async (url: string, body: unknown) => {
    setActionLoading(true); setMsg('');
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Lỗi');
      setClaim(d); setMsg('Thành công!');
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Lỗi'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Đang tải...</div></div>;
  if (!claim) return <div className="text-center py-12 text-red-500">Không tìm thấy hồ sơ</div>;

  const c = claim as {
    _id: string; claimCode: string; status: string;
    customer: Record<string, string>;
    device: Record<string, string | number>;
    warrantyMonths: number; warrantyStartDate: string; warrantyExpiry: string;
    initialCondition: string; initialImages: string[];
    createdByName: string; createdByEmail: string; createdBy: string;
    reception?: Record<string, unknown>;
    approval?: Record<string, unknown>;
    processing?: Record<string, unknown>;
    notes?: string; createdAt: string;
  };

  const role = session?.user?.role;
  const isSeller = role === 'seller' || role === 'admin';
  const isWarrantyStaff = role === 'warranty_staff' || role === 'admin';
  const isOwner = c.createdBy === session?.user?.id || role === 'admin';
  const isExpired = new Date(c.warrantyExpiry) < new Date();
  const daysLeft = Math.ceil((new Date(c.warrantyExpiry).getTime() - Date.now()) / 86400000);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{c.claimCode}</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo bởi {c.createdByName} · {new Date(c.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
      </div>

      {msg && <div className={`px-4 py-3 rounded-lg text-sm ${msg === 'Thành công!' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg}</div>}

      {/* Thời hạn BH */}
      <div className={`rounded-xl border p-4 flex items-center justify-between ${isExpired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <div>
          <p className="text-sm font-medium text-gray-700">Thời hạn bảo hành</p>
          <p className="text-xs text-gray-500 mt-0.5">{new Date(c.warrantyStartDate).toLocaleDateString('vi-VN')} → {new Date(c.warrantyExpiry).toLocaleDateString('vi-VN')} ({c.warrantyMonths} tháng)</p>
        </div>
        <div className={`text-right font-bold ${isExpired ? 'text-red-600' : 'text-green-700'}`}>
          {isExpired ? 'ĐÃ HẾT HẠN' : `Còn ${daysLeft} ngày`}
        </div>
      </div>

      {/* KH + Thiết bị */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Khách hàng</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-24">Họ tên</dt><dd className="font-medium">{c.customer.name}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-24">SĐT</dt><dd>{c.customer.phone}</dd></div>
            {c.customer.email && <div className="flex gap-2"><dt className="text-gray-500 w-24">Email</dt><dd>{c.customer.email}</dd></div>}
            {c.customer.idCard && <div className="flex gap-2"><dt className="text-gray-500 w-24">CCCD</dt><dd>{c.customer.idCard}</dd></div>}
            {c.customer.address && <div className="flex gap-2"><dt className="text-gray-500 w-24">Địa chỉ</dt><dd>{c.customer.address}</dd></div>}
          </dl>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Thiết bị</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-20">IMEI</dt><dd className="font-mono font-medium">{String(c.device.imei)}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-20">Hãng</dt><dd>{String(c.device.brand)}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-20">Model</dt><dd>{String(c.device.model)}</dd></div>
            {c.device.color && <div className="flex gap-2"><dt className="text-gray-500 w-20">Màu</dt><dd>{String(c.device.color)}</dd></div>}
            {c.device.purchasePrice && <div className="flex gap-2"><dt className="text-gray-500 w-20">Giá bán</dt><dd>{Number(c.device.purchasePrice).toLocaleString('vi-VN')}đ</dd></div>}
          </dl>
        </div>
      </div>

      {/* Tình trạng ban đầu */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Tình trạng ban đầu (khi bán)</h2>
        <p className="text-sm text-gray-700 mb-3">{c.initialCondition}</p>
        {c.initialImages?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {c.initialImages.map((img: string, i: number) => (
              <a key={i} href={img} target="_blank" rel="noreferrer">
                <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* STEP: Staff 2 tiếp nhận */}
      {isWarrantyStaff && c.status === 'active' && !isExpired && (
        <div className="bg-white rounded-xl border-2 border-orange-300 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Tiếp nhận & kiểm tra bảo hành</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Báo cáo tình trạng thiết bị <span className="text-red-500">*</span></label>
              <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={conditionReport} onChange={e => setConditionReport(e.target.value)} placeholder="Mô tả tình trạng máy khi nhận: màn hình bị vỡ, pin phồng..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh tình trạng</label>
              <ImageUpload images={conditionImages} onImagesChange={setConditionImages} maxImages={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đủ điều kiện bảo hành?</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsEligible(true)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${isEligible === true ? 'bg-green-700 text-white border-green-700' : 'border-gray-300'}`}>
                  ✓ Đủ điều kiện
                </button>
                <button type="button" onClick={() => setIsEligible(false)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${isEligible === false ? 'bg-red-600 text-white border-red-600' : 'border-gray-300'}`}>
                  ✗ Không đủ điều kiện
                </button>
              </div>
            </div>
            {isEligible === false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do không đủ điều kiện <span className="text-red-500">*</span></label>
                <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={ineligibleReason} onChange={e => setIneligibleReason(e.target.value)} placeholder="VD: Máy bị vỡ do ngoại lực, không thuộc lỗi nhà sản xuất..." />
              </div>
            )}
            <button disabled={actionLoading || isEligible === null || !conditionReport}
              onClick={() => act(`/api/claims/${id}/receive`, { conditionReport, conditionImages, isEligible, ineligibleReason })}
              className="w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              {actionLoading ? 'Đang gửi...' : 'Gửi báo cáo & chờ phê duyệt'}
            </button>
          </div>
        </div>
      )}

      {/* Báo cáo tiếp nhận (đã có) */}
      {c.reception && (c.reception as Record<string, unknown>).receivedAt && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Báo cáo tiếp nhận</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-28">Nhân viên BH</dt><dd>{String((c.reception as Record<string, unknown>).receivedByName || '')}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-28">Ngày tiếp nhận</dt><dd>{new Date(String((c.reception as Record<string, unknown>).receivedAt)).toLocaleDateString('vi-VN')}</dd></div>
            <div className="flex gap-2">
              <dt className="text-gray-500 w-28">Điều kiện BH</dt>
              <dd className={`font-medium ${(c.reception as Record<string, unknown>).isEligible ? 'text-green-700' : 'text-red-600'}`}>
                {(c.reception as Record<string, unknown>).isEligible ? '✓ Đủ điều kiện' : '✗ Không đủ điều kiện'}
              </dd>
            </div>
            {!(c.reception as Record<string, unknown>).isEligible && <div className="flex gap-2"><dt className="text-gray-500 w-28">Lý do</dt><dd className="text-red-600">{String((c.reception as Record<string, unknown>).ineligibleReason || '')}</dd></div>}
            <div><dt className="text-gray-500 mb-1">Tình trạng máy</dt><dd className="bg-gray-50 rounded-lg p-3">{String((c.reception as Record<string, unknown>).conditionReport || '')}</dd></div>
          </dl>
          {((c.reception as Record<string, unknown>).conditionImages as string[] || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {((c.reception as Record<string, unknown>).conditionImages as string[]).map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noreferrer">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP: Staff 1 duyệt */}
      {isSeller && isOwner && c.status === 'pending_approval' && (
        <div className="bg-white rounded-xl border-2 border-yellow-400 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Phê duyệt bảo hành</h2>
          <p className="text-sm text-gray-500 mb-4">Xem xét báo cáo tiếp nhận bên trên và đưa ra quyết định.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tuỳ chọn)</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={approvalNote} onChange={e => setApprovalNote(e.target.value)} placeholder="Ghi chú cho nhân viên bảo hành..." />
          </div>
          <div className="flex gap-3">
            <button disabled={actionLoading}
              onClick={() => act(`/api/claims/${id}/approve`, { action: 'approve', note: approvalNote })}
              className="flex-1 bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
              {actionLoading ? '...' : '✓ Phê duyệt'}
            </button>
            <button disabled={actionLoading}
              onClick={() => act(`/api/claims/${id}/approve`, { action: 'reject', note: approvalNote })}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {actionLoading ? '...' : '✗ Từ chối'}
            </button>
          </div>
        </div>
      )}

      {/* Kết quả phê duyệt */}
      {c.approval && (c.approval as Record<string, unknown>).status && (
        <div className={`rounded-xl border p-4 ${(c.approval as Record<string, unknown>).status === 'approved' ? 'bg-green-50 border-green-200' : (c.approval as Record<string, unknown>).status === 'rejected' ? 'bg-red-50 border-red-200' : ''}`}>
          <p className="text-sm font-medium">
            {(c.approval as Record<string, unknown>).status === 'approved' ? '✓ Đã phê duyệt' : (c.approval as Record<string, unknown>).status === 'rejected' ? '✗ Đã từ chối' : '⏳ Chờ phê duyệt'}
          </p>
          {(c.approval as Record<string, unknown>).note && <p className="text-sm text-gray-600 mt-1">{String((c.approval as Record<string, unknown>).note)}</p>}
          {(c.approval as Record<string, unknown>).decidedAt && <p className="text-xs text-gray-400 mt-1">{new Date(String((c.approval as Record<string, unknown>).decidedAt)).toLocaleDateString('vi-VN')}</p>}
        </div>
      )}

      {/* STEP: Staff 2 hoàn thành sửa */}
      {isWarrantyStaff && c.status === 'processing' && (
        <div className="bg-white rounded-xl border-2 border-green-400 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Hoàn thành sửa chữa</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc đã thực hiện</label>
              <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={repairNote} onChange={e => setRepairNote(e.target.value)} placeholder="Đã thay màn hình, kiểm tra các chức năng..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sau sửa chữa</label>
              <ImageUpload images={resultImages} onImagesChange={setResultImages} maxImages={8} />
            </div>
            <button disabled={actionLoading}
              onClick={() => act(`/api/claims/${id}/complete`, { repairNote, resultImages })}
              className="w-full bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50">
              {actionLoading ? 'Đang lưu...' : 'Hoàn thành bảo hành'}
            </button>
          </div>
        </div>
      )}

      {/* Kết quả sửa chữa */}
      {c.processing && (c.processing as Record<string, unknown>).completedAt && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Kết quả sửa chữa</h2>
          <p className="text-sm text-gray-700 mb-3">{String((c.processing as Record<string, unknown>).repairNote || '')}</p>
          {((c.processing as Record<string, unknown>).resultImages as string[] || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {((c.processing as Record<string, unknown>).resultImages as string[]).map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noreferrer">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
