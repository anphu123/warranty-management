import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';
import { auth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const { action, ...quoteData } = body;

    let updateData: Record<string, unknown> = {};

    if (action === 'send') {
      updateData = {
        quote: {
          ...quoteData,
          quotedBy: quoteData.quotedBy || session.user.name,
          sentAt: new Date(),
        },
        status: 'pending_approval',
      };
    } else if (action === 'approve') {
      updateData = {
        'quote.approvedAt': new Date(),
        'quote.approvedBy': session.user.name,
        status: 'processing',
      };
    } else {
      updateData = {
        quote: {
          ...quoteData,
          quotedBy: quoteData.quotedBy || session.user.name,
        },
      };
    }

    const claim = await WarrantyClaim.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!claim) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ' }, { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Quote update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
