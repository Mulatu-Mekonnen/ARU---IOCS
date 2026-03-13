import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { verifyRole } from "@/lib/adminGuard";

const prisma = new PrismaClient();

export async function GET(request) {
  const auth = verifyRole(request, ["ADMIN", "HEAD"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let users;
  if (auth.user.role === "ADMIN") {
    users = await prisma.user.findMany({
      include: { office: true },
    });
  } else {
    // HEAD sees only users in own office
    const me = await prisma.user.findUnique({ where: { id: auth.user.id } });
    users = await prisma.user.findMany({
      where: { officeId: me?.officeId },
      include: { office: true },
    });
  }

  return NextResponse.json(users);
}

export async function POST(request) {
  const auth = verifyRole(request, ["ADMIN"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const hashed = await bcrypt.hash(body.password || "password123", 10);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashed,
      role: body.role || "STAFF",
      active: body.active ?? true,
      officeId: body.officeId || null,
    },
  });

  return NextResponse.json(user);
}