import mongoose, { Document, Model, Schema } from 'mongoose';

export type ClaimStatus = 'active' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'rejected' | 'expired';

export interface IWarrantyClaim extends Document {
  _id: mongoose.Types.ObjectId;
  claimCode: string;
  status: ClaimStatus;

  // Khách hàng
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    idCard?: string;
  };

  // Thiết bị
  device: {
    imei: string;
    brand: string;
    model: string;
    type: string;
    color?: string;
    purchasePrice?: number;
    purchaseDate: Date;
  };

  // Thời hạn bảo hành
  warrantyMonths: number;
  warrantyStartDate: Date;
  warrantyExpiry: Date;

  // Tình trạng ban đầu (Staff 1 - Seller upload khi bán)
  initialCondition: string;
  initialImages: string[];

  // Staff 1 tạo bảo hành
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdByEmail: string;

  // Tiếp nhận & kiểm tra (Staff 2)
  reception?: {
    receivedAt?: Date;
    receivedBy?: mongoose.Types.ObjectId;
    receivedByName?: string;
    conditionReport?: string;
    conditionImages?: string[];
    isEligible?: boolean;
    ineligibleReason?: string;
  };

  // Phê duyệt (Staff 1)
  approval?: {
    status: 'pending' | 'approved' | 'rejected';
    decidedBy?: mongoose.Types.ObjectId;
    decidedAt?: Date;
    note?: string;
  };

  // Xử lý sửa chữa (Staff 2)
  processing?: {
    startedAt?: Date;
    completedAt?: Date;
    repairNote?: string;
    resultImages?: string[];
  };

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarrantyClaimSchema = new Schema<IWarrantyClaim>(
  {
    claimCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'approved', 'processing', 'completed', 'rejected', 'expired'],
      default: 'active',
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String },
      idCard: { type: String },
    },
    device: {
      imei: { type: String, required: true },
      brand: { type: String, required: true },
      model: { type: String, required: true },
      type: { type: String, required: true },
      color: { type: String },
      purchasePrice: { type: Number },
      purchaseDate: { type: Date, required: true },
    },
    warrantyMonths: { type: Number, required: true, default: 12 },
    warrantyStartDate: { type: Date, required: true },
    warrantyExpiry: { type: Date, required: true },
    initialCondition: { type: String, required: true },
    initialImages: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String, required: true },
    createdByEmail: { type: String, required: true },
    reception: {
      receivedAt: { type: Date },
      receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      receivedByName: { type: String },
      conditionReport: { type: String },
      conditionImages: [{ type: String }],
      isEligible: { type: Boolean },
      ineligibleReason: { type: String },
    },
    approval: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'] },
      decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      decidedAt: { type: Date },
      note: { type: String },
    },
    processing: {
      startedAt: { type: Date },
      completedAt: { type: Date },
      repairNote: { type: String },
      resultImages: [{ type: String }],
    },
    notes: { type: String },
  },
  { timestamps: true }
);

WarrantyClaimSchema.index({ 'device.imei': 1 });
WarrantyClaimSchema.index({ status: 1 });
WarrantyClaimSchema.index({ createdBy: 1 });
WarrantyClaimSchema.index({ warrantyExpiry: 1 });

const WarrantyClaim: Model<IWarrantyClaim> =
  mongoose.models.WarrantyClaim ||
  mongoose.model<IWarrantyClaim>('WarrantyClaim', WarrantyClaimSchema);

export default WarrantyClaim;
