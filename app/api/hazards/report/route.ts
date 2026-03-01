import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      teamId,
      teamType,
      teamName,
      hazardType,
      severity,
      location,
      latitude,
      longitude,
      description,
      affectedArea,
      estimatedCasualties,
      requiresImmediate
    } = body;

    // Validate required fields
    if (!teamId || !teamType || !hazardType || !severity || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      );
    }

    const hazardReport = {
      id: `hazard_${Date.now()}`,
      reportedBy: {
        teamId,
        teamType,
        teamName,
      },
      hazardType,
      severity,
      location,
      coordinates: {
        latitude: latitude || null,
        longitude: longitude || null,
      },
      description,
      affectedArea: affectedArea || null,
      estimatedCasualties: estimatedCasualties || null,
      requiresImmediate: requiresImmediate || false,
      reportedAt: new Date().toISOString(),
      status: 'reported',
    };

    console.log('⚠️ Hazard reported:', {
      type: hazardType,
      severity,
      location,
      by: teamName,
      immediate: requiresImmediate,
    });

    // In production:
    // 1. Save to database
    // 2. Send alerts to NDRF Admin
    // 3. Notify nearby teams
    // 4. If critical/immediate, trigger emergency protocol
    // 5. Create incident on map

    return NextResponse.json({
      success: true,
      hazardReport,
      message: `Hazard report created with ${severity} severity`,
    });
  } catch (error) {
    console.error('Error reporting hazard:', error);
    return NextResponse.json(
      { error: 'Failed to report hazard' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    // Mock data - in production, fetch from database
    const hazards = [
      {
        id: 'hazard_1',
        hazardType: 'Building Collapse',
        severity: 'critical',
        location: 'Shivaji Nagar, Pune',
        reportedBy: { teamName: 'NDRF Alpha Team' },
        reportedAt: new Date().toISOString(),
        status: 'reported',
      },
    ];

    let filtered = hazards;
    if (severity) {
      filtered = filtered.filter(h => h.severity === severity);
    }
    if (status) {
      filtered = filtered.filter(h => h.status === status);
    }

    return NextResponse.json({
      count: filtered.length,
      hazards: filtered,
    });
  } catch (error) {
    console.error('Error fetching hazards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hazards' },
      { status: 500 }
    );
  }
}
