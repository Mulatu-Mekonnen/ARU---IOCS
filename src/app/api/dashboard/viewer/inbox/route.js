import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const auth = verifyRole(request, ["VIEWER", "ADMIN", "HEAD", "STAFF"]);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const skip = (page - 1) * pageSize;

    // Viewer only sees APPROVED agendas
    const where = { status: 'APPROVED' };

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
    console.error('VIEWER INBOX ERROR', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
