import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, aadhaar, address, familyMembers, medicalNeeds } = body;

    // Validate required fields
    if (!name || !phone || !familyMembers) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, phone, familyMembers',
        },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Evacuee with this phone number already registered',
        },
        { status: 409 }
      );
    }

    // Create evacuee user account
    const defaultPassword = `evacuee${phone.slice(-4)}`; // Simple default password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: `evacuee${phone}@reliefcamp.temp`, // Temporary email format
        phone,
        passwordHash,
        role: 'EVACUEE',
        name,
      },
    });

    // Create user profile with evacuee-specific information
    const profile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        evacuatedFrom: address || null,
        evacuationDate: new Date(),
        familyMembers: parseInt(familyMembers),
        medicalNeeds: medicalNeeds || null,
        aadhaarNumber: aadhaar || null,
        reliefCampId: 'RC-SINHAGAD-001', // Hard-coded for now, should be dynamic
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        familyMembers: profile.familyMembers,
        evacuationDate: profile.evacuationDate,
      },
      message: 'Evacuee registered successfully',
    });
  } catch (error) {
    console.error('Error registering evacuee:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register evacuee',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve evacuees from a specific relief camp
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('campId') || 'RC-SINHAGAD-001';

    const evacuees = await prisma.user.findMany({
      where: {
        role: 'EVACUEE',
      },
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      count: evacuees.length,
      data: evacuees.map(evacuee => ({
        id: evacuee.id,
        name: evacuee.name,
        phone: evacuee.phone,
        familyMembers: evacuee.profile?.familyMembers,
        evacuatedFrom: evacuee.profile?.evacuatedFrom,
        evacuationDate: evacuee.profile?.evacuationDate,
        medicalNeeds: evacuee.profile?.medicalNeeds,
        registeredAt: evacuee.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching evacuees:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch evacuees',
      },
      { status: 500 }
    );
  }
}
