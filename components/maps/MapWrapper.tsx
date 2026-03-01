'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRiskColor, getRiskLabel, formatDateTime } from '@/lib/utils';

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

interface MapWrapperProps {
  data: RiskData[];
}

// Calculate marker radius based on risk score and population
const getMarkerRadius = (riskScore: number, population: number) => {
  const baseRadius = 10;
  const riskMultiplier = riskScore / 100;
  const popMultiplier = Math.log10(population) / 2;
  return baseRadius + (riskMultiplier * 15) + (popMultiplier * 2);
};

export default function MapWrapper({ data }: MapWrapperProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [19.7515, 75.7139],
        zoom: 7,
        scrollWheelZoom: true,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      // Create markers layer group
      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Add new markers
    if (data.length > 0 && mapInstanceRef.current && markersLayerRef.current) {
      const bounds: L.LatLngBoundsExpression = [];

      data.forEach((region) => {
        const radius = getMarkerRadius(region.riskScore, region.population);
        const color = getRiskColor(region.riskScore);
        
        const circle = L.circleMarker([region.lat, region.lng], {
          radius: radius,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6,
        });

        // Create popup content
        const popupContent = `
          <div class="p-2" style="min-width: 250px;">
            <h3 class="font-bold text-lg mb-2">${region.name}</h3>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Risk Score:</span>
                <span class="font-bold text-lg" style="color: ${color}">
                  ${region.riskScore.toFixed(1)}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Risk Level:</span>
                <span class="font-semibold">${getRiskLabel(region.riskScore)}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Primary Hazard:</span>
                <span class="font-medium capitalize">${region.primaryHazard}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Confidence:</span>
                <span class="font-medium">${(region.confidence * 100).toFixed(0)}%</span>
              </div>
              
              <div class="border-t pt-2 mt-2">
                <div class="text-sm text-gray-600 mb-1">Risk Factors:</div>
                <div class="space-y-1">
                  ${Object.entries(region.factors).map(([factor, value]) => `
                    <div class="flex justify-between text-xs">
                      <span class="text-gray-700 capitalize">
                        ${factor.replace(/_/g, ' ')}:
                      </span>
                      <span class="font-medium">${((value || 0) * 100).toFixed(0)}%</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="border-t pt-2 mt-2">
                <div class="text-xs text-gray-700">
                  Population: ${region.population?.toLocaleString() || 'N/A'}
                </div>
                <div class="text-xs text-gray-700">
                  Area: ${region.areaSqKm?.toLocaleString() || 'N/A'} km²
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  Updated: ${formatDateTime(new Date(region.timestamp))}
                </div>
              </div>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        circle.addTo(markersLayerRef.current!);
        
        bounds.push([region.lat, region.lng]);
      });

      // Fit bounds to show all markers
      if (bounds.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Cleanup function
    return () => {
      // Don't remove the map on every data change, only on component unmount
    };
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        markersLayerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    />
  );
}
