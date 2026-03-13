import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const auth = verifyRole(req, ["ADMIN"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const office = await prisma.office.update({
    where: { id: params.id },
    data: {
      name: body.name,
    },
  });
  return NextResponse.json(office);
}

export async function DELETE(req, { params }) {
  const auth = verifyRole(req, ["ADMIN"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await prisma.office.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}