import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';

export async function GET() {
  try {
    await connectDB();

    const [reception, overdue, pending_approval, processing, completed, recentClaims] =
      await Promise.all([
        WarrantyClaim.countDocuments({ status: 'reception' }),
        WarrantyClaim.countDocuments({ status: 'overdue' }),
        WarrantyClaim.countDocuments({ status: 'pending_approval' }),
        WarrantyClaim.countDocuments({ status: 'processing' }),
        WarrantyClaim.countDocuments({ status: 'completed' }),
        WarrantyClaim.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select('claimCode status device customer createdAt updatedAt')
          .lean(),
      ]);

    return NextResponse.json({
      stats: { reception, overdue, pending_approval, processing, completed },
      recentClaims,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
