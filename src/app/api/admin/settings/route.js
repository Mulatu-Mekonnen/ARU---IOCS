import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await roleGuard("ADMIN");
    const settings = await prisma.setting.findMany();
    const settingsObj = {};
    settings.forEach((s) => {
      // Convert values back to appropriate types
      if (s.value === "true") settingsObj[s.key] = true;
      else if (s.value === "false") settingsObj[s.key] = false;
      else if (!isNaN(s.value) && s.value !== "") settingsObj[s.key] = parseInt(s.value);
      else settingsObj[s.key] = s.value;
    });
    return NextResponse.json(settingsObj);
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
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      updates.push(
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      );
    }
    await prisma.$transaction(updates);
    // Return updated settings
    const settings = await prisma.setting.findMany();
    const settingsObj = {};
    settings.forEach((s) => {
      // Convert values back to appropriate types
      if (s.value === "true") settingsObj[s.key] = true;
      else if (s.value === "false") settingsObj[s.key] = false;
      else if (!isNaN(s.value) && s.value !== "") settingsObj[s.key] = parseInt(s.value);
      else settingsObj[s.key] = s.value;
    });
    return NextResponse.json(settingsObj);
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}
