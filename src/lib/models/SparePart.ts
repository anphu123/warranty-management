import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISparePart extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  category: 'ĐIỆN THOẠI' | 'LAPTOP' | 'SMARTWATCH' | 'TABLET';
  brand: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SparePartSchema = new Schema<ISparePart>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['ĐIỆN THOẠI', 'LAPTOP', 'SMARTWATCH', 'TABLET'],
      required: true,
    },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SparePart: Model<ISparePart> =
  mongoose.models.SparePart || mongoose.model<ISparePart>('SparePart', SparePartSchema);

export default SparePart;
