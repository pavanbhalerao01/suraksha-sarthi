import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { writeFileSync, readFileSync } from "fs";
import path from "path";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

const otpStorePath = path.join(process.cwd(), "otp-store.json");

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();
    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Save OTP to file
    let store: { [key: string]: string } = {};
    try {
      store = JSON.parse(readFileSync(otpStorePath, "utf8"));
    } catch {}
    store[phoneNumber] = otp;
    writeFileSync(otpStorePath, JSON.stringify(store));
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioPhone,
      to: phoneNumber,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to send OTP" }, { status: 500 });
  }
}
