import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
      },
    });

    const formatted = announcements.map((ann) => ({
      id: ann.id,
      title: ann.title,
      body: ann.content,
      createdAt: ann.createdAt,
      author: ann.author.name,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request) {
  try {
    await roleGuard("ADMIN");
    const body = await request.json();

    // Assume author is the current admin user. For simplicity, hardcode or get from session.
    // In a real app, get from session.
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) {
      return NextResponse.json({ error: "No admin user found" }, { status: 400 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.body,
        authorId: adminUser.id,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    return NextResponse.json({
      id: newAnnouncement.id,
      title: newAnnouncement.title,
      body: newAnnouncement.content,
      createdAt: newAnnouncement.createdAt,
      author: newAnnouncement.author.name,
    });
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}
