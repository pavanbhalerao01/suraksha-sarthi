import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/resources/requests - Get all resource requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status
    const ngoId = searchParams.get('ngoId'); // Filter for specific NGO

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (ngoId) {
      where.respondedByNgoId = ngoId;
    }

    const requests = await prisma.resourceRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching resource requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resource requests' },
      { status: 500 }
    );
  }
}

// POST /api/resources/requests - Create a new resource request (from relief camp/authority)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resourceType,
      quantity,
      urgency,
      location,
      description,
      requestedBy,
      requestedByUserId,
      requestedByTeam
    } = body;

    // Validate required fields
    if (!resourceType || !quantity || !urgency || !location || !requestedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const resourceRequest = await prisma.resourceRequest.create({
      data: {
        resourceType,
        quantity,
        urgency,
        location,
        description,
        requestedBy,
        requestedByUserId,
        requestedByTeam,
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      request: resourceRequest
    });
  } catch (error) {
    console.error('Error creating resource request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource request' },
      { status: 500 }
    );
  }
}
