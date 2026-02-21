'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

// Dynamically import the map to avoid SSR issues
const RiskHeatmap = dynamic(() => import('@/components/maps/RiskHeatmap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function HeatmapPage() {
  const [filterMinRisk, setFilterMinRisk] = useState(0);
  const [filterMaxRisk, setFilterMaxRisk] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleFilterChange = (min: number, max: number) => {
    setFilterMinRisk(min);
    setFilterMaxRisk(max);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            Risk Heatmap
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time disaster risk assessment across Maharashtra districts
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Districts</p>
              <p className="text-2xl font-bold text-gray-900">36</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Risk Areas</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Model Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">87.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Level Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Risk Level</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Risk Score: {filterMinRisk}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filterMinRisk}
              onChange={(e) => handleFilterChange(Number(e.target.value), filterMaxRisk)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Risk Score: {filterMaxRisk}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filterMaxRisk}
              onChange={(e) => handleFilterChange(filterMinRisk, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange(60, 100)}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
            >
              High Risk Only
            </button>
            <button
              onClick={() => handleFilterChange(0, 100)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
            >
              Show All
            </button>
          </div>
        </div>
      </div>

      {/* Map Component */}
      <RiskHeatmap key={refreshKey} filterMinRisk={filterMinRisk} filterMaxRisk={filterMaxRisk} refreshKey={refreshKey} />

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Important Notice</h3>
            <p className="text-sm text-yellow-800">
              This risk assessment is based on ML/DL models trained on historical data (2019-2025) and current weather patterns from IMD. 
              Risk scores are probabilistic and should be used as guidance for preparedness planning. 
              Always follow official advisories from NDMA and Maharashtra Emergency Management Authority during active disasters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
