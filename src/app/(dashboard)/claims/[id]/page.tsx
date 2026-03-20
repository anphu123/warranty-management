'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { DiagnosisForm } from '@/components/claims/DiagnosisForm';
import { QuoteForm } from '@/components/claims/QuoteForm';
import { RepairForm } from '@/components/claims/RepairForm';
import { CompletionForm } from '@/components/claims/CompletionForm';
import { formatDate, formatDateTime, formatCurrency, INSURANCE_TYPE_LABELS } from '@/lib/utils';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import type { IWarrantyClaim } from '@/lib/models/WarrantyClaim';

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<IWarrantyClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reception');

  const fetchClaim = useCallback(async () => {
    try {
      const res = await fetch(`/api/claims/${params.id}`);
      if (!res.ok) {
        router.push('/claims');
        return;
      }
      const data = await res.json();
      setClaim(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchClaim();
  }, [fetchClaim]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!claim) return null;

  return (
    <div>
      <PageHeader
        title={`Hồ sơ ${claim.claimCode}`}
        description={`${claim.deviceInfo.brand} ${claim.deviceInfo.model} - IMEI: ${claim.deviceInfo.imei}`}
        actions={
          <div className="flex items-center gap-3">
            <ClaimStatusBadge status={claim.status} />
            <Button variant="outline" size="sm" asChild>
              <Link href="/claims">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              In
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="reception">1. Tiếp nhận</TabsTrigger>
          <TabsTrigger value="diagnosis">2. Chẩn đoán</TabsTrigger>
          <TabsTrigger value="quote">3. Báo giá</TabsTrigger>
          <TabsTrigger value="repair">4. Sửa chữa</TabsTrigger>
          <TabsTrigger value="completion">5. Hoàn thiện</TabsTrigger>
          <TabsTrigger value="return">6. Trả máy</TabsTrigger>
        </TabsList>

        {/* Tab 1: Reception */}
        <TabsContent value="reception">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin thiết bị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="IMEI" value={claim.deviceInfo.imei} mono />
                <InfoRow label="Thương hiệu" value={claim.deviceInfo.brand} />
                <InfoRow label="Model" value={claim.deviceInfo.model} />
                <InfoRow label="Ngày mua" value={formatDate(claim.deviceInfo.purchaseDate)} />
                <InfoRow label="Ngày BH" value={formatDate(claim.deviceInfo.insuranceDate)} />
                <InfoRow label="Giá trị" value={formatCurrency(claim.deviceInfo.price)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Họ tên" value={claim.customer.name} />
                <InfoRow label="CMND/CCCD" value={claim.customer.idCard} />
                <InfoRow label="Điện thoại" value={claim.customer.phone} />
                <InfoRow label="Email" value={claim.customer.email} />
                <InfoRow label="Địa chỉ" value={claim.customer.address} />
                <InfoRow label="Tỉnh/TP" value={claim.customer.province} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin bảo hiểm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Mã hợp đồng" value={claim.insuranceInfo?.contractCode} />
                <InfoRow label="Loại BH" value={INSURANCE_TYPE_LABELS[claim.insuranceInfo?.insuranceType || ''] || claim.insuranceInfo?.insuranceType} />
                <InfoRow label="Số hợp đồng" value={claim.insuranceInfo?.policyNumber} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin tiếp nhận</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Hình thức" value={claim.reception?.receivedFrom === 'direct' ? 'Trực tiếp' : 'Vận chuyển'} />
                <InfoRow label="Ngày tiếp nhận" value={formatDate(claim.reception?.receivedDate)} />
                <InfoRow label="Người tiếp nhận" value={claim.reception?.receivedBy} />
                <InfoRow label="Tình trạng" value={claim.reception?.condition} />
                <InfoRow label="Ghi chú" value={claim.reception?.notes} />
                <InfoRow label="Tạo lúc" value={formatDateTime(claim.createdAt)} />
                <InfoRow label="Tạo bởi" value={claim.createdBy} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Diagnosis */}
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chẩn đoán thiết bị</CardTitle>
            </CardHeader>
            <CardContent>
              <DiagnosisForm
                claimId={claim._id.toString()}
                defaultValues={{
                  mainSymptom: claim.diagnosis?.mainSymptom,
                  otherSymptoms: claim.diagnosis?.otherSymptoms?.join(', '),
                  remediation: claim.diagnosis?.remediation,
                  processingPlan: claim.diagnosis?.processingPlan,
                  conclusion: claim.diagnosis?.conclusion,
                  diagnosedBy: claim.diagnosis?.diagnosedBy,
                  diagnosisImages: claim.diagnosis?.diagnosisImages,
                }}
                onSaved={fetchClaim}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Quote */}
        <TabsContent value="quote">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Báo giá linh kiện</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteForm
                claimId={claim._id.toString()}
                defaultValues={{
                  parts: claim.quote?.parts,
                  laborCost: claim.quote?.laborCost,
                  quotedBy: claim.quote?.quotedBy,
                  quotedByPhone: claim.quote?.quotedByPhone,
                  sentAt: claim.quote?.sentAt?.toString(),
                  approvedAt: claim.quote?.approvedAt?.toString(),
                }}
                onSaved={fetchClaim}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Repair */}
        <TabsContent value="repair">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sửa chữa & Kiểm tra</CardTitle>
            </CardHeader>
            <CardContent>
              <RepairForm
                claimId={claim._id.toString()}
                defaultValues={{
                  startedAt: claim.repair?.startedAt?.toString(),
                  completedAt: claim.repair?.completedAt?.toString(),
                  parts: claim.repair?.parts?.map(p => ({
                    partCode: p.partCode,
                    partName: p.partName,
                    doCode: p.doCode || '',
                    doDate: p.doDate ? new Date(p.doDate).toISOString().split('T')[0] : '',
                    quantity: p.quantity,
                    unitPrice: p.unitPrice,
                  })),
                  afterRepairImages: claim.repair?.afterRepairImages,
                  repairNotes: claim.repair?.repairNotes,
                }}
                onSaved={fetchClaim}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Completion */}
        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hoàn thiện hồ sơ</CardTitle>
            </CardHeader>
            <CardContent>
              <CompletionForm
                claimId={claim._id.toString()}
                defaultValues={{
                  completionStatus: claim.completion?.completionStatus,
                  deliveryType: claim.completion?.deliveryType,
                  shippingInfo: claim.completion?.shippingInfo,
                  returnNotes: claim.completion?.returnNotes,
                }}
                onSaved={fetchClaim}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Return / Documents */}
        <TabsContent value="return">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trả máy & Tài liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claim.status === 'completed' ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">Hồ sơ đã hoàn thành</p>
                    <p className="text-green-700 text-sm mt-1">
                      Đã trả máy lúc: {formatDateTime(claim.completion?.returnedAt)}
                    </p>
                    {claim.completion?.returnNotes && (
                      <p className="text-green-700 text-sm">Ghi chú: {claim.completion.returnNotes}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">Vui lòng hoàn thiện các bước trước (bước 1-5) trước khi trả máy</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'claimForm', label: 'Phiếu yêu cầu bảo hành' },
                    { key: 'jobsheet', label: 'Jobsheet' },
                    { key: 'jobcard', label: 'Jobcard' },
                    { key: 'repairReceipt', label: 'Biên bản sửa chữa' },
                  ].map(({ key, label }) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      {claim.documents?.[key as keyof typeof claim.documents] ? (
                        <a
                          href={claim.documents[key as keyof typeof claim.documents]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Xem tài liệu
                        </a>
                      ) : (
                        <p className="text-gray-400 text-sm">Chưa có</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm text-gray-500 min-w-32 flex-shrink-0">{label}:</span>
      <span className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
    </div>
  );
}
