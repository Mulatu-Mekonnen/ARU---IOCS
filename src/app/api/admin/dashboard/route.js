import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    const [totalUsers, totalOffices, totalAgendas] = await Promise.all([
      prisma.user.count(),
      prisma.office.count(),
      prisma.agenda.count(),
    ]);

    const pendingAgendas = await prisma.agenda.count({
      where: { status: "PENDING" },
    });
    const approvedAgendas = await prisma.agenda.count({
      where: { status: "APPROVED" },
    });
    const rejectedAgendas = await prisma.agenda.count({
      where: { status: "REJECTED" },
    });
    const forwardedAgendas = await prisma.agenda.count({
      where: { status: "FORWARDED" },
    });

    const statusGroups = await prisma.agenda.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    let officeGroups = [];
    try {
      const officeGroupsRaw = await prisma.agenda.groupBy({
        by: ["senderOfficeId"],
        _count: { id: true },
      });
      // fetch office names
      const officeIds = officeGroupsRaw
        .map((g) => g.senderOfficeId)
        .filter((id) => id !== null);
      const offices = await prisma.office.findMany({
        where: { id: { in: officeIds } },
        select: { id: true, name: true },
      });
      const officeMap = offices.reduce((acc, o) => {
        acc[o.id] = o.name;
        return acc;
      }, {});
      officeGroups = officeGroupsRaw.map((g) => ({
        ...g,
        name: g.senderOfficeId ? officeMap[g.senderOfficeId] || "-" : "-",
      }));
    } catch (err) {
      console.error("Office groups error:", err);
      // If column doesn't exist, leave officeGroups empty
    }

    // Recent activities
    const recentActivities = await Promise.all([
      // Recent agenda creations
      prisma.agenda.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { name: true } },
          senderOffice: { select: { name: true } },
        },
      }),
      // Recent approval history
      prisma.approvalHistory.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          actionBy: { select: { name: true } },
          agenda: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      // Recent user registrations
      prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      // Recent announcements
      prisma.announcement.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true } },
        },
      }),
    ]);

    // Combine and sort all activities
    const allActivities = [
      ...recentActivities[0].map(item => ({
        type: 'agenda_created',
        id: item.id,
        title: `New agenda: "${item.title}"`,
        description: `Created by ${item.createdBy?.name || 'Unknown'} from ${item.senderOffice?.name || 'Unknown office'}`,
        timestamp: item.createdAt,
        status: item.status,
      })),
      ...recentActivities[1].map(item => ({
        type: 'agenda_action',
        id: item.id,
        title: `Agenda ${item.action.toLowerCase()}: "${item.agenda?.title || 'Unknown'}"`,
        description: `By ${item.actionBy?.name || 'Unknown'}`,
        timestamp: item.createdAt,
        action: item.action,
      })),
      ...recentActivities[2].map(item => ({
        type: 'user_registered',
        id: item.id,
        title: `New user: ${item.name}`,
        description: `Role: ${item.role}`,
        timestamp: item.createdAt,
      })),
      ...recentActivities[3].map(item => ({
        type: 'announcement',
        id: item.id,
        title: `Announcement: "${item.title}"`,
        description: `By ${item.author?.name || 'Unknown'}`,
        timestamp: item.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    return NextResponse.json({
      totalUsers,
      totalOffices,
      totalAgendas,
      pendingAgendas,
      approvedAgendas,
      rejectedAgendas,
      forwardedAgendas,
      statusGroups,
      officeGroups,
      recentActivities: allActivities,
    });
  } catch (err) {
    console.error(err);
    const status = err?.status || 500;
    const message = err?.message || (status === 403 ? "Forbidden" : "Server error");
    return NextResponse.json({ message }, { status });
  }
}