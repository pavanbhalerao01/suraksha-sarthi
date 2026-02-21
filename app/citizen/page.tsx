"use client";

import { useState } from "react";
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
  Upload
} from "lucide-react";

export default function CitizenPortal() {
  const [sosActive, setSosActive] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

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

      <div className="max-w-4xl mx-auto px-4 py-6">
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
      </div>
    </div>
  );
}
