"use client";

import { useState, useEffect, dynamic as _dynamic } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  AlertCircle, 
  Camera, 
  Send, 
  MapPin, 
  Phone, 
  FileText,
  CheckCircle,
  Clock,
  Shield,
  Navigation,
  Upload,
  Building2,
  ChevronRight,
  Activity,
} from "lucide-react";
import type { Disaster } from "@/components/maps/HospitalFinderMap";

// Dynamic import — Leaflet must not SSR
const HospitalFinderMap = dynamic(
  () => import("@/components/maps/HospitalFinderMap"),
  { ssr: false, loading: () => <div className="h-[480px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading map…</div> },
);

// ─────────────────────────────────────────────────────────
//  Demo SOS disasters across Maharashtra
// ─────────────────────────────────────────────────────────
const DEMO_DISASTERS: Disaster[] = [
  {
    id: "sos-001",
    type: "flood",
    title: "Flash Flood — Sinhagad Road",
    location: "Sinhagad Road, Pune",
    lat: 18.4829,
    lng: 73.8137,
    severity: "CRITICAL",
    date: "2026-02-22 14:30",
    description: "Severe waterlogging reported. Multiple residents stranded on rooftops.",
  },
  {
    id: "sos-002",
    type: "landslide",
    title: "Landslide — Lonavala Ghats",
    location: "Old Mumbai–Pune Highway, Lonavala",
    lat: 18.7525,
    lng: 73.4070,
    severity: "HIGH",
    date: "2026-02-22 12:10",
    description: "Road blocked near Khandala. 3 vehicles trapped.",
  },
  {
    id: "sos-003",
    type: "cyclone",
    title: "Cyclone Impact — Ratnagiri Coast",
    location: "Ratnagiri, Konkan",
    lat: 16.9944,
    lng: 73.3000,
    severity: "CRITICAL",
    date: "2026-02-22 08:00",
    description: "Strong winds and storm surge. Coastal villages evacuated.",
  },
  {
    id: "sos-004",
    type: "flood",
    title: "Urban Flooding — Dadar",
    location: "Dadar TT, Mumbai",
    lat: 19.0176,
    lng: 72.8432,
    severity: "HIGH",
    date: "2026-02-22 16:45",
    description: "Knee-deep water on streets. Traffic at standstill.",
  },
  {
    id: "sos-005",
    type: "heatwave",
    title: "Heatwave Alert — Nagpur",
    location: "Civil Lines, Nagpur",
    lat: 21.1458,
    lng: 79.0882,
    severity: "HIGH",
    date: "2026-02-22 13:00",
    description: "Temperature exceeding 46°C. Multiple heat-stroke cases.",
  },
];

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-300",
  HIGH: "bg-orange-100 text-orange-700 border-orange-300",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-300",
  LOW: "bg-green-100 text-green-700 border-green-300",
};

const TYPE_ICONS: Record<string, string> = {
  flood: "🌊",
  cyclone: "🌀",
  landslide: "⛰️",
  heatwave: "🔥",
  earthquake: "🏚️",
  fire: "🔥",
};

export default function CitizenPortal() {
  const [sosActive, setSosActive] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"sos" | "hospitals">("sos");
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);

  const handleSOS = () => {
    setSosActive(true);
    // In production: Get GPS location, send to backend immediately
    alert("🚨 SOS ACTIVATED!\n\nYour location and emergency alert have been sent to authorities.\nHelp is on the way.\n\nTicket ID: SOS-2025-" + Math.random().toString(36).substr(2, 9).toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Citizen Emergency Portal</h1>
                <p className="text-red-200 text-sm">Report incidents & request help</p>
              </div>
            </div>
            <Link 
              href="/portal" 
              className="px-4 py-2 bg-red-700 rounded-lg hover:bg-red-800 transition text-sm"
            >
              Switch Portal
            </Link>
          </div>
        </div>
      </header>

      <div className={activeTab === "hospitals" ? "max-w-7xl mx-auto px-4 py-6" : "max-w-4xl mx-auto px-4 py-6"}>

        {/* ─── Tab Navigation ─── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("sos")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "sos"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            SOS &amp; Reports
          </button>
          <button
            onClick={() => setActiveTab("hospitals")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "hospitals"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Nearest Hospitals
          </button>
        </div>

        {/* ━━━━━━━━━━━━  SOS TAB  ━━━━━━━━━━━━ */}
        {activeTab === "sos" && (
        <>
        {/* SOS Button - Most Prominent */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 rounded-2xl shadow-2xl mb-6 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">Emergency SOS</h2>
            <p className="text-red-100 mb-6">
              Press button below if you need immediate help. Your location will be shared with rescue teams.
            </p>
            <button 
              onClick={handleSOS}
              className={`w-48 h-48 mx-auto rounded-full font-bold text-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                sosActive 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-white text-red-600 hover:bg-red-50'
              }`}
            >
              {sosActive ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 mb-2" />
                  <span className="text-lg">SOS Sent!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertCircle className="w-16 h-16 mb-2" />
                  <span>HELP!</span>
                </div>
              )}
            </button>
            {sosActive && (
              <div className="mt-4 bg-green-600 p-3 rounded-lg">
                <p className="font-semibold">✓ Authorities have been alerted</p>
                <p className="text-green-100 text-sm">Ticket ID: SOS-2025-ABC123</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Incident Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Report an Incident</h2>
          </div>
          
          {!showReportForm ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Report non-emergency incidents like flooding, damaged infrastructure, or safety hazards in your area.
              </p>
              <button 
                onClick={() => setShowReportForm(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                File Incident Report
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              alert("✓ Incident report submitted successfully!\n\nTicket ID: INC-2025-" + Math.random().toString(36).substr(2, 9).toUpperCase() + "\n\nYou can track the status using your ticket ID.");
              setShowReportForm(false);
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Type
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option>Flooding</option>
                  <option>Building Collapse</option>
                  <option>Fire</option>
                  <option>Landslide</option>
                  <option>Road Blockage</option>
                  <option>Medical Emergency</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the incident in detail..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter address or landmark"
                    required
                  />
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                    onClick={() => alert("GPS location captured!")}
                  >
                    <Navigation className="w-4 h-4" />
                    Use GPS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">Click to upload photos of the incident</p>
                  <input type="file" accept="image/*" multiple className="hidden" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People Affected (if known)
                </label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., 10"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Contact Number
                </label>
                <input 
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Report
                </button>
                <button 
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Track Help Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Track Help Status</h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Enter your ticket ID to check the status of your SOS or incident report.
          </p>
          <div className="flex gap-2">
            <input 
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., SOS-2025-ABC123 or INC-2025-XYZ456"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Track
            </button>
          </div>
        </div>

        {/* Safety Alerts */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Active Safety Alerts</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  🌧️ <strong>Heavy Rainfall Warning:</strong> Expected in Pune district for next 48 hours. Avoid low-lying areas.
                </p>
                <p className="text-sm text-gray-700">
                  ⚠️ <strong>Flood Watch:</strong> Sinhagad Road and surrounding areas. Do not venture out unless necessary.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Find Relief Camps</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Locate nearest relief camps with food, shelter, and medical aid</p>
            <button className="text-green-600 font-medium text-sm hover:underline">
              View on Map →
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Emergency Contacts</h3>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-gray-700">🚨 NDRF: <strong>011-24363260</strong></p>
              <p className="text-gray-700">🚑 Ambulance: <strong>108</strong></p>
              <p className="text-gray-700">🚒 Fire: <strong>101</strong></p>
            </div>
          </div>
        </div>
        </>
        )}

        {/* ━━━━━━━━━━━━  HOSPITALS TAB  ━━━━━━━━━━━━ */}
        {activeTab === "hospitals" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-7 h-7" />
                <h2 className="text-2xl font-bold">Nearest Hospitals — Maharashtra</h2>
              </div>
              <p className="text-emerald-100 text-sm">
                Click on any disaster / SOS below to see the 5 nearest hospitals and the shortest route on the map. Zoom in to see wards, streets and landmarks.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* ── Disaster sidebar ── */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-red-500" />
                  Active SOS / Disasters
                  <span className="ml-auto text-xs bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
                    {DEMO_DISASTERS.length}
                  </span>
                </h3>

                {DEMO_DISASTERS.map((d) => {
                  const isSelected = selectedDisaster?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDisaster(d)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all group ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-400 shadow-md"
                          : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg mt-0.5">{TYPE_ICONS[d.type] || "⚠️"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm leading-tight">
                              {d.title}
                            </span>
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border mb-1 ${
                              SEVERITY_STYLES[d.severity] || SEVERITY_STYLES.MEDIUM
                            }`}
                          >
                            {d.severity}
                          </span>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{d.location}</span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 flex-shrink-0 mt-1 transition ${
                            isSelected ? "text-emerald-600" : "text-gray-300 group-hover:text-gray-500"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}

                {/* Helpful legend */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-[11px] text-gray-500 space-y-1.5 mt-2">
                  <p className="font-semibold text-gray-700 text-xs mb-1">Map Legend</p>
                  <p>🚨 Red pulse = Victim / SOS location</p>
                  <p>🏥 Hospital markers (color-coded)</p>
                  <p>━ Solid green line = Nearest hospital route</p>
                  <p>┅ Dashed lines = Alternative hospital routes</p>
                </div>
              </div>

              {/* ── Map + hospital cards ── */}
              <div className="lg:col-span-3">
                {!selectedDisaster ? (
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center p-16 min-h-[480px]">
                    <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Disaster</h3>
                    <p className="text-gray-500 text-sm max-w-md">
                      Click any SOS incident from the list on the left. The map will show the victim&apos;s location and route to the 5 nearest hospitals.
                    </p>
                  </div>
                ) : (
                  <HospitalFinderMap selectedDisaster={selectedDisaster} />
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
