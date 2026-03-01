"use client";

import { useState, useEffect } from "react";
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
  HeartPulse,
  Ambulance,
  X,
  Check,
  Building2,
  ChevronRight,
  Activity,
  Loader2,
  User,
} from "lucide-react";
import type { Disaster } from "@/components/maps/HospitalFinderMap";

// Dynamic import — Leaflet must not SSR
const HospitalFinderMap = dynamic(
  () => import("@/components/maps/HospitalFinderMap"),
  { ssr: false, loading: () => <div className="h-[480px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading map…</div> },
);

// ─────────────────────────────────────────────────────────────────────────────
//  Demo SOS disasters across Maharashtra
// ─────────────────────────────────────────────────────────────────────────────
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
  const [medicalSosActive, setMedicalSosActive] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [sosTicketId, setSosTicketId] = useState("");
  const [medicalTicketId, setMedicalTicketId] = useState("");
  const [activeTab, setActiveTab] = useState<"sos" | "hospitals">("sos");
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);

  // ── SOS Dialog state ──
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [sosDisasterType, setSosDisasterType] = useState("flood");
  const [sosGps, setSosGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submittingSOS, setSubmittingSOS] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; phone: string } | null>(null);

  const disasterTypes = [
    { value: "flood",            label: "🌊 Flood" },
    { value: "fire",             label: "🔥 Fire" },
    { value: "earthquake",       label: "🏚️ Earthquake" },
    { value: "landslide",        label: "⛰️ Landslide" },
    { value: "cyclone",          label: "🌀 Cyclone" },
    { value: "building_collapse",label: "🏗️ Building Collapse" },
    { value: "heatwave",         label: "☀️ Heatwave" },
    { value: "other",            label: "⚠️ Other Emergency" },
  ];

  // Pre-fetch user profile on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setUserProfile({ name: data.user.name || "", phone: data.user.phone || "" });
        }
      })
      .catch(() => {});
  }, []);

  // Opens the SOS dialog and immediately starts fetching GPS + user
  const openSOSDialog = () => {
    if (sosActive) return;
    setSosGps(null);
    setLocationError(null);
    setGettingLocation(true);
    setSosError(null);
    setShowSOSDialog(true);

    // Fetch GPS and latest user profile in parallel
    Promise.allSettled([
      new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) { reject(new Error("GPS not supported")); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }),
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([gpsResult, profileResult]) => {
      if (gpsResult.status === "fulfilled") {
        setSosGps(gpsResult.value);
      } else {
        setLocationError("Could not get GPS. Location will be marked unavailable.");
      }
      if (profileResult.status === "fulfilled" && profileResult.value?.user) {
        setUserProfile({ name: profileResult.value.user.name || "", phone: profileResult.value.user.phone || "" });
      }
      setGettingLocation(false);
    });
  };

  // Submits the SOS after the user confirms in the dialog
  const handleSendSOS = async () => {
    setSubmittingSOS(true);
    setSosError(null);
    const name  = userProfile?.name  || "Emergency Caller";
    const phone = userProfile?.phone || "Unknown";
    try {
      const res = await fetch("/api/citizen-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          disasterType: sosDisasterType,
          description: `Emergency SOS — ${sosDisasterType} reported by ${name}. Immediate assistance required.`,
          address: sosGps
            ? `GPS: ${sosGps.lat.toFixed(6)}, ${sosGps.lng.toFixed(6)}`
            : "Location unavailable",
          lat: sosGps?.lat ?? null,
          lng: sosGps?.lng ?? null,
          severity: "HIGH",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSosActive(true);
        setSosTicketId(data.data.ticketId);
        setShowSOSDialog(false);
      } else {
        setSosError(data.error || "Failed to send SOS. Please call 112.");
      }
    } catch {
      setSosError("Network error. Please call 112 directly.");
    } finally {
      setSubmittingSOS(false);
    }
  };

  const handleCancelSOS = () => {
    if (confirm("Are you sure you want to cancel this SOS?\n\nOnly cancel if the emergency is resolved or was sent by mistake.")) {
      setSosActive(false);
      setSosTicketId("");
    }
  };
  
  const handleReceivedHelp = () => {
    if (confirm("Have you received help from authorities?\n\nClick OK to mark this emergency as resolved.")) {
      setSosActive(false);
      setSosTicketId("");
    }
  };
  
  const handleCancelMedicalSOS = () => {
    if (confirm("Are you sure you want to cancel this Medical SOS?\n\nOnly cancel if help is no longer needed or was sent by mistake.")) {
      setMedicalSosActive(false);
      setMedicalTicketId("");
      alert(`✓ Medical SOS Cancelled\n\nTicket ${medicalTicketId} has been cancelled.\nAmbulance and medical team have been notified.`);
    }
  };
  
  const handleReceivedMedicalHelp = () => {
    if (confirm("Have you received medical assistance?\n\nClick OK to mark this medical emergency as resolved.")) {
      setMedicalSosActive(false);
      setMedicalTicketId("");
      alert(`✓ Medical Help Received - Emergency Resolved\n\nTicket ${medicalTicketId} marked as complete.\nWe hope you're safe. Take care!`);
    }
  };

  const handleMedicalSOS = async () => {
    setMedicalSosActive(true);
    const ticketId = "MED-SOS-" + Date.now().toString(36).toUpperCase();
    setMedicalTicketId(ticketId);
    
    // Get GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In production: Send to medical team API
          // This would create a patient entry with RED triage priority
          const medicalSosData = {
            ticketId,
            type: 'medical_emergency',
            priority: 'RED',
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            timestamp: new Date().toISOString(),
            status: 'pending',
            patientName: 'Emergency SOS Caller',
            condition: 'Medical Emergency - Immediate Attention Required',
          };
          
          console.log('Medical SOS Data:', medicalSosData);
          
          alert(`🚑 MEDICAL EMERGENCY SOS ACTIVATED!\n\n✓ Ambulance dispatched to your location\n✓ Medical team alerted with RED priority\n✓ GPS coordinates shared\n\nTicket ID: ${ticketId}\n\nHelp is on the way! Stay calm and stay on the line if you called emergency services.`);
        },
        (error) => {
          alert(`🚑 MEDICAL EMERGENCY SOS ACTIVATED!\n\nTicket ID: ${ticketId}\n\n⚠️ GPS unavailable, but medical team has been alerted.\n\nPlease provide your location to emergency responders.`);
        }
      );
    } else {
      alert(`🚑 MEDICAL EMERGENCY SOS ACTIVATED!\n\nTicket ID: ${ticketId}\n\nMedical team has been alerted.\nPlease provide your location when they contact you.`);
    }
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

        {activeTab === "sos" && (
        <>
        {/* Emergency SOS Buttons Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* General Emergency SOS */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl shadow-2xl text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Emergency SOS</h2>
              <p className="text-red-100 mb-4 text-sm">
                Immediate danger, disaster, or life-threatening situation
              </p>
              <button 
                onClick={openSOSDialog}
                disabled={sosActive}
                className={`w-40 h-40 mx-auto rounded-full font-bold text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center ${
                  sosActive 
                    ? 'bg-green-500 animate-pulse cursor-default' 
                    : 'bg-white text-red-600 hover:bg-red-50'
                }`}
              >
                {sosActive ? (
                  <>
                    <CheckCircle className="w-12 h-12 mb-2" />
                    <span className="text-base">SOS Sent!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-12 h-12 mb-2" />
                    <span>HELP!</span>
                  </>
                )}
              </button>
              {sosActive && (
                <div className="mt-4 space-y-3">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <p className="font-semibold text-sm">✓ SOS sent to authorities</p>
                    <p className="text-green-100 text-xs">Your location &amp; details are with the rescue team</p>
                    <p className="text-green-100 text-xs font-mono mt-1">🎫 {sosTicketId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReceivedHelp}
                      className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Help Received
                    </button>
                    <button
                      onClick={handleCancelSOS}
                      className="flex-1 px-4 py-2.5 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition flex items-center justify-center gap-2 text-sm border border-white/50"
                    >
                      <X className="w-4 h-4" />
                      Cancel SOS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical Emergency SOS */}
          <div className="bg-gradient-to-br from-rose-600 to-red-800 p-6 rounded-2xl shadow-2xl text-white border-2 border-white/30">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <HeartPulse className="w-6 h-6" />
                Medical Emergency
              </h2>
              <p className="text-red-100 mb-4 text-sm">
                Heart attack, severe injury, medical crisis
              </p>
              <button 
                onClick={handleMedicalSOS}
                className={`w-40 h-40 mx-auto rounded-full font-bold text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                  medicalSosActive 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-white text-rose-600 hover:bg-red-50'
                }`}
              >
                {medicalSosActive ? (
                  <div className="flex flex-col items-center">
                    <Ambulance className="w-12 h-12 mb-2" />
                    <span className="text-base">Dispatched!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <HeartPulse className="w-12 h-12 mb-2" />
                    <span>AMBULANCE!</span>
                  </div>
                )}
              </button>
              {medicalSosActive && (
                <div className="mt-4 space-y-3">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <p className="font-semibold text-sm">✓ Ambulance dispatched (RED priority)</p>
                    <p className="text-green-100 text-xs">Medical team alerted with GPS</p>
                    <p className="text-green-100 text-xs font-mono mt-1">ID: {medicalTicketId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReceivedMedicalHelp}
                      className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Help Received
                    </button>
                    <button
                      onClick={handleCancelMedicalSOS}
                      className="flex-1 px-4 py-2.5 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition flex items-center justify-center gap-2 text-sm border border-white/50"
                    >
                      <X className="w-4 h-4" />
                      Cancel SOS
                    </button>
                  </div>
                </div>
              )}
            </div>
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

        {/* ── Emergency SOS Dialog ── */}
        {showSOSDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Send Emergency SOS
                  </h3>
                  <p className="text-red-200 text-xs mt-0.5">Confirm your details and select emergency type</p>
                </div>
                <button
                  onClick={() => setShowSOSDialog(false)}
                  className="p-1.5 hover:bg-red-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* User info — auto-fetched, read-only */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Details (from account)</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-semibold text-gray-800">
                        {userProfile?.name || "Fetching…"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-800">
                        {userProfile?.phone || "Fetching…"}
                      </p>
                    </div>
                  </div>
                  {/* GPS status */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      gettingLocation ? "bg-blue-100" : sosGps ? "bg-green-100" : "bg-orange-100"
                    }`}>
                      {gettingLocation
                        ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        : sosGps
                        ? <MapPin className="w-4 h-4 text-green-600" />
                        : <MapPin className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">GPS Location</p>
                      {gettingLocation ? (
                        <p className="text-sm text-blue-600 font-medium">Acquiring location…</p>
                      ) : sosGps ? (
                        <p className="text-sm text-green-700 font-semibold">
                          {sosGps.lat.toFixed(5)}, {sosGps.lng.toFixed(5)}
                        </p>
                      ) : (
                        <p className="text-sm text-orange-600">{locationError || "Unavailable"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Disaster type dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Emergency Type *
                  </label>
                  <select
                    value={sosDisasterType}
                    onChange={(e) => setSosDisasterType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-base font-medium bg-white"
                  >
                    {disasterTypes.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                {sosError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{sosError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setShowSOSDialog(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendSOS}
                    disabled={submittingSOS || gettingLocation}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                  >
                    {submittingSOS ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-5 h-5" /> Send SOS 🚨</>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400">
                  Your name, phone and GPS will be sent directly to NDRF authorities.
                </p>
              </div>
            </div>
          </div>
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
                Click on any disaster / SOS below to see the 5 nearest hospitals and the shortest route on the map.
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

                {/* Map Legend */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-[11px] text-gray-500 space-y-1.5 mt-2">
                  <p className="font-semibold text-gray-700 text-xs mb-1">Map Legend</p>
                  <p>🚨 Red pulse = Victim / SOS location</p>
                  <p>🏥 Hospital markers (color-coded)</p>
                  <p>│ Solid green line = Nearest hospital route</p>
                  <p>┆ Dashed lines = Alternative hospital routes</p>
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
