import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const sendSMS = async (to: string, message: string) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_PHONE;

  if (!accountSid || !authToken || !from) {
    console.warn("Twilio credentials not configured — SMS skipped for", to);
    return { success: false, reason: "no_credentials" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({ From: from, To: to, Body: message });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: body.toString(),
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ SMS sent:", data.sid, "→", to);
      return { success: true };
    } else {
      console.error("❌ Twilio error:", data);
      return { success: false, reason: data.message };
    }
  } catch (err: any) {
    console.error("❌ SMS fetch error:", err.message);
    return { success: false, reason: err.message };
  }
};

export async function POST(req: NextRequest) {
  try {
    const {
      disasterType = "Emergency",
      severity = "HIGH",
      area = "Your area",
      reporterPhone,
    } = await req.json();

    // Fetch all CITIZEN users who have a phone number
    const citizens = await prisma.user.findMany({
      where: {
        role: "CITIZEN",
        phone: { not: null },
      },
      select: { phone: true, name: true },
    });

    // Build unique phone list — always include the SOS reporter's phone
    const phoneSet = new Set<string>(
      citizens.map((c: { phone: string | null }) => c.phone as string)
    );
    if (reporterPhone) phoneSet.add(reporterPhone);

    const phones = Array.from(phoneSet);

    if (phones.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No citizen phone numbers found in database.",
      });
    }

    // Build SMS message (matches server.js logic)
    let message: string;
    if (severity.toLowerCase() === "high" || severity.toLowerCase() === "critical") {
      message = `🚨 CRITICAL ${disasterType.toUpperCase()} ALERT\nArea: ${area}\nEvacuate immediately to nearest safe zone.\n- Suraksha Sathi`;
    } else {
      message = `🚨 ${disasterType.toUpperCase()} ALERT\nArea: ${area}\nStay alert and follow official instructions.\n- Suraksha Sathi`;
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const phone of phones) {
      const result = await sendSMS(phone, message);
      if (result.success) {
        sent++;
      } else {
        failed++;
        if (result.reason !== "no_credentials") errors.push(phone);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Citizen broadcast completed",
      totalTargets: phones.length,
      sent,
      failed,
    });
  } catch (err: any) {
    console.error("Citizen SMS API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
