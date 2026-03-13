import { verifyToken } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { role } = req.query;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (user.role !== role) return res.status(403).json({ message: "Forbidden" });

  // real stats depending on role
  try {
    let data = {};
    if (role === "admin") {
      const totalUsers = await prisma.user.count();
      const totalAgendas = await prisma.agenda.count();
      const pendingAgendas = await prisma.agenda.count({ where: { status: "PENDING" } });
      data = { totalUsers, totalAgendas, pendingAgendas };
    } else if (role === "staff") {
      const userRec = await prisma.user.findUnique({ where: { id: user.id } });
      const myAgendas = await prisma.agenda.count({ where: { createdById: user.id } });
      data = { myAgendas };
    } else if (role === "head") {
      const userRec = await prisma.user.findUnique({ where: { id: user.id } });
      const officeId = userRec?.officeId;
      const pending = officeId
        ? await prisma.agenda.count({ where: { receiverOfficeId: officeId, status: "PENDING" } })
        : 0;
      data = { pending };    
    } else if (role === "viewer") {
      const approved = await prisma.agenda.count({ where: { status: "APPROVED" } });
      data = { approved };
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
