import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { randomUUID } from "crypto";

function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SOS-${new Date().getFullYear()}-${code}`;
}

// POST /api/citizen-sos  — citizen fires SOS, saves to DB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, disasterType, description, address, lat, lng, severity } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required." },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const ticketId = generateTicketId();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CitizenSOS"
        ("id","ticketId","name","phone","disasterType","description","address",
         "lat","lng","severity","status","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::float,$9::float,$10,'UNVERIFIED',NOW(),NOW())`,
      id,
      ticketId,
      name.trim(),
      phone.trim(),
      disasterType || "other",
      description || null,
      address || null,
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      severity || "HIGH"
    );

    return NextResponse.json({
      success: true,
      data: { id, ticketId },
      message: "SOS received. Help is on the way.",
    });
  } catch (error) {
    console.error("Error saving CitizenSOS:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save SOS." },
      { status: 500 }
    );
  }
}

// GET /api/citizen-sos  — admin fetches all citizen SOS records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // optional filter

    let query = `SELECT * FROM "CitizenSOS"`;
    const params: any[] = [];
    if (status && status !== "ALL") {
      query += ` WHERE "status" = $1`;
      params.push(status);
    }
    query += ` ORDER BY "createdAt" DESC LIMIT 100`;

    const rows = await prisma.$queryRawUnsafe<any[]>(query, ...params);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching CitizenSOS:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SOS records." },
      { status: 500 }
    );
  }
}

// PATCH /api/citizen-sos?id=xxx&status=VERIFIED  — admin updates status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id and status required" }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "CitizenSOS" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
      status, id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating CitizenSOS:", error);
    return NextResponse.json({ success: false, error: "Failed to update." }, { status: 500 });
  }
}

// DELETE /api/citizen-sos?id=xxx  — permanently delete a single SOS entry (Mark as False / Mark as Completed)
// DELETE /api/citizen-sos?clearAll=true  — delete ALL entries (admin bulk clear)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll");

    if (clearAll === "true") {
      await prisma.$executeRawUnsafe(`DELETE FROM "CitizenSOS"`);
      return NextResponse.json({ success: true, message: "All SOS entries cleared." });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`DELETE FROM "CitizenSOS" WHERE "id" = $1`, id);
    return NextResponse.json({ success: true, message: "SOS entry deleted." });
  } catch (error) {
    console.error("Error deleting CitizenSOS:", error);
    return NextResponse.json({ success: false, error: "Failed to delete SOS." }, { status: 500 });
  }
}
