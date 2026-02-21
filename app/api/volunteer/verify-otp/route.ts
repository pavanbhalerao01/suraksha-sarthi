import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();
const otpStorePath = path.join(process.cwd(), "otp-store.json");

export async function POST(request: NextRequest) {
  const { phoneNumber, otp, skills, name } = await request.json();

  // Verify OTP from file
  let store: { [key: string]: string } = {};
  try {
    store = JSON.parse(readFileSync(otpStorePath, "utf8"));
  } catch {}
  if (!store[phoneNumber]) {
    return NextResponse.json({ error: "OTP not found. Please request a new OTP." }, { status: 400 });
  }
  if (store[phoneNumber] !== otp) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }
  // Remove OTP after verification
  delete store[phoneNumber];
  writeFileSync(otpStorePath, JSON.stringify(store));

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { phone: phoneNumber } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: phoneNumber,
        role: "VOLUNTEER",
        name: name || phoneNumber,
        email: `${phoneNumber}@example.com`, // dummy email
        passwordHash: "otp-login", // dummy hash
      }
    });
  }

  // Check if volunteer exists
  let volunteer = await prisma.volunteer.findUnique({ where: { userId: user.id } });
  if (!volunteer) {
      volunteer = await prisma.volunteer.create({
        data: {
          userId: user.id,
          status: "PENDING",
          phoneNumber: phoneNumber,
          skills: skills ? JSON.stringify(skills) : "[]",
          isAvailable: true,
          tasksCompleted: 0,
          hoursServed: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
  }

  // Issue JWT (not implemented here)
  return NextResponse.json({ success: true, user, volunteer });
}
