/**
 * Next.js API Route - Disaster Predictions v2.0
 * Fetches ALL disaster types for ALL Indian cities from Python backend
 * Updates hourly automatically
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // Fetch predictions from Python backend (all disaster types, all cities)
    const response = await fetch(`${BACKEND_URL}/api/predictions`, {
      cache: 'no-store', // Don't cache predictions, always get fresh data
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching predictions:', error);
    
    // Return fallback data if backend is unavailable
    return NextResponse.json({
      predictions: [],
      total: 0,
      generated_at: new Date().toISOString(),
      error: 'Backend service unavailable. Please ensure the Python backend is running on port 8000.',
      fallback: true
    }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { disaster_type } = body;
    
    // Fetch specific disaster type predictions
    const endpoint = disaster_type ? `/api/predictions/${disaster_type}` : '/api/predictions';
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching filtered predictions:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch predictions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
