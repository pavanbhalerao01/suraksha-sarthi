import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  const { phoneNumber } = await request.json();
  if (!phoneNumber) {
    return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { phone: phoneNumber } });
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }
  const volunteer = await prisma.volunteer.findUnique({ where: { userId: user.id } });
  if (!volunteer) {
    return NextResponse.json({ success: false, error: "Volunteer profile not found" }, { status: 404 });
  }
  const updated = await prisma.volunteer.update({
    where: { userId: user.id },
    data: { tasksCompleted: { increment: 1 } }
  });
  return NextResponse.json({ success: true, tasksCompleted: updated.tasksCompleted });
}
