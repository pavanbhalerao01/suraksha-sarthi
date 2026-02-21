import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionType = searchParams.get('type') || 'district';
    const minRisk = searchParams.get('minRisk') ? parseFloat(searchParams.get('minRisk')!) : 0;
    const maxRisk = searchParams.get('maxRisk') ? parseFloat(searchParams.get('maxRisk')!) : 100;

    // Fetch regions with their latest risk scores
    const regions = await prisma.region.findMany({
      where: {
        type: regionType,
      },
      include: {
        riskScores: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
      },
    });

    // Transform data for the map
    const riskData = regions
      .map((region: any) => {
        const latestScore = region.riskScores[0];
        if (!latestScore) return null;

        // Filter by risk range
        if (latestScore.riskScore < minRisk || latestScore.riskScore > maxRisk) {
          return null;
        }

        const centroid = JSON.parse(region.centroid);

        return {
          id: region.id,
          name: region.name,
          type: region.type,
          lat: centroid.lat,
          lng: centroid.lng,
          population: region.population,
          areaSqKm: region.areaSqKm,
          riskScore: latestScore.riskScore,
          primaryHazard: latestScore.primaryHazard,
          confidence: latestScore.confidence,
          timestamp: latestScore.timestamp,
          factors: JSON.parse(latestScore.factors),
        };
      })
      .filter((item: any) => item !== null);

    return NextResponse.json({
      success: true,
      count: riskData.length,
      data: riskData,
    });
  } catch (error) {
    console.error('Error fetching risk data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch risk data',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for updating risk scores (for ML model integration later)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { regionId, riskScore, primaryHazard, factors, modelVersion, confidence } = body;

    if (!regionId || riskScore === undefined || !primaryHazard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: regionId, riskScore, primaryHazard',
        },
        { status: 400 }
      );
    }

    const newRiskScore = await prisma.riskScore.create({
      data: {
        regionId,
        timestamp: new Date(),
        riskScore: parseFloat(riskScore),
        primaryHazard,
        factors: JSON.stringify(factors || {}),
        modelVersion: modelVersion || 'v1.0',
        confidence: confidence || 0.8,
      },
    });

    return NextResponse.json({
      success: true,
      data: newRiskScore,
    });
  } catch (error) {
    console.error('Error creating risk score:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create risk score',
      },
      { status: 500 }
    );
  }
}
