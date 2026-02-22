import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();
  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { phone: phoneNumber } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const volunteer = await prisma.volunteer.findUnique({ where: { userId: user.id } });
  if (!volunteer) {
    return NextResponse.json({ error: "Volunteer profile not found" }, { status: 404 });
  }
  return NextResponse.json({
    name: user.name,
    skills: JSON.parse(volunteer.skills),
    status: volunteer.status,
    tasksCompleted: volunteer.tasksCompleted,
    hoursServed: volunteer.hoursServed,
    rating: volunteer.rating,
    verifiedBy: volunteer.verifiedBy,
    verifiedAt: volunteer.verifiedAt,
    phoneNumber: user.phone
  });
}
