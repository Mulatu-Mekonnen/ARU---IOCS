import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    const [totalAgendas, totalUsers, totalOffices] = await Promise.all([
      prisma.agenda.count(),
      prisma.user.count(),
      prisma.office.count(),
    ]);

    const pendingAgendas = await prisma.agenda.count({ where: { status: "PENDING" } });
    const approvedAgendas = await prisma.agenda.count({ where: { status: "APPROVED" } });
    const rejectedAgendas = await prisma.agenda.count({ where: { status: "REJECTED" } });

    const recentReports = await prisma.agenda.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdBy: { select: { name: true } },
      },
    });

    const reportRows = recentReports.map((item) => ({
      id: item.id,
      name: item.title,
      createdAt: item.updatedAt.toISOString().split("T")[0],
      owner: item.createdBy?.name || "System",
    }));

    return NextResponse.json({
      summary: {
        totalAgendas,
        totalUsers,
        totalOffices,
        pendingAgendas,
        approvedAgendas,
        rejectedAgendas,
      },
      recentReports: reportRows,
    });
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}
