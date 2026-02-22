'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────

export interface Disaster {
  id: string;
  type: string;
  title: string;
  location: string;        // human-readable
  lat: number;
  lng: number;
  severity: string;
  date: string;
  description?: string;
}

interface Hospital {
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  beds: number;
  distanceKm: number;
}

// ─────────────────────────────────────────────────────────
//  Hospital database (realistic Maharashtra hospitals)
// ─────────────────────────────────────────────────────────

const MAHARASHTRA_HOSPITALS: Omit<Hospital, 'distanceKm'>[] = [
  // Pune
  { name: 'Sassoon General Hospital', lat: 18.5195, lng: 73.8760, address: 'Sassoon Road, Pune', phone: '020-26128000', beds: 1350 },
  { name: 'KEM Hospital, Pune', lat: 18.4989, lng: 73.8673, address: 'Rasta Peth, Pune', phone: '020-67126300', beds: 600 },
  { name: 'Ruby Hall Clinic', lat: 18.5320, lng: 73.8764, address: 'Sassoon Road, Pune', phone: '020-66455000', beds: 550 },
  { name: 'Jehangir Hospital', lat: 18.5280, lng: 73.8770, address: 'Sassoon Road, Pune', phone: '020-66811000', beds: 350 },
  { name: 'Deenanath Mangeshkar Hospital', lat: 18.5013, lng: 73.8090, address: 'Erandwane, Pune', phone: '020-66023000', beds: 800 },
  { name: 'Bharati Vidyapeeth Medical College', lat: 18.4566, lng: 73.8509, address: 'Katraj, Pune', phone: '020-24375555', beds: 1000 },
  // Mumbai
  { name: 'KEM Hospital, Mumbai', lat: 19.0012, lng: 72.8428, address: 'Parel, Mumbai', phone: '022-24136051', beds: 2000 },
  { name: 'JJ Hospital', lat: 18.9640, lng: 72.8359, address: 'JJ Marg, Mumbai', phone: '022-23735555', beds: 1352 },
  { name: 'Sion Hospital', lat: 19.0445, lng: 72.8620, address: 'Sion, Mumbai', phone: '022-24076381', beds: 1000 },
  { name: 'Lilavati Hospital', lat: 19.0510, lng: 72.8285, address: 'Bandra, Mumbai', phone: '022-26751000', beds: 300 },
  { name: 'Hinduja Hospital', lat: 19.0368, lng: 72.8405, address: 'Mahim, Mumbai', phone: '022-24451515', beds: 350 },
  // Nagpur
  { name: 'Government Medical College, Nagpur', lat: 21.1509, lng: 79.0702, address: 'Hanuman Nagar, Nagpur', phone: '0712-2726371', beds: 1600 },
  { name: 'AIIMS Nagpur', lat: 21.2060, lng: 79.0744, address: 'Mihan, Nagpur', phone: '0712-2249900', beds: 960 },
  { name: 'Orange City Hospital', lat: 21.1396, lng: 79.0738, address: 'Nagpur', phone: '0712-6616600', beds: 300 },
  // Nashik
  { name: 'Civil Hospital, Nashik', lat: 20.0001, lng: 73.7835, address: 'Old Gangapur Rd, Nashik', phone: '0253-2575013', beds: 750 },
  { name: 'Wockhardt Hospital Nashik', lat: 19.9898, lng: 73.7632, address: 'Nashik', phone: '0253-6613000', beds: 200 },
  // Kolhapur
  { name: 'CPR Hospital, Kolhapur', lat: 16.7023, lng: 74.2324, address: 'Kolhapur', phone: '0231-2653166', beds: 600 },
  // Aurangabad
  { name: 'Government Medical College, Aurangabad', lat: 19.8769, lng: 75.3176, address: 'Aurangabad', phone: '0240-2400200', beds: 900 },
  // Solapur
  { name: 'Civil Hospital, Solapur', lat: 17.6558, lng: 75.9054, address: 'Solapur', phone: '0217-2315600', beds: 500 },
  // Satara
  { name: 'Civil Hospital, Satara', lat: 17.6877, lng: 74.0007, address: 'Satara', phone: '02162-234401', beds: 400 },
  // Ratnagiri
  { name: 'Civil Hospital, Ratnagiri', lat: 16.9944, lng: 73.3000, address: 'Ratnagiri', phone: '02352-222226', beds: 350 },
  // Sangli
  { name: 'Government Hospital, Sangli', lat: 16.8560, lng: 74.5647, address: 'Sangli', phone: '0233-2302800', beds: 400 },
  // Thane
  { name: 'Civil Hospital, Thane', lat: 19.1888, lng: 72.9692, address: 'Thane', phone: '022-25331500', beds: 550 },
  // Amravati
  { name: 'Government Medical College, Amravati', lat: 20.9325, lng: 77.7720, address: 'Amravati', phone: '0721-2662360', beds: 500 },
];

// ─────────────────────────────────────────────────────────
//  Utility: Haversine distance (km)
// ─────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────
//  Utility: Build a "road-like" polyline between two points
//  (Produces a realistic-looking path with intermediate waypoints)
// ─────────────────────────────────────────────────────────
function buildRoutePath(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): [number, number][] {
  const steps = 6;
  const path: [number, number][] = [[fromLat, fromLng]];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    // Add slight lateral offsets that follow road-like zig-zag
    const jitterLat = (Math.sin(t * Math.PI * 3) * 0.004 * (1 - t));
    const jitterLng = (Math.cos(t * Math.PI * 2) * 0.003 * t);
    path.push([
      fromLat + (toLat - fromLat) * t + jitterLat,
      fromLng + (toLng - fromLng) * t + jitterLng,
    ]);
  }
  path.push([toLat, toLng]);
  return path;
}

// ─────────────────────────────────────────────────────────
//  Custom icon factories
// ─────────────────────────────────────────────────────────
function victimIcon() {
  return L.divIcon({
    html: `<div style="
      background: #ef4444; color: white; border-radius: 50%;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      font-size: 18px; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,.35);
      animation: pulse-ring 1.5s ease-out infinite;
    ">🚨</div>
    <style>
      @keyframes pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,.6); }
        70% { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
      }
    </style>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function hospitalIcon(rank: number) {
  const colors = ['#059669', '#0891b2', '#7c3aed', '#d97706', '#6b7280'];
  const bg = colors[rank] || colors[4];
  return L.divIcon({
    html: `<div style="
      background: ${bg}; color: white; border-radius: 8px;
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      font-size: 15px; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.3);
    ">🏥</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ─────────────────────────────────────────────────────────
//  Route colors per hospital rank
// ─────────────────────────────────────────────────────────
const ROUTE_COLORS = ['#059669', '#0891b2', '#7c3aed', '#d97706', '#6b7280'];
const ROUTE_LABELS = ['Nearest', '2nd Nearest', '3rd Nearest', '4th Nearest', '5th Nearest'];

// ─────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────

interface Props {
  selectedDisaster: Disaster | null;
}

export default function HospitalFinderMap({ selectedDisaster }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [nearestHospitals, setNearestHospitals] = useState<Hospital[]>([]);

  // ──── Init map once ────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapContainerRef.current, {
      center: [19.7515, 75.7139], // Maharashtra center
      zoom: 7,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // OpenStreetMap tile — shows cities, districts, wards, roads
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ──── Update markers/routes when disaster changes ────
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    if (!selectedDisaster) {
      setNearestHospitals([]);
      mapInstanceRef.current.setView([19.7515, 75.7139], 7);
      return;
    }

    const { lat, lng } = selectedDisaster;

    // Calculate distance & sort
    const withDist: Hospital[] = MAHARASHTRA_HOSPITALS.map((h) => ({
      ...h,
      distanceKm: Math.round(haversineKm(lat, lng, h.lat, h.lng) * 10) / 10,
    }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);

    setNearestHospitals(withDist);

    // 1. Victim marker
    const vm = L.marker([lat, lng], { icon: victimIcon() })
      .bindPopup(
        `<div class="p-1">
          <strong class="text-red-600">🚨 ${selectedDisaster.title}</strong><br/>
          <span class="text-sm text-gray-600">${selectedDisaster.location}</span><br/>
          <span class="text-xs text-gray-500">${selectedDisaster.date}</span>
        </div>`,
      )
      .addTo(layerGroupRef.current);

    // Pulsing circle around victim
    L.circle([lat, lng], {
      radius: 800,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '6 4',
    }).addTo(layerGroupRef.current);

    // 2. Hospital markers & route lines
    const bounds: L.LatLngExpression[] = [[lat, lng]];

    withDist.forEach((h, idx) => {
      const color = ROUTE_COLORS[idx];

      // Hospital marker
      L.marker([h.lat, h.lng], { icon: hospitalIcon(idx) })
        .bindPopup(
          `<div class="p-1" style="min-width:180px">
            <strong>${h.name}</strong><br/>
            <span class="text-xs text-gray-500">${h.address}</span><br/>
            <span class="text-xs">📞 ${h.phone}</span><br/>
            <span class="text-xs">🛏️ ${h.beds} beds</span><br/>
            <span class="text-xs font-semibold" style="color:${color}">
              📍 ${h.distanceKm} km away
            </span>
          </div>`,
        )
        .addTo(layerGroupRef.current!);

      // Route polyline
      const routePath = buildRoutePath(lat, lng, h.lat, h.lng);
      L.polyline(routePath, {
        color,
        weight: idx === 0 ? 5 : 3,
        opacity: idx === 0 ? 0.9 : 0.6,
        dashArray: idx === 0 ? undefined : '8 6',
        lineCap: 'round',
      })
        .bindTooltip(`${ROUTE_LABELS[idx]} — ${h.distanceKm} km`, {
          permanent: false,
          direction: 'center',
          className: 'route-tooltip',
        })
        .addTo(layerGroupRef.current!);

      bounds.push([h.lat, h.lng]);
    });

    // Fit map to show victim + all hospitals
    mapInstanceRef.current.fitBounds(bounds as L.LatLngBoundsExpression, {
      padding: [60, 60],
      maxZoom: 13,
    });
  }, [selectedDisaster]);

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div
        ref={mapContainerRef}
        className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0"
        style={{ minHeight: 420 }}
      />

      {/* Hospital sidebar cards */}
      {nearestHospitals.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {nearestHospitals.map((h, idx) => (
            <div
              key={h.name}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 hover:shadow-md transition-shadow"
              style={{ borderLeft: `4px solid ${ROUTE_COLORS[idx]}` }}
            >
              <div className="flex items-start justify-between mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                  style={{ background: ROUTE_COLORS[idx] + '18', color: ROUTE_COLORS[idx] }}
                >
                  {ROUTE_LABELS[idx]}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {h.distanceKm} km
                </span>
              </div>
              <h4 className="font-semibold text-sm text-gray-900 leading-tight mb-1 line-clamp-2">
                {h.name}
              </h4>
              <p className="text-[11px] text-gray-500 mb-1.5 truncate">{h.address}</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-600">🛏️ {h.beds} beds</span>
                <a
                  href={`tel:${h.phone}`}
                  className="text-blue-600 font-medium hover:underline"
                >
                  📞 Call
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
