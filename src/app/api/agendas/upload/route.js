import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

const ALLOWED_EXT = [".pdf", ".docx"];

export const runtime = "nodejs";

// Helper function to get settings
async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsObj = {};
  settings.forEach((s) => {
    if (s.value === "true") settingsObj[s.key] = true;
    else if (s.value === "false") settingsObj[s.key] = false;
    else if (!isNaN(s.value) && s.value !== "") settingsObj[s.key] = parseInt(s.value);
    else settingsObj[s.key] = s.value;
  });
  return settingsObj;
}

export async function POST(request) {
  const auth = verifyRole(request, ["STAFF"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const settings = await getSettings();

  if (!settings.allowFileUploads) {
    return NextResponse.json({ error: "File uploads are currently disabled by system settings" }, { status: 400 });
  }

  const formData = await request.formData();
  const agendaId = formData.get("agendaId");
  const file = formData.get("file");

  if (!agendaId) {
    return NextResponse.json({ error: "Missing agendaId" }, { status: 400 });
  }
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const filename = file.name;
  const size = file.size;

  const maxSizeBytes = settings.maxFileSize * 1024 * 1024;
  if (size > maxSizeBytes) {
    return NextResponse.json({ error: `File must be under ${settings.maxFileSize}MB` }, { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "agendas");
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = `agenda_${agendaId}_${Date.now()}${ext}`;
  const filePath = path.join(uploadsDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const url = `/uploads/agendas/${safeName}`;

  // Update agenda record with attachment metadata
  await prisma.agenda.update({
    where: { id: agendaId },
    data: {
      attachmentUrl: url,
      attachmentName: filename,
      attachmentSize: size,
    },
  });

  return NextResponse.json({
    url,
    name: filename,
    size,
  });
}
