import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/ngo/contributions - Get NGO's contribution history and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');

    if (!ngoId) {
      return NextResponse.json(
        { success: false, error: 'NGO ID required' },
        { status: 400 }
      );
    }

    // Get all responses from this NGO
    const responses = await prisma.resourceRequest.findMany({
      where: {
        respondedByNgoId: ngoId
      },
      orderBy: {
        respondedAt: 'desc'
      }
    });

    // Categorize into ongoing and history
    const ongoing = responses.filter(r => r.status === 'responded');
    const history = responses.filter(r => r.status === 'fulfilled' || r.status === 'cancelled');

    // Calculate stats
    const stats = {
      totalContributions: responses.length,
      ongoingContributions: ongoing.length,
      fulfilledContributions: history.filter(r => r.status === 'fulfilled').length,
      // Estimate people helped (simplified calculation)
      peopleHelped: responses.reduce((sum, r) => {
        // Rough estimate: Food = 2 people per unit, Medical = 5 per kit, etc.
        const multiplier = r.resourceType.toLowerCase().includes('food') ? 2 :
                          r.resourceType.toLowerCase().includes('medical') ? 5 : 3;
        const quantity = parseInt(r.quantity) || 0;
        const percentage = r.deliveryPercentage || 100;
        return sum + (quantity * multiplier * percentage / 100);
      }, 0)
    };

    return NextResponse.json({
      success: true,
      stats,
      ongoing,
      history
    });
  } catch (error) {
    console.error('Error fetching NGO contributions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NGO contributions' },
      { status: 500 }
    );
  }
}
