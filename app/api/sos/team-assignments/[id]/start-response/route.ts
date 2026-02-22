import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH /api/sos/team-assignments/[id]/start-response
// Team clicks "Start Response" - marks assignment as IN_PROGRESS and blocks the team
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "TeamSosAssignment" WHERE "id" = $1 LIMIT 1`,
      id
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    const existing = rows[0];

    if (existing.status === "IN_PROGRESS") {
      return NextResponse.json({ success: true, message: "Already in progress", assignment: existing });
    }

    if (existing.status === "RESOLVED") {
      return NextResponse.json({ success: false, error: "Assignment already resolved" }, { status: 400 });
    }

    const now = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `UPDATE "TeamSosAssignment" SET "status"='IN_PROGRESS', "responseStartedAt"=NOW(), "updatedAt"=NOW() WHERE "id"=$1`,
      id
    );

    return NextResponse.json({
      success: true,
      message: `Team ${existing.teamId} has started response. Team is now blocked for other assignments.`,
      assignment: { ...existing, status: "IN_PROGRESS", responseStartedAt: now },
    });
  } catch (error) {
    console.error("Error starting response:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start response" },
      { status: 500 }
    );
  }
}

// PATCH to resolve an assignment - optional (team marks as done)
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const now = new Date().toISOString();
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `UPDATE "TeamSosAssignment" SET "status"='RESOLVED', "resolvedAt"=NOW(), "updatedAt"=NOW() WHERE "id"=$1 RETURNING *`,
      id
    );
    const updated = rows[0];
    return NextResponse.json({
      success: true,
      message: `Assignment resolved. Team ${updated?.teamId} is now available.`,
      assignment: updated,
    });
  } catch (error) {
    console.error("Error resolving assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve assignment" },
      { status: 500 }
    );
  }
}
