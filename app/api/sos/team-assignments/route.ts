import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/sos/team-assignments?teamType=ndrf
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamType = searchParams.get("teamType");

    if (!teamType) {
      return NextResponse.json(
        { success: false, error: "teamType query parameter is required" },
        { status: 400 }
      );
    }

    const assignments = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "TeamSosAssignment"
       WHERE "teamType" = $1 AND "status" IN ('ASSIGNED', 'IN_PROGRESS')
       ORDER BY
         CASE WHEN "status" = 'IN_PROGRESS' THEN 1 ELSE 0 END DESC,
         "assignedAt" DESC`,
      teamType
    );

    return NextResponse.json({ success: true, assignments, count: assignments.length });
  } catch (error) {
    console.error("Error fetching team assignments:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch assignments" }, { status: 500 });
  }
}

