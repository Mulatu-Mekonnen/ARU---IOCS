import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    const logs = await prisma.approvalHistory.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        actionBy: { select: { name: true, email: true } },
        agenda: { select: { title: true } },
      },
    });

    const formatted = logs.map((log) => ({
      id: log.id,
      timestamp: log.createdAt,
      user: log.actionBy?.email || log.actionBy?.name || "Unknown",
      action: log.action,
      details: `${log.agenda?.title || "Agenda"} - ${log.comment || "No details"}`,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}
