import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
import mongoose from 'mongoose';
import User from './models/User';
import SparePart from './models/SparePart';
import DamageSymptom from './models/DamageSymptom';
import WarrantyClaim from './models/WarrantyClaim';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/warranty_db';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    SparePart.deleteMany({}),
    DamageSymptom.deleteMany({}),
    WarrantyClaim.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Seed Users
  const users = await User.create([
    {
      name: 'Admin GlobalSafe',
      email: 'admin@globalsafe.vn',
      password: 'Admin@123456',
      role: 'admin',
      centerName: 'Trụ sở chính',
      isActive: true,
    },
    {
      name: 'Nguyễn Văn Bảo',
      email: 'staff@ttbh.vn',
      password: 'Staff@123456',
      role: 'staff',
      centerId: 'CENTER-001',
      centerName: 'Trung tâm Hà Nội',
      isActive: true,
    },
    {
      name: 'Trần Thị Manager',
      email: 'manager@globalsafe.vn',
      password: 'Manager@123456',
      role: 'manager',
      centerName: 'Trung tâm HCM',
      isActive: true,
    },
  ]);
  console.log(`Created ${users.length} users`);

  // Seed Spare Parts
  const parts = await SparePart.create([
    { code: 'DT-AP-001', name: 'Màn hình iPhone 15 Pro', category: 'ĐIỆN THOẠI', brand: 'APPLE', price: 4500000, isActive: true },
    { code: 'DT-AP-002', name: 'Pin iPhone 15 Pro', category: 'ĐIỆN THOẠI', brand: 'APPLE', price: 800000, isActive: true },
    { code: 'DT-AP-003', name: 'Cổng sạc iPhone 15', category: 'ĐIỆN THOẠI', brand: 'APPLE', price: 350000, isActive: true },
    { code: 'DT-AP-004', name: 'Màn hình iPhone 14', category: 'ĐIỆN THOẠI', brand: 'APPLE', price: 3200000, isActive: true },
    { code: 'DT-SS-001', name: 'Màn hình Samsung S24 Ultra', category: 'ĐIỆN THOẠI', brand: 'SAMSUNG', price: 3800000, isActive: true },
    { code: 'DT-SS-002', name: 'Pin Samsung Galaxy A54', category: 'ĐIỆN THOẠI', brand: 'SAMSUNG', price: 450000, isActive: true },
    { code: 'DT-SS-003', name: 'Nắp lưng Samsung S23', category: 'ĐIỆN THOẠI', brand: 'SAMSUNG', price: 280000, isActive: true },
    { code: 'DT-XI-001', name: 'Màn hình Xiaomi 14', category: 'ĐIỆN THOẠI', brand: 'XIAOMI', price: 2500000, isActive: true },
    { code: 'LT-AP-001', name: 'Pin MacBook Air M2', category: 'LAPTOP', brand: 'APPLE', price: 2800000, isActive: true },
    { code: 'LT-AP-002', name: 'Bàn phím MacBook Pro 14"', category: 'LAPTOP', brand: 'APPLE', price: 3500000, isActive: true },
    { code: 'LT-DL-001', name: 'Pin Dell XPS 15', category: 'LAPTOP', brand: 'DELL', price: 1800000, isActive: true },
    { code: 'LT-HP-001', name: 'Màn hình HP Spectre x360', category: 'LAPTOP', brand: 'HP', price: 4200000, isActive: true },
    { code: 'SW-AP-001', name: 'Màn hình Apple Watch Series 9', category: 'SMARTWATCH', brand: 'APPLE', price: 1500000, isActive: true },
    { code: 'TB-AP-001', name: 'Màn hình iPad Pro 12.9"', category: 'TABLET', brand: 'APPLE', price: 5500000, isActive: true },
    { code: 'TB-SS-001', name: 'Pin Samsung Galaxy Tab S9', category: 'TABLET', brand: 'SAMSUNG', price: 650000, isActive: true },
  ]);
  console.log(`Created ${parts.length} spare parts`);

  // Seed Damage Symptoms
  const symptoms = await DamageSymptom.create([
    { name: 'Màn hình vỡ', category: 'Màn hình', isActive: true },
    { name: 'Màn hình bị sọc dọc', category: 'Màn hình', isActive: true },
    { name: 'Màn hình không hiển thị', category: 'Màn hình', isActive: true },
    { name: 'Cảm ứng không hoạt động', category: 'Màn hình', isActive: true },
    { name: 'Pin chai, tụt nhanh', category: 'Pin', isActive: true },
    { name: 'Không nhận sạc', category: 'Pin/Sạc', isActive: true },
    { name: 'Máy không lên nguồn', category: 'Nguồn', isActive: true },
    { name: 'Camera trước bị mờ', category: 'Camera', isActive: true },
    { name: 'Camera sau bị hỏng', category: 'Camera', isActive: true },
    { name: 'Loa ngoài không có âm thanh', category: 'Âm thanh', isActive: true },
    { name: 'Mic không hoạt động', category: 'Âm thanh', isActive: true },
    { name: 'Nút nguồn bị kẹt', category: 'Phím', isActive: true },
    { name: 'Mất wifi/bluetooth', category: 'Kết nối', isActive: true },
    { name: 'Vỏ máy bị trầy xước', category: 'Vỏ máy', isActive: true },
    { name: 'Máy bị rơi vỡ', category: 'Vật lý', isActive: true },
  ]);
  console.log(`Created ${symptoms.length} damage symptoms`);

  // Seed Claims
  const adminUser = users[0];
  const staffUser = users[1];

  const claims = await WarrantyClaim.create([
    {
      claimCode: 'GSC-260319-00001',
      status: 'reception',
      deviceInfo: { imei: '356938035643809', brand: 'APPLE', model: 'iPhone 15 Pro Max', purchaseDate: new Date('2024-01-15'), insuranceDate: new Date('2024-01-20'), price: 28000000 },
      customer: { name: 'Nguyễn Văn An', idCard: '036094123456', phone: '0912345678', email: 'an.nguyen@gmail.com', address: '123 Nguyễn Huệ', province: 'TP. Hồ Chí Minh' },
      insuranceInfo: { contractCode: 'HD-2024-001', insuranceType: 'repair', policyNumber: 'POL-001' },
      reception: { receivedFrom: 'direct', receivedDate: new Date(), receivedBy: staffUser.name, condition: 'Màn hình vỡ góc trên phải', notes: 'Khách hàng yêu cầu sửa gấp' },
      createdBy: staffUser.email,
    },
    {
      claimCode: 'GSC-260318-00001',
      status: 'overdue',
      deviceInfo: { imei: '490154203237518', brand: 'SAMSUNG', model: 'Galaxy S24 Ultra', purchaseDate: new Date('2023-12-01'), insuranceDate: new Date('2023-12-05'), price: 32000000 },
      customer: { name: 'Trần Thị Bình', idCard: '079095234567', phone: '0987654321', email: 'binh.tran@yahoo.com', address: '45 Lê Văn Lương', province: 'Hà Nội' },
      insuranceInfo: { contractCode: 'HD-2024-002', insuranceType: 'replacement', policyNumber: 'POL-002' },
      reception: { receivedFrom: 'shipping', receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), receivedBy: adminUser.name, condition: 'Pin tụt nhanh, loa không hoạt động' },
      createdBy: adminUser.email,
    },
    {
      claimCode: 'GSC-260317-00001',
      status: 'pending_approval',
      deviceInfo: { imei: '012345678901234', brand: 'APPLE', model: 'iPhone 14 Pro', purchaseDate: new Date('2023-10-20'), insuranceDate: new Date('2023-10-25'), price: 22000000 },
      customer: { name: 'Lê Hoàng Cường', idCard: '052094345678', phone: '0977123456', address: '78 Trần Hưng Đạo', province: 'Đà Nẵng' },
      insuranceInfo: { contractCode: 'HD-2024-003', insuranceType: 'repair', policyNumber: 'POL-003' },
      reception: { receivedFrom: 'direct', receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), receivedBy: staffUser.name, condition: 'Không nhận sạc, màn hình sọc' },
      diagnosis: { mainSymptom: 'Không nhận sạc', otherSymptoms: ['Màn hình sọc dọc'], remediation: 'Thay cổng sạc và màn hình', processingPlan: 'Đặt linh kiện trong 2-3 ngày', conclusion: 'repair_parts', diagnosedBy: staffUser.name },
      quote: { parts: [{ partCode: 'DT-AP-003', partName: 'Cổng sạc iPhone 15', quantity: 1, unitPrice: 350000, totalPrice: 350000 }, { partCode: 'DT-AP-004', partName: 'Màn hình iPhone 14', quantity: 1, unitPrice: 3200000, totalPrice: 3200000 }], totalAmount: 3550000, laborCost: 200000, grandTotal: 3750000, quotedBy: staffUser.name, quotedByPhone: '0977123456', sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      createdBy: staffUser.email,
    },
    {
      claimCode: 'GSC-260316-00001',
      status: 'processing',
      deviceInfo: { imei: '867988034591942', brand: 'SAMSUNG', model: 'Galaxy A54 5G', purchaseDate: new Date('2023-08-10'), insuranceDate: new Date('2023-08-15'), price: 8500000 },
      customer: { name: 'Phạm Thị Dung', idCard: '030096456789', phone: '0966789012', email: 'dung.pham@gmail.com', address: '99 Đinh Tiên Hoàng', province: 'Hà Nội' },
      insuranceInfo: { contractCode: 'HD-2024-004', insuranceType: 'repair' },
      reception: { receivedFrom: 'direct', receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), receivedBy: adminUser.name, condition: 'Màn hình đen, không lên nguồn' },
      diagnosis: { mainSymptom: 'Không lên nguồn', otherSymptoms: ['Màn hình đen'], remediation: 'Thay pin và màn hình', conclusion: 'repair_parts', diagnosedBy: adminUser.name },
      quote: { parts: [{ partCode: 'DT-SS-002', partName: 'Pin Samsung Galaxy A54', quantity: 1, unitPrice: 450000, totalPrice: 450000 }, { partCode: 'DT-SS-001', partName: 'Màn hình Samsung S24 Ultra', quantity: 1, unitPrice: 3800000, totalPrice: 3800000 }], totalAmount: 4250000, laborCost: 150000, grandTotal: 4400000, quotedBy: adminUser.name, sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), approvedBy: 'Admin' },
      repair: { startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      createdBy: adminUser.email,
    },
    {
      claimCode: 'GSC-260310-00001',
      status: 'completed',
      deviceInfo: { imei: '359556102088787', brand: 'APPLE', model: 'MacBook Air M2', purchaseDate: new Date('2023-06-01'), insuranceDate: new Date('2023-06-10'), price: 32000000 },
      customer: { name: 'Vũ Minh Đức', idCard: '001093567890', phone: '0933456789', email: 'duc.vu@company.com', address: '12 Hàng Bông', province: 'Hà Nội' },
      insuranceInfo: { contractCode: 'HD-2024-005', insuranceType: 'extended_warranty', policyNumber: 'POL-005' },
      reception: { receivedFrom: 'shipping', receivedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), receivedBy: staffUser.name, condition: 'Pin chai, chỉ dùng được 2h' },
      diagnosis: { mainSymptom: 'Pin chai', remediation: 'Thay pin mới', conclusion: 'repair_parts', diagnosedBy: staffUser.name },
      quote: { parts: [{ partCode: 'LT-AP-001', partName: 'Pin MacBook Air M2', quantity: 1, unitPrice: 2800000, totalPrice: 2800000 }], totalAmount: 2800000, laborCost: 300000, grandTotal: 3100000, quotedBy: staffUser.name, sentAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), approvedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000) },
      repair: { startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), repairNotes: 'Đã thay pin mới, test OK' },
      completion: { completionStatus: 'completed_insurance', deliveryType: 'shipping', shippingInfo: { carrier: 'GHTK', trackingCode: 'GHTK123456789', weight: 2500, fromAddress: 'Hà Nội', toAddress: '12 Hàng Bông, Hà Nội' }, returnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), returnNotes: 'Đã giao máy, khách xác nhận tốt' },
      createdBy: staffUser.email,
    },
    {
      claimCode: 'GSC-260315-00001',
      status: 'processing',
      deviceInfo: { imei: '356730081803383', brand: 'XIAOMI', model: 'Xiaomi 14 Ultra', purchaseDate: new Date('2024-02-01'), insuranceDate: new Date('2024-02-05'), price: 18000000 },
      customer: { name: 'Hoàng Thanh Hà', idCard: '048090678901', phone: '0944567890', address: '56 Nguyễn Trãi', province: 'TP. Hồ Chí Minh' },
      insuranceInfo: { contractCode: 'HD-2024-006', insuranceType: 'repair' },
      reception: { receivedFrom: 'direct', receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), receivedBy: staffUser.name, condition: 'Camera sau bị mờ' },
      diagnosis: { mainSymptom: 'Camera sau bị hỏng', conclusion: 'repair_parts', diagnosedBy: staffUser.name },
      createdBy: staffUser.email,
    },
  ]);
  console.log(`Created ${claims.length} warranty claims`);

  console.log('\n=== SEED COMPLETED ===');
  console.log('Admin: admin@globalsafe.vn / Admin@123456');
  console.log('Staff: staff@ttbh.vn / Staff@123456');
  console.log('Manager: manager@globalsafe.vn / Manager@123456');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
