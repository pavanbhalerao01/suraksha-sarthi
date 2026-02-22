import { NextRequest, NextResponse } from 'next/server';

const FLASK_API_URL = process.env.DAMAGE_ASSESSMENT_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Forward to Flask API
    const flaskFormData = new FormData();
    flaskFormData.append('image', image);

    const response = await fetch(`${FLASK_API_URL}/api/assess-damage`, {
      method: 'POST',
      body: flaskFormData,
    });

    if (!response.ok) {
      throw new Error('Failed to assess damage');
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Damage assessment error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to assess damage' 
      },
      { status: 500 }
    );
  }
}
