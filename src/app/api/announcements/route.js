import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
      },
    });

    const formatted = announcements.map((ann) => ({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      createdAt: ann.createdAt,
      author: ann.author.name,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}