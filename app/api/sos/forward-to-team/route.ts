import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { randomUUID } from "crypto";

// Team ID counter prefix map
const TEAM_PREFIXES: Record<string, string> = {
  ndrf: "NDRF",
  sdrf: "SDRF",
  fire: "FIRE",
  police: "POL",
  medical: "MED",
  "civil-defense": "CIVD",
  "relief-camp": "RLC",
};

// Team display names
const TEAM_NAMES: Record<string, string> = {
  ndrf: "NDRF Field Team",
  sdrf: "SDRF Field Team",
  fire: "Fire Services",
  police: "Police Team",
  medical: "Medical Emergency Team",
  "civil-defense": "Civil Defense Team",
  "relief-camp": "Relief Camp Incharge",
};

function generateTeamId(teamType: string): string {
  const prefix = TEAM_PREFIXES[teamType] || teamType.toUpperCase();
  const number = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${prefix}-${number}`;
}

// POST /api/sos/forward-to-team
// Admin forwards an SOS to a specific team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      sosId,
      title,
      description,
      disasterType,
      severity,
      address,
      lat,
      lng,
      reporterName,
      reporterPhone,
      injuredCount,
      affectedFamilies,
      teamType, // e.g., 'ndrf', 'fire', 'medical'
      assignedBy,
    } = body;

    // Validate required fields
    if (!sosId || !title || !disasterType || !address || !teamType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: sosId, title, disasterType, address, teamType" },
        { status: 400 }
      );
    }

    // Check if team is currently IN_PROGRESS (blocked)
    const busyRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "id","teamId","title" FROM "TeamSosAssignment" WHERE "teamType" = $1 AND "status" = 'IN_PROGRESS' LIMIT 1`,
      teamType
    );

    if (busyRows.length > 0) {
      const busy = busyRows[0];
      return NextResponse.json(
        {
          success: false,
          error: `Team ${TEAM_NAMES[teamType] || teamType} is currently busy (ID: ${busy.teamId}). Wait for them to complete.`,
          busy: true,
          busyWith: busy.teamId,
        },
        { status: 409 }
      );
    }

    const teamId = generateTeamId(teamType);
    const teamName = TEAM_NAMES[teamType] || teamType;
    const id = randomUUID();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "TeamSosAssignment"
        ("id","sosId","title","description","disasterType","severity","address","lat","lng",
         "reporterName","reporterPhone","injuredCount","affectedFamilies",
         "teamType","teamId","teamName","assignedBy","status","assignedAt","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::float,$9::float,$10,$11,$12::integer,$13::integer,$14,$15,$16,$17,'ASSIGNED',NOW(),NOW(),NOW())`,
      id, sosId, title,
      description || `Emergency response required for ${disasterType}`,
      disasterType, severity || "HIGH", address,
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      reporterName || "Unknown", reporterPhone || "N/A",
      injuredCount ? parseInt(injuredCount) : 0,
      affectedFamilies ? parseInt(affectedFamilies) : 0,
      teamType, teamId, teamName,
      assignedBy || "NDRF_ADMIN"
    );

    const assignedAt = new Date().toISOString();
    return NextResponse.json({
      success: true,
      data: { id, teamId, teamName, assignedAt, status: "ASSIGNED" },
      message: `SOS successfully forwarded to ${teamName} with Team ID: ${teamId}`,
    });
  } catch (error) {
    console.error("Error forwarding SOS to team:", error);
    return NextResponse.json(
      { success: false, error: "Failed to forward SOS to team" },
      { status: 500 }
    );
  }
}

// GET /api/sos/forward-to-team?teamType=ndrf
// Get busy/blocked team status for admin panel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamType = searchParams.get("teamType");

    if (!teamType) {
      const blockedTeams = await prisma.$queryRawUnsafe<any[]>(
        `SELECT "teamType","teamId","teamName","title","assignedAt" FROM "TeamSosAssignment" WHERE "status" = 'IN_PROGRESS'`
      );
      return NextResponse.json({ success: true, blockedTeams });
    }

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "TeamSosAssignment" WHERE "teamType" = $1 AND "status" = 'IN_PROGRESS' LIMIT 1`,
      teamType
    );

    return NextResponse.json({ success: true, isBusy: rows.length > 0, assignment: rows[0] || null });
  } catch (error) {
    console.error("Error checking team status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check team status" },
      { status: 500 }
    );
  }
}
