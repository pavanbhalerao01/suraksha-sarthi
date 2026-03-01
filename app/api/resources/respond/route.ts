import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/resources/respond - NGO responds to a resource request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requestId,
      ngoId,
      deliveryPercentage,
      deliveryMethod,
      deliveryLocation,
      estimatedDeliveryTime,
      notes
    } = body;

    // Validate required fields
    if (!requestId || !deliveryPercentage || !deliveryMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate delivery method specific requirements
    if (deliveryMethod === 'deliver' && !deliveryLocation) {
      return NextResponse.json(
        { success: false, error: 'Delivery location required for camp delivery' },
        { status: 400 }
      );
    }

    // Update the resource request with response details
    const updatedRequest = await prisma.resourceRequest.update({
      where: {
        id: requestId
      },
      data: {
        status: 'responded',
        respondedByNgoId: ngoId,
        deliveryPercentage,
        deliveryMethod,
        deliveryLocation,
        estimatedDeliveryTime,
        notes,
        respondedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error responding to resource request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to respond to resource request' },
      { status: 500 }
    );
  }
}
