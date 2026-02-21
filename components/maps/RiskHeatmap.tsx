'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getRiskColor } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Dynamic import to prevent SSR issues
const MapWrapper = dynamic(() => import('./MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-600">Initializing map...</p>
      </div>
    </div>
  ),
});

interface RiskData {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  population: number;
  areaSqKm: number;
  riskScore: number;
  primaryHazard: string;
  confidence: number;
  timestamp: Date;
  factors: {
    heavy_rainfall?: number;
    saturated_soil?: number;
    population_density?: number;
    [key: string]: number | undefined;
  };
}

interface RiskHeatmapProps {
  filterMinRisk?: number;
  filterMaxRisk?: number;
  refreshKey?: number;
}

export default function RiskHeatmap({ filterMinRisk = 0, filterMaxRisk = 100, refreshKey = 0 }: RiskHeatmapProps) {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<string>('all');

  useEffect(() => {
    fetchRiskData();
  }, [filterMinRisk, filterMaxRisk]);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/risk?type=district&minRisk=${filterMinRisk}&maxRisk=${filterMaxRisk}`
      );
      const result = await response.json();

      if (result.success) {
        setRiskData(result.data);
      } else {
        setError(result.error || 'Failed to load risk data');
      }
    } catch (err) {
      setError('Network error: Unable to fetch risk data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by hazard type
  const filteredData = selectedHazard === 'all' 
    ? riskData 
    : riskData.filter(d => d.primaryHazard === selectedHazard);

  // Get unique hazard types
  const hazardTypes = ['all', ...new Set(riskData.map(d => d.primaryHazard))];

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading risk heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error</p>
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchRiskData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Hazard:</label>
          <div className="flex gap-2">
            {hazardTypes.map((hazard) => (
              <button
                key={hazard}
                onClick={() => setSelectedHazard(hazard)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedHazard === hazard
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {hazard.charAt(0).toUpperCase() + hazard.slice(1)}
              </button>
            ))}
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredData.length} of {riskData.length} districts
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Risk Level Legend</h3>
        <div className="flex gap-4">
          {[
            { label: 'Low (0-30)', color: '#22c55e' },
            { label: 'Moderate (30-60)', color: '#eab308' },
            { label: 'High (60-80)', color: '#f97316' },
            { label: 'Critical (80-100)', color: '#dc2626' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <MapWrapper key={`map-${refreshKey}`} data={filteredData} />
      </div>
    </div>
  );
}
