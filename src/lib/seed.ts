import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
import mongoose from 'mongoose';
import User from './models/User';
import WarrantyClaim from './models/WarrantyClaim';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/warranty_db';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await WarrantyClaim.deleteMany({});
  console.log('Cleared existing data');

  const users = await User.create([
    { name: 'Admin Refurbest', email: 'admin@refurbest.vn', password: 'Admin@123456', role: 'admin', isActive: true },
    { name: 'Nguyễn Văn Seller', email: 'seller@refurbest.vn', password: 'Seller@123456', role: 'seller', isActive: true },
    { name: 'Trần Thị Warranty', email: 'warranty@refurbest.vn', password: 'Warranty@123456', role: 'warranty_staff', isActive: true },
  ]);
  console.log('Created', users.length, 'users');

  const seller = users[1];
  const warrantyStaff = users[2];

  const now = new Date();
  const addMonths = (d: Date, m: number) => { const r = new Date(d); r.setMonth(r.getMonth() + m); return r; };

  const claims = await WarrantyClaim.create([
    {
      claimCode: 'RB-250320-00001',
      status: 'active',
      customer: { name: 'Phạm Văn An', phone: '0901234567', email: 'an@gmail.com', address: '123 Nguyễn Huệ, Q1, TP.HCM' },
      device: { imei: '356938035643809', brand: 'Apple', model: 'iPhone 15 Pro Max', type: 'Điện thoại', color: 'Natural Titanium', purchasePrice: 33990000, purchaseDate: now },
      warrantyMonths: 12, warrantyStartDate: now, warrantyExpiry: addMonths(now, 12),
      initialCondition: 'Máy mới 100%, nguyên seal, đầy đủ phụ kiện',
      initialImages: [], createdBy: seller._id, createdByName: seller.name, createdByEmail: seller.email,
    },
    {
      claimCode: 'RB-250319-00002',
      status: 'pending_approval',
      customer: { name: 'Lê Thị Bình', phone: '0912345678', email: 'binh@gmail.com', address: '456 Lê Lợi, Q3, TP.HCM' },
      device: { imei: '490154203237518', brand: 'Samsung', model: 'Galaxy S24 Ultra', type: 'Điện thoại', color: 'Titanium Black', purchasePrice: 29990000, purchaseDate: new Date(Date.now() - 30 * 86400000) },
      warrantyMonths: 12, warrantyStartDate: new Date(Date.now() - 30 * 86400000), warrantyExpiry: addMonths(new Date(), 11),
      initialCondition: 'Máy mới, có dán màn hình', initialImages: [],
      createdBy: seller._id, createdByName: seller.name, createdByEmail: seller.email,
      reception: { receivedAt: now, receivedBy: warrantyStaff._id, receivedByName: warrantyStaff.name, conditionReport: 'Màn hình bị đen 1 góc nhỏ, có thể do lỗi phần cứng', conditionImages: [], isEligible: true },
      approval: { status: 'pending' },
    },
    {
      claimCode: 'RB-250310-00003',
      status: 'completed',
      customer: { name: 'Trần Minh Cường', phone: '0923456789', address: '789 Điện Biên Phủ, Bình Thạnh' },
      device: { imei: '358765043563789', brand: 'Xiaomi', model: 'Redmi Note 13 Pro', type: 'Điện thoại', color: 'Aurora Purple', purchasePrice: 8990000, purchaseDate: new Date(Date.now() - 60 * 86400000) },
      warrantyMonths: 12, warrantyStartDate: new Date(Date.now() - 60 * 86400000), warrantyExpiry: addMonths(new Date(), 10),
      initialCondition: 'Máy mới, nguyên hộp', initialImages: [],
      createdBy: seller._id, createdByName: seller.name, createdByEmail: seller.email,
      reception: { receivedAt: new Date(Date.now() - 5 * 86400000), receivedBy: warrantyStaff._id, receivedByName: warrantyStaff.name, conditionReport: 'Pin chai, sạc rất chậm', isEligible: true, conditionImages: [] },
      approval: { status: 'approved', decidedBy: seller._id, decidedAt: new Date(Date.now() - 4 * 86400000), note: 'Đồng ý bảo hành' },
      processing: { startedAt: new Date(Date.now() - 3 * 86400000), completedAt: new Date(Date.now() - 1 * 86400000), repairNote: 'Đã thay pin mới', resultImages: [] },
    },
  ]);
  console.log('Created', claims.length, 'warranty claims');

  console.log('\n=== SEED COMPLETED ===');
  console.log('Admin: admin@refurbest.vn / Admin@123456');
  console.log('Seller (Staff 1): seller@refurbest.vn / Seller@123456');
  console.log('Warranty Staff (Staff 2): warranty@refurbest.vn / Warranty@123456');

  await mongoose.disconnect();
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
