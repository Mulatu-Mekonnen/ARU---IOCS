import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

export async function GET(request) {
  const auth = verifyRole(request, ["ADMIN", "HEAD", "VIEWER", "STAFF"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const offices = await prisma.office.findMany({
    include: { users: true },
  });
  return NextResponse.json(offices);
}

export async function POST(request) {
  const auth = verifyRole(request, ["ADMIN"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const office = await prisma.office.create({
    data: {
      name: body.name,
    },
  });
  return NextResponse.json(office);
}