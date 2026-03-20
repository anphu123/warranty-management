import mongoose, { Document, Model, Schema } from 'mongoose';

export type ClaimStatus = 'reception' | 'overdue' | 'pending_approval' | 'processing' | 'completed';

export interface IWarrantyClaim extends Document {
  _id: mongoose.Types.ObjectId;
  claimCode: string;
  status: ClaimStatus;
  deviceInfo: {
    imei: string;
    brand: string;
    model: string;
    purchaseDate?: Date;
    insuranceDate?: Date;
    price?: number;
  };
  customer: {
    name: string;
    idCard?: string;
    phone: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    ward?: string;
  };
  insuranceInfo: {
    contractCode?: string;
    insuranceType: 'repair' | 'replacement' | 'extended_warranty';
    policyNumber?: string;
  };
  reception: {
    receivedFrom: 'direct' | 'shipping';
    receivedDate: Date;
    receivedBy?: string;
    condition?: string;
    notes?: string;
  };
  diagnosis?: {
    mainSymptom?: string;
    otherSymptoms?: string[];
    remediation?: string;
    processingPlan?: string;
    conclusion?: 'repair_parts' | 'replace_device' | 'return_to_customer';
    diagnosedBy?: string;
    diagnosisImages?: string[];
  };
  quote?: {
    parts?: Array<{
      partCode: string;
      partName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    totalAmount?: number;
    laborCost?: number;
    grandTotal?: number;
    quotedBy?: string;
    quotedByPhone?: string;
    sentAt?: Date;
    approvedAt?: Date;
    approvedBy?: string;
  };
  repair?: {
    startedAt?: Date;
    completedAt?: Date;
    parts?: Array<{
      partCode: string;
      partName: string;
      doCode?: string;
      doDate?: Date;
      quantity: number;
      unitPrice: number;
    }>;
    afterRepairImages?: string[];
    repairNotes?: string;
  };
  completion?: {
    completionStatus?: 'completed_insurance' | 'completed_service';
    deliveryType?: 'direct' | 'shipping';
    shippingInfo?: {
      carrier?: string;
      trackingCode?: string;
      weight?: number;
      fromAddress?: string;
      toAddress?: string;
    };
    returnedAt?: Date;
    returnNotes?: string;
  };
  documents?: {
    claimForm?: string;
    jobsheet?: string;
    jobcard?: string;
    repairReceipt?: string;
  };
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WarrantyClaimSchema = new Schema<IWarrantyClaim>(
  {
    claimCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['reception', 'overdue', 'pending_approval', 'processing', 'completed'],
      default: 'reception',
    },
    deviceInfo: {
      imei: { type: String, required: true },
      brand: { type: String, required: true },
      model: { type: String, required: true },
      purchaseDate: { type: Date },
      insuranceDate: { type: Date },
      price: { type: Number },
    },
    customer: {
      name: { type: String, required: true },
      idCard: { type: String },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String },
      province: { type: String },
      district: { type: String },
      ward: { type: String },
    },
    insuranceInfo: {
      contractCode: { type: String },
      insuranceType: {
        type: String,
        enum: ['repair', 'replacement', 'extended_warranty'],
        default: 'repair',
      },
      policyNumber: { type: String },
    },
    reception: {
      receivedFrom: { type: String, enum: ['direct', 'shipping'], default: 'direct' },
      receivedDate: { type: Date, default: Date.now },
      receivedBy: { type: String },
      condition: { type: String },
      notes: { type: String },
    },
    diagnosis: {
      mainSymptom: { type: String },
      otherSymptoms: [{ type: String }],
      remediation: { type: String },
      processingPlan: { type: String },
      conclusion: {
        type: String,
        enum: ['repair_parts', 'replace_device', 'return_to_customer'],
      },
      diagnosedBy: { type: String },
      diagnosisImages: [{ type: String }],
    },
    quote: {
      parts: [
        {
          partCode: { type: String },
          partName: { type: String },
          quantity: { type: Number },
          unitPrice: { type: Number },
          totalPrice: { type: Number },
        },
      ],
      totalAmount: { type: Number },
      laborCost: { type: Number },
      grandTotal: { type: Number },
      quotedBy: { type: String },
      quotedByPhone: { type: String },
      sentAt: { type: Date },
      approvedAt: { type: Date },
      approvedBy: { type: String },
    },
    repair: {
      startedAt: { type: Date },
      completedAt: { type: Date },
      parts: [
        {
          partCode: { type: String },
          partName: { type: String },
          doCode: { type: String },
          doDate: { type: Date },
          quantity: { type: Number },
          unitPrice: { type: Number },
        },
      ],
      afterRepairImages: [{ type: String }],
      repairNotes: { type: String },
    },
    completion: {
      completionStatus: {
        type: String,
        enum: ['completed_insurance', 'completed_service'],
      },
      deliveryType: { type: String, enum: ['direct', 'shipping'] },
      shippingInfo: {
        carrier: { type: String },
        trackingCode: { type: String },
        weight: { type: Number },
        fromAddress: { type: String },
        toAddress: { type: String },
      },
      returnedAt: { type: Date },
      returnNotes: { type: String },
    },
    documents: {
      claimForm: { type: String },
      jobsheet: { type: String },
      jobcard: { type: String },
      repairReceipt: { type: String },
    },
    createdBy: { type: String },
  },
  { timestamps: true }
);

WarrantyClaimSchema.index({ claimCode: 1 });
WarrantyClaimSchema.index({ 'deviceInfo.imei': 1 });
WarrantyClaimSchema.index({ status: 1 });
WarrantyClaimSchema.index({ createdAt: -1 });

const WarrantyClaim: Model<IWarrantyClaim> =
  mongoose.models.WarrantyClaim ||
  mongoose.model<IWarrantyClaim>('WarrantyClaim', WarrantyClaimSchema);

export default WarrantyClaim;
