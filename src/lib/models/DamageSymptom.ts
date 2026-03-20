import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDamageSymptom extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DamageSymptomSchema = new Schema<IDamageSymptom>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DamageSymptom: Model<IDamageSymptom> =
  mongoose.models.DamageSymptom ||
  mongoose.model<IDamageSymptom>('DamageSymptom', DamageSymptomSchema);

export default DamageSymptom;
