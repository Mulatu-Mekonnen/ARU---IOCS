import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const auth = verifyRole(request, ["VIEWER", "ADMIN", "HEAD", "STAFF"]);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const skip = (page - 1) * pageSize;

    const where = { status: 'ARCHIVED' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      // allow client-side status but viewer sees only READ/UNREAD via localStorage
    }

    const [agendas, total] = await Promise.all([
      prisma.agenda.findMany({
        where,
        include: { createdBy: true, senderOffice: true, receiverOffice: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.agenda.count({ where }),
    ]);

    return NextResponse.json({ agendas, total, page, pageSize });
  } catch (err) {
    console.error('VIEWER ARCHIVE ERROR', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
