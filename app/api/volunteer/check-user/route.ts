import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { phoneNumber } = await request.json();
  if (!phoneNumber) {
    return NextResponse.json({ exists: false, error: "Phone number required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { phone: phoneNumber } });
  return NextResponse.json({ exists: !!user });
}
