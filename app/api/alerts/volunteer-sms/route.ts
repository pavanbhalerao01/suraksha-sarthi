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
      area = "Unknown Area",
      instructions,
    } = await req.json();

    const safetyInstructions: Record<string, string> = {
      flood:             "Move to higher ground. Assist stranded residents. Do not walk through moving water.",
      fire:              "Evacuate civilians. Keep clear of burning structures. Follow fire department guidance.",
      earthquake:        "Check for survivors. Avoid unstable structures. Follow rescue coordinator instructions.",
      cyclone:           "Help secure evacuation. Stay away from coastal areas. Report to assigned zone.",
      landslide:         "Stay away from slide path. Assist evacuation. Do not re-enter until cleared.",
      heatwave:          "Distribute water and ORS. Identify heat-stroke cases. Set up cooling stations.",
      building_collapse: "Do not enter unstable structures. Assist NDRF in search and rescue.",
    };

    const resolvedInstructions =
      instructions ||
      safetyInstructions[disasterType.toLowerCase()] ||
      "Report to assigned zone immediately and await NDRF command instructions.";

    // Fetch all VOLUNTEER users with a phone number
    const volunteers = await prisma.user.findMany({
      where: {
        role: "VOLUNTEER",
        phone: { not: null },
      },
      select: { phone: true, name: true },
    });

    const phones = volunteers.map((v: { phone: string | null }) => v.phone as string);

    if (phones.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No volunteer phone numbers found in database.",
      });
    }

    // Message matches server.js /notify-volunteers format
    const message = `🚑 VOLUNTEER ALERT\nDisaster: ${disasterType.toUpperCase()}\nArea: ${area}\nInstructions: ${resolvedInstructions}\nRespond ASAP.\n- Suraksha Sathi Command Center`;

    let sent = 0;
    let failed = 0;

    for (const phone of phones) {
      const result = await sendSMS(phone, message);
      if (result.success) sent++;
      else failed++;
    }

    return NextResponse.json({
      success: true,
      message: "Volunteer notification completed",
      totalTargets: phones.length,
      sent,
      failed,
    });
  } catch (err: any) {
    console.error("Volunteer SMS API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
