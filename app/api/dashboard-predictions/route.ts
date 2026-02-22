/**
 * Dashboard Predictions API
 * Fetches cyclone, flood, heatwave predictions from Python ML backend.
 * When backend is online → returns filtered predictions.
 * When backend is offline → returns empty array (no hardcoded data).
 */

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const ALLOWED_TYPES = ['cyclone', 'flood', 'heatwave'];

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/predictions`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error(`Backend returned ${response.status}`);

    const data = await response.json();
    const allPredictions: any[] = data.predictions || [];

    // Filter only cyclone, flood, heatwave
    const filtered = allPredictions.filter((p: any) =>
      ALLOWED_TYPES.includes((p.type || '').toLowerCase().trim())
    );

    return NextResponse.json({
      predictions: filtered,
      backendOnline: true,
      source: 'live',
      total: filtered.length,
    });

  } catch {
    // Backend is down — return empty, no hardcoded data
    return NextResponse.json({
      predictions: [],
      backendOnline: false,
      source: 'none',
      total: 0,
      message: 'ML Backend offline. Start the Python backend to see predictions.',
    });
  }
}
