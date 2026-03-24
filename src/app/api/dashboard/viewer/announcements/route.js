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
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: { author: true },
    });

    const total = await prisma.announcement.count();

    return NextResponse.json({ announcements, total, page, pageSize });
  } catch (err) {
    console.error('VIEWER ANNOUNCEMENTS ERROR', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
