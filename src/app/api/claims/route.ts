import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import WarrantyClaim from '@/lib/models/WarrantyClaim';
import { generateClaimCode } from '@/lib/server-utils';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { claimCode: { $regex: search, $options: 'i' } },
        { 'deviceInfo.imei': { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await WarrantyClaim.countDocuments(query);
    const claims = await WarrantyClaim.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ claims, total, page, limit });
  } catch (error) {
    console.error('GET claims error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const claimCode = await generateClaimCode();

    const claim = await WarrantyClaim.create({
      ...body,
      claimCode,
      status: 'reception',
      createdBy: session.user.email,
      reception: {
        ...body.reception,
        receivedBy: body.reception?.receivedBy || session.user.name,
        receivedDate: body.reception?.receivedDate || new Date(),
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error('POST claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
