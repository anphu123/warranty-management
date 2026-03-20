import mongoose, { Document, Model, Schema } from 'mongoose';

export type NotificationType = 'reception_submitted' | 'claim_approved' | 'claim_rejected' | 'claim_completed';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;       // người nhận
  type: NotificationType;
  title: string;
  message: string;
  claimId: mongoose.Types.ObjectId;
  claimCode: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['reception_submitted', 'claim_approved', 'claim_rejected', 'claim_completed'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    claimId: { type: Schema.Types.ObjectId, ref: 'WarrantyClaim', required: true },
    claimCode: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
