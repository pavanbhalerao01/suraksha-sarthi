import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Skill mapping based on disaster type
const DISASTER_SKILLS_MAP: Record<string, string[]> = {
  flood: ["diver", "swimmer", "boat_operator", "rescue_expert"],
  "building collapse": ["first_aid", "rescue_expert", "structural_engineer", "heavy_equipment_operator"],
  fire: ["firefighter", "first_aid", "rescue_expert"],
  "medical emergency": ["doctor", "paramedic", "first_aid", "nurse"],
  earthquake: ["search_rescue", "first_aid", "structural_engineer", "heavy_equipment_operator"],
  landslide: ["search_rescue", "earth_moving_operator", "first_aid", "geologist"],
  heatwave: ["first_aid", "medical_assistant", "paramedic"],
  drought: ["logistics", "water_distribution", "driver"],
  cyclone: ["rescue_expert", "first_aid", "boat_operator", "driver"],
  "road accident": ["first_aid", "paramedic", "tow_truck_operator"],
  "water contamination": ["water_quality_expert", "logistics", "driver"],
  default: ["first_aid", "rescue_expert"]
};

// Get required skills for a disaster type
function getRequiredSkills(disasterType: string): string[] {
  const normalizedType = disasterType.toLowerCase();
  return DISASTER_SKILLS_MAP[normalizedType] || DISASTER_SKILLS_MAP.default;
}

// POST /api/sos-alert - Send SOS to all available volunteers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      incidentId,
      disasterType,
      title,
      description,
      severity,
      location,
      address,
      reporterName,
      reporterPhone,
      sentBy // Admin user ID
    } = body;

    // Validate required fields
    if (!incidentId || !disasterType || !title || !location || !reporterName || !reporterPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get required skills for this disaster
    const requiredSkills = getRequiredSkills(disasterType);

    // Find all active, verified, and available volunteers
    // Prioritize volunteers with matching skills
    const allVolunteers = await prisma.volunteer.findMany({
      where: {
        status: "VERIFIED",
        isAvailable: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    // Sort volunteers: those with matching skills first
    const sortedVolunteers = allVolunteers.sort((a, b) => {
      const aSkills = JSON.parse(a.skills || "[]");
      const bSkills = JSON.parse(b.skills || "[]");
      
      const aMatchCount = requiredSkills.filter(skill => 
        aSkills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
      ).length;
      
      const bMatchCount = requiredSkills.filter(skill => 
        bSkills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
      ).length;
      
      return bMatchCount - aMatchCount; // Higher match count first
    });

    const volunteerIds = sortedVolunteers.map(v => v.userId);

    // Create SOS Alert record in database
    const sosAlert = await prisma.sosAlert.create({
      data: {
        incidentId,
        disasterType,
        title,
        description: description || `Emergency assistance needed for ${disasterType}`,
        severity: severity || "high",
        location: typeof location === 'string' ? location : JSON.stringify(location),
        address: address || "Location details in map",
        reporterName,
        reporterPhone,
        requiredSkills: JSON.stringify(requiredSkills),
        sentBy: sentBy || "NDRF_ADMIN",
        volunteersNotified: JSON.stringify(volunteerIds),
        totalVolunteersNotified: volunteerIds.length,
        volunteersResponded: JSON.stringify([]),
        totalVolunteersResponded: 0
      }
    });

    // In a real implementation, you would:
    // 1. Send SMS notifications via Twilio/msg91
    // 2. Send push notifications via Firebase
    // 3. Send WhatsApp messages via WhatsApp Business API
    // 4. Send email notifications
    
    // For now, we'll prepare the notification data
    const notifications = sortedVolunteers.map(volunteer => ({
      volunteerId: volunteer.userId,
      volunteerName: volunteer.user.name,
      volunteerPhone: volunteer.user.phone,
      volunteerEmail: volunteer.user.email,
      volunteerSkills: JSON.parse(volunteer.skills || "[]"),
      message: generateSOSMessage({
        disasterType,
        title,
        description,
        severity,
        address,
        reporterName,
        reporterPhone,
        requiredSkills,
        volunteerName: volunteer.user.name
      })
    }));

    // Log notification attempt (in production, integrate with SMS/Push services)
    console.log(`📢 SOS ALERT SENT TO ${notifications.length} VOLUNTEERS`);
    console.log(`Disaster: ${disasterType} | Severity: ${severity}`);
    console.log(`Location: ${address}`);
    console.log(`Required Skills: ${requiredSkills.join(", ")}`);

    return NextResponse.json({
      success: true,
      message: `SOS alert sent to ${notifications.length} volunteers`,
      data: {
        sosAlertId: sosAlert.id,
        totalVolunteersNotified: notifications.length,
        requiredSkills,
        notifications: notifications.slice(0, 5) // Return first 5 for preview
      }
    });

  } catch (error) {
    console.error("Error sending SOS alert:", error);
    return NextResponse.json(
      { error: "Failed to send SOS alert", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Generate personalized SOS message for volunteers
function generateSOSMessage(data: {
  disasterType: string;
  title: string;
  description: string;
  severity: string;
  address: string;
  reporterName: string;
  reporterPhone: string;
  requiredSkills: string[];
  volunteerName: string;
}): string {
  const { disasterType, title, description, severity, address, reporterName, reporterPhone, requiredSkills, volunteerName } = data;
  
  return `
🚨 URGENT SOS ALERT 🚨

Hello ${volunteerName},

DISASTER TYPE: ${disasterType.toUpperCase()}
SEVERITY: ${severity.toUpperCase()}

INCIDENT: ${title}
${description}

📍 LOCATION: ${address}

👤 REPORTER: ${reporterName}
📞 CONTACT: ${reporterPhone}

🔧 REQUIRED SKILLS: ${requiredSkills.join(", ")}

⏰ IMMEDIATE ACTION NEEDED
If you have the required skills and can help, please respond immediately.

Stay safe and coordinate with NDRF team on-site.

- Survive.exe Disaster Management System
`.trim();
}

// GET /api/sos-alert?incidentId=xxx - Get SOS alerts for a specific incident
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get("incidentId");

    if (incidentId) {
      // Get SOS alerts for specific incident
      const alerts = await prisma.sosAlert.findMany({
        where: { incidentId },
        orderBy: { sentAt: "desc" }
      });

      return NextResponse.json({
        success: true,
        data: alerts
      });
    } else {
      // Get all SOS alerts (last 100)
      const alerts = await prisma.sosAlert.findMany({
        orderBy: { sentAt: "desc" },
        take: 100
      });

      return NextResponse.json({
        success: true,
        data: alerts
      });
    }

  } catch (error) {
    console.error("Error fetching SOS alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch SOS alerts" },
      { status: 500 }
    );
  }
}
