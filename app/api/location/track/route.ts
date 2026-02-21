import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for location tracking
// In production, this should be stored in Redis or database with TTL
const activeTeamLocations = new Map<string, {
  teamId: string;
  teamType: string;
  teamName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  onDuty: boolean;
  lastUpdate: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      teamId,
      teamType,
      teamName,
      latitude,
      longitude,
      accuracy,
      heading,
      speed,
      onDuty
    } = body;

    // Validate required fields
    if (!teamId || !teamType || !teamName || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Update location
    activeTeamLocations.set(teamId, {
      teamId,
      teamType,
      teamName,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      heading: heading || null,
      speed: speed || null,
      onDuty: onDuty !== false,
      lastUpdate: new Date().toISOString(),
    });

    console.log(`📍 Location updated for ${teamName} (${teamType}):`, {
      coords: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      accuracy: accuracy ? `${accuracy.toFixed(0)}m` : 'N/A',
      onDuty,
    });

    return NextResponse.json({
      success: true,
      teamId,
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const teamType = searchParams.get('teamType');
    const onlyOnDuty = searchParams.get('onDuty') === 'true';

    // Get specific team location
    if (teamId) {
      const location = activeTeamLocations.get(teamId);
      if (!location) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ location });
    }

    // Get all teams or filter by type
    let locations = Array.from(activeTeamLocations.values());

    if (teamType) {
      locations = locations.filter(loc => loc.teamType === teamType);
    }

    if (onlyOnDuty) {
      locations = locations.filter(loc => loc.onDuty);
    }

    // Remove stale locations (older than 5 minutes)
    const now = new Date().getTime();
    locations = locations.filter(loc => {
      const locationTime = new Date(loc.lastUpdate).getTime();
      const isRecent = (now - locationTime) < 5 * 60 * 1000; // 5 minutes
      
      // Remove stale entries from map
      if (!isRecent) {
        activeTeamLocations.delete(loc.teamId);
      }
      
      return isRecent;
    });

    return NextResponse.json({
      count: locations.length,
      locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID required' },
        { status: 400 }
      );
    }

    const deleted = activeTeamLocations.delete(teamId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Location tracking stopped',
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to stop location tracking' },
      { status: 500 }
    );
  }
}
