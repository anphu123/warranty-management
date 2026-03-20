'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReceptionForm } from '@/components/claims/ReceptionForm';
import { Search, Plus } from 'lucide-react';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface ExistingClaim {
  _id: string;
  claimCode: string;
  status: string;
  deviceInfo: { imei: string; brand: string; model: string };
  customer: { name: string; phone: string };
  createdAt: string;
}

export default function NewClaimPage() {
  const [imeiSearch, setImeiSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [existingClaims, setExistingClaims] = useState<ExistingClaim[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleSearch = async () => {
    if (!imeiSearch.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/claims?search=${imeiSearch}`);
      const data = await res.json();
      setExistingClaims(data.claims || []);
      setSearchDone(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateNew = () => {
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div>
        <PageHeader title="Tạo hồ sơ mới" description={`IMEI: ${imeiSearch}`} />
        <ReceptionForm defaultImei={imeiSearch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Tạo hồ sơ bảo hành mới" description="Tìm kiếm IMEI để kiểm tra lịch sử trước khi tạo mới" />

      <div className="max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <Label className="text-base font-medium">Tìm kiếm theo IMEI / Serial</Label>
            <p className="text-sm text-gray-500 mb-4 mt-1">
              Nhập IMEI hoặc serial number của thiết bị để kiểm tra lịch sử bảo hành
            </p>

            <div className="flex gap-3">
              <Input
                placeholder="VD: 356938035643809"
                value={imeiSearch}
                onChange={(e) => setImeiSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching || !imeiSearch.trim()}>
                <Search className="w-4 h-4 mr-2" />
                {searching ? 'Đang tìm...' : 'Tìm kiếm'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchDone && (
          <div className="mt-6">
            {existingClaims.length > 0 ? (
              <div>
                <h3 className="font-medium text-gray-800 mb-3">
                  Tìm thấy {existingClaims.length} hồ sơ liên quan:
                </h3>
                <div className="space-y-3">
                  {existingClaims.map((claim) => (
                    <Card key={claim._id} className="border border-orange-200 bg-orange-50">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link href={`/claims/${claim._id}`} className="font-semibold text-blue-600 hover:underline">
                                {claim.claimCode}
                              </Link>
                              <ClaimStatusBadge status={claim.status} />
                            </div>
                            <p className="text-sm text-gray-700">
                              IMEI: <span className="font-mono">{claim.deviceInfo.imei}</span>
                            </p>
                            <p className="text-sm text-gray-700">
                              {claim.deviceInfo.brand} {claim.deviceInfo.model}
                            </p>
                            <p className="text-sm text-gray-600">
                              KH: {claim.customer.name} | {claim.customer.phone}
                            </p>
                            <p className="text-xs text-gray-500">Ngày tạo: {formatDate(claim.createdAt)}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/claims/${claim._id}`}>Xem chi tiết</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <p className="text-sm text-gray-600">Vẫn muốn tạo hồ sơ mới cho IMEI này?</p>
                  <Button variant="outline" onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo mới
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Chưa có hồ sơ nào</h3>
                <p className="text-sm text-gray-500 mb-4">
                  IMEI <span className="font-mono font-medium">{imeiSearch}</span> chưa có hồ sơ bảo hành nào
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo hồ sơ mới
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
