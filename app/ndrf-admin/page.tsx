"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Eye,
  MessageSquare,
  FileDown,
  Users,
  MapPin,
  AlertTriangle,
  Radio,
  Shield,
  LayoutDashboard,
  Map,
  ClipboardList,
  Bell,
  Building2,
  Tent,
  BarChart3,
  Activity,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle2,
  Zap,
  Phone,
  User,
  Filter,
  XCircle,
  Plus,
  Edit3,
  ArrowRightLeft,
  Package,
  Search,
  Bed,
  Star,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldCheck,
  Info,
  Send,
} from "lucide-react";
import {
  cn,
  getDisasterIcon,
  getSeverityColor,
  getRelativeTime,
  getStatusColor,
} from "@/lib/utils";

// Tab configuration
type TabType =
  | "dashboard"
  | "prediction"
  | "tasks"
  | "sos"
  | "hospitals"
  | "relief-camps"
  | "analytics";

export default function NDRFAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Mock data
  const ndrfData = {
    name: "NDRF Command Center",
    region: "National Operations",
    activeIncidents: 12,
    teamsDeployed: 8,
    volunteersActive: 45,
    avgResponseTime: "18 min",
  };

  const tabs = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "prediction" as TabType,
      label: "Predictions",
      icon: Map,
    },
    {
      id: "tasks" as TabType,
      label: "Task Allocation",
      icon: ClipboardList,
    },
    {
      id: "sos" as TabType,
      label: "SOS / Alerts",
      icon: AlertTriangle,
      badge: "3",
    },
    {
      id: "hospitals" as TabType,
      label: "Hospitals",
      icon: Building2,
    },
    {
      id: "relief-camps" as TabType,
      label: "Relief Camps",
      icon: Tent,
    },
    {
      id: "analytics" as TabType,
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">
                  NDRF Admin - Disaster Response Command Center
                </h1>
                <p className="text-blue-200 text-sm">{ndrfData.region}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/portal"
                className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition text-sm"
              >
                Switch Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <p className="text-blue-900 text-sm">
            <strong>NDRF Command Center:</strong> Full control and coordination of all disaster response operations across India
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Active Incidents</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {ndrfData.activeIncidents}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Nationwide
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Teams Deployed</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {ndrfData.teamsDeployed}
            </div>
            <div className="text-xs text-gray-500 mt-1">NDRF + SDRF</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Volunteers Active</span>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {ndrfData.volunteersActive}
            </div>
            <div className="text-xs text-gray-500 mt-1">On ground now</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Avg Response Time</span>
              <Radio className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {ndrfData.avgResponseTime}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "prediction" && <PredictionTab />}
          {activeTab === "tasks" && <TasksTab />}
          {activeTab === "sos" && <SOSTab />}
          {activeTab === "hospitals" && <HospitalsTab />}
          {activeTab === "relief-camps" && <ReliefCampsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab() {
  const stats = [
    {
      label: "Active Disasters",
      value: "3",
      sub: "2 predicted",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Teams Deployed",
      value: "12",
      sub: "3 on standby",
      icon: Truck,
      color: "text-blue-600",
    },
    {
      label: "SOS Pending",
      value: "7",
      sub: "2 critical",
      icon: Bell,
      color: "text-amber-600",
    },
    {
      label: "Relief Camps",
      value: "3",
      sub: "1 at capacity",
      icon: Tent,
      color: "text-green-600",
    },
    {
      label: "People Affected",
      value: "1.2L",
      sub: "across 3 states",
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Avg Response Time",
      value: "42m",
      sub: "-8m from last week",
      icon: Clock,
      color: "text-cyan-600",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      text: "Cyclone warning issued for Puri coast — ML confidence 87%",
      time: "2 min ago",
      type: "warning",
      icon: AlertTriangle,
    },
    {
      id: 2,
      text: "SOS verified by ward member: Fire at Railway Station Road",
      time: "8 min ago",
      type: "success",
      icon: CheckCircle2,
    },
    {
      id: 3,
      text: "Team Alpha dispatched to Sector 5 flood relief",
      time: "15 min ago",
      type: "info",
      icon: Truck,
    },
    {
      id: 4,
      text: "Cuttack Relief Camp reached full capacity (1500/1500)",
      time: "32 min ago",
      type: "danger",
      icon: Tent,
    },
    {
      id: 5,
      text: "New SOS received: Building collapse at Main Bazaar",
      time: "45 min ago",
      type: "warning",
      icon: Bell,
    },
  ];

  const activeDisasters = [
    {
      type: "cyclone",
      state: "Odisha",
      district: "Puri",
      severity: "CRITICAL",
      confidence: 87,
      status: "PREDICTED",
      date: "2026-02-23",
    },
    {
      type: "flood",
      state: "Assam",
      district: "Kaziranga",
      severity: "HIGH",
      confidence: 79,
      status: "ACTIVE",
      date: "2026-02-21",
    },
    {
      type: "earthquake",
      state: "Gujarat",
      district: "Kutch",
      severity: "HIGH",
      confidence: 65,
      status: "PREDICTED",
      date: "2026-02-25",
    },
  ];

  const activityTypeColors: Record<string, string> = {
    warning: "text-amber-600",
    success: "text-green-600",
    info: "text-blue-600",
    danger: "text-red-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Command Dashboard</h2>
        <p className="text-gray-600 text-sm mt-1">
          Real-time overview of disaster situations across India
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <TrendingUp className="w-3 h-3 text-gray-400" />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-600 mt-0.5 leading-tight">
                {s.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active disasters */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active &amp; Predicted Disasters
          </h3>
          <div className="space-y-3">
            {activeDisasters.map((d, i) => (
              <div
                key={i}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getDisasterIcon(d.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 capitalize">
                        {d.type}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded border",
                          getSeverityColor(d.severity)
                        )}
                      >
                        {d.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded border text-blue-700 bg-blue-50 border-blue-200">
                        {d.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {d.district}, {d.state}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>Date: {d.date}</span>
                      <span>
                        Confidence: <strong>{d.confidence}%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 mt-0.5",
                      activityTypeColors[activity.type]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Prediction Tab Component
function PredictionTab() {
  const [activeModel, setActiveModel] = useState("all");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch predictions from API
  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/predictions');
      const data = await response.json();
      
      if (data.fallback) {
        setError(data.error);
      }
      
      setPredictions(data.predictions || []);
    } catch (err) {
      setError('Failed to load predictions. Please ensure the backend server is running.');
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and set up polling
  React.useEffect(() => {
    fetchPredictions();
    
    // Refresh predictions every 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const models = [
    { id: "all", label: "All Models" },
    { id: "cyclone", label: "🌀 Cyclone" },
    { id: "flood", label: "🌊 Flood" },
    { id: "earthquake", label: "🌍 Earthquake" },
    { id: "landslide", label: "⛰️ Landslide" },
    { id: "heatwave", label: "🌡️ Heatwave" },
    { id: "forest_fire", label: "🔥 Forest Fire" },
  ];

  // Strict filtering by disaster type
  const filtered =
    activeModel === "all"
      ? predictions
      : predictions.filter((p) => {
          const predictionType = (p.type || "").toLowerCase().trim();
          const filterType = activeModel.toLowerCase().trim();
          const matches = predictionType === filterType;
          return matches;
        });

  // Debug log to verify filtering
  console.log(`[Filter Debug] Active model: "${activeModel}", Total predictions: ${predictions.length}, Filtered: ${filtered.length}`);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Disaster Predictions
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          7-day AI-powered disaster forecast • Multiple ML model endpoints
        </p>
      </div>

      {/* Model selector */}
      <div className="flex flex-wrap gap-2">
        {models.map((m) => {
          const count = m.id === "all" 
            ? predictions.length 
            : predictions.filter((p) => {
                const predictionType = (p.type || "").toLowerCase().trim();
                return predictionType === m.id.toLowerCase().trim();
              }).length;
          
          return (
            <button
              key={m.id}
              onClick={() => setActiveModel(m.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                activeModel === m.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
              )}
            >
              {m.label}
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold bg-black bg-opacity-20">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Backend Service Unavailable</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                Please run: <code className="bg-red-100 px-2 py-0.5 rounded">cd backend && python main.py</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {activeModel === "all" 
                ? "Loading disaster predictions..." 
                : `Loading ${activeModel} predictions...`}
            </p>
          </div>
        </div>
      )}

      {/* Predictions list */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Info className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-blue-900 font-medium mb-2">
            {activeModel === "all" 
              ? "No Risks Detected" 
              : `No ${activeModel.charAt(0).toUpperCase() + activeModel.slice(1)} Risk Detected`}
          </p>
          <p className="text-blue-700 text-sm">
            {activeModel === "all" 
              ? "All monitored locations are safe. No disaster risks detected at this time." 
              : `No ${activeModel} risk detected in monitored areas.`}
          </p>
          <p className="text-blue-600 text-xs mt-3">
            System monitors real-time data. Predictions appear only when actual risk exists.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-gray-50 p-5 rounded-lg border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{getDisasterIcon(p.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-gray-900 text-lg capitalize">
                      {p.type}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded border font-medium",
                        getSeverityColor(p.severity)
                      )}
                    >
                      {p.severity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {p.location && `${p.location}, `}{p.district}, {p.state}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{p.description}</p>
                  
                  {/* 7-Day Forecast Timeline */}
                  {p.forecast_7day && p.forecast_dates && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-3">7-Day Forecast</div>
                      <div className="flex gap-2">
                        {p.forecast_7day.map((risk: number, index: number) => {
                          const date = new Date(p.forecast_dates[index]);
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                          const dayNum = date.getDate();
                          
                          let riskColor = 'bg-green-100 border-green-300 text-green-800';
                          let riskLabel = 'Low';
                          
                          if (risk >= 80) {
                            riskColor = 'bg-red-100 border-red-400 text-red-900';
                            riskLabel = 'Critical';
                          } else if (risk >= 60) {
                            riskColor = 'bg-orange-100 border-orange-400 text-orange-900';
                            riskLabel = 'High';
                          } else if (risk >= 40) {
                            riskColor = 'bg-yellow-100 border-yellow-400 text-yellow-900';
                            riskLabel = 'Moderate';
                          }
                          
                          return (
                            <div key={index} className="flex-1 min-w-0">
                              <div className={cn(
                                "rounded-lg border-2 p-2 text-center transition-all hover:shadow-md",
                                riskColor,
                                p.date === p.forecast_dates[index] && "ring-2 ring-blue-500"
                              )}>
                                <div className="text-xs font-bold">{dayName}</div>
                                <div className="text-xs opacity-75">{dayNum}</div>
                                <div className="mt-2 text-lg font-bold">{risk}%</div>
                                <div className="text-xs mt-1">{riskLabel}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Peak risk day highlighted
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className="text-sm font-bold text-green-600">
                        {p.confidence}%
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Peak Date</div>
                      <div className="text-sm font-bold text-gray-900">
                        {p.date}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">Affected Area</div>
                      <div className="text-sm font-bold text-gray-900">
                        {p.affectedArea}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="text-xs text-gray-500">People at Risk</div>
                      <div className="text-sm font-bold text-gray-900">
                        {p.affectedPeople}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Model: {p.model}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tasks Tab Component
function TasksTab() {
  const disasters = [
    {
      id: "dis-001",
      type: "cyclone",
      severity: "CRITICAL",
      state: "Odisha",
      district: "Puri",
      date: "2026-02-23",
      status: "PREDICTED",
      affectedPeople: "1.5 Lakh",
    },
    {
      id: "dis-002",
      type: "flood",
      severity: "HIGH",
      state: "Assam",
      district: "Kaziranga",
      date: "2026-02-24",
      status: "ACTIVE",
      affectedPeople: "85,000",
    },
  ];

  const teams = [
    {
      id: "team-alpha",
      name: "Alpha Force — Odisha NDRF",
      state: "Odisha",
      district: "Cuttack",
      status: "AVAILABLE",
      memberCount: 25,
      expertise: ["flood", "cyclone", "landslide"],
      distanceKm: 85,
    },
    {
      id: "team-bravo",
      name: "Bravo Squad — Maharashtra SDRF",
      state: "Maharashtra",
      district: "Nagpur",
      status: "AVAILABLE",
      memberCount: 20,
      expertise: ["earthquake", "landslide", "fire"],
      distanceKm: 320,
    },
  ];

  const [selectedDisaster, setSelectedDisaster] = useState(disasters[0]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          <Brain className="w-6 h-6 inline mr-2 text-blue-600" />
          Intelligent Task Allocation
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          AI-powered team matching → Full dispatch control
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>NDRF Control:</strong> The AI engine scores each available
            rescue team based on expertise match, proficiency score, and
            proximity to the disaster site. You have full authority to dispatch teams.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disaster selector */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Select Disaster
          </h3>
          <div className="space-y-3">
            {disasters.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDisaster(d)}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  selectedDisaster.id === d.id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white border-gray-200 hover:border-blue-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getDisasterIcon(d.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 capitalize text-sm">
                        {d.type}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded border",
                          getSeverityColor(d.severity)
                        )}
                      >
                        {d.severity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {d.district}, {d.state}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {d.affectedPeople} at risk
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Team recommendations */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-3">
            Available Teams
          </h3>
          <div className="space-y-4">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{team.name}</h4>
                    <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {team.district}, {team.state}
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="flex items-center gap-1 bg-blue-100 border border-blue-300 rounded-full px-3 py-1">
                      <Star className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-700 font-bold">
                        Best Match
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="text-xs bg-green-50 border border-green-200 text-green-700 rounded px-2 py-1">
                    ✓ {team.status}
                  </div>
                  <div className="text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-1">
                    👥 {team.memberCount} members
                  </div>
                  <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded px-2 py-1">
                    📍 ~{team.distanceKm} km away
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.expertise.map((e) => (
                    <span
                      key={e}
                      className={cn(
                        "text-xs px-2 py-1 rounded border capitalize",
                        team.expertise.includes(selectedDisaster.type)
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-gray-600 bg-gray-50 border-gray-200"
                      )}
                    >
                      {getDisasterIcon(e)} {e}
                    </span>
                  ))}
                </div>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                  Dispatch Team
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// SOS Tab Component
function SOSTab() {
  const [filter, setFilter] = useState("ALL");
  const [sendingSOSId, setSendingSOSId] = useState<string | null>(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState<any>(null);
  const [sosResponse, setSOSResponse] = useState<any>(null);
  const [sendingRescueAlert, setSendingRescueAlert] = useState<string | null>(null);
  const [sendingCitizenAlert, setSendingCitizenAlert] = useState<string | null>(null);
  const [alertResponse, setAlertResponse] = useState<any>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [forwardingTeam, setForwardingTeam] = useState(false);

  // Function to send alert to rescue teams
  const handleSendRescueAlert = async (sos: any) => {
    setSendingRescueAlert(sos.id);
    setAlertResponse(null);
    
    try {
      const response = await fetch("http://localhost:8000/api/alerts/rescue-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disaster_id: sos.id,
          disaster_type: sos.disasterType,
          title: sos.title,
          description: sos.description,
          severity: sos.severity,
          location: sos.address,
          affected_area: `${sos.affectedFamilies} families affected`,
          affected_people: `${sos.injuredCount} injured`,
          sent_by: "NDRF_ADMIN"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlertResponse({
          type: 'rescue',
          ...data.data
        });
        setShowAlertModal(true);
      } else {
        alert("Failed to send rescue team alert: " + (data.detail || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending rescue team alert:", error);
      alert("Failed to send rescue team alert. Please ensure backend is running.");
    } finally {
      setSendingRescueAlert(null);
    }
  };

  // Function to send alert to citizens
  const handleSendCitizenAlert = async (sos: any) => {
    setSendingCitizenAlert(sos.id);
    setAlertResponse(null);
    
    try {
      const response = await fetch("http://localhost:8000/api/alerts/citizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disaster_id: sos.id,
          disaster_type: sos.disasterType,
          title: `⚠️ ${sos.disasterType.toUpperCase()} ALERT: ${sos.title}`,
          description: sos.description,
          severity: sos.severity,
          location: sos.address,
          affected_area: `${sos.affectedFamilies} families affected`,
          affected_people: `${sos.injuredCount} injured`,
          safety_instructions: getSafetyInstructions(sos.disasterType),
          sent_by: "NDRF_ADMIN"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlertResponse({
          type: 'citizen',
          ...data.data
        });
        setShowAlertModal(true);
      } else {
        alert("Failed to send citizen alert: " + (data.detail || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending citizen alert:", error);
      alert("Failed to send citizen alert. Please ensure backend is running.");
    } finally {
      setSendingCitizenAlert(null);
    }
  };

  // Get safety instructions based on disaster type
  const getSafetyInstructions = (disasterType: string): string => {
    const instructions: Record<string, string> = {
      flood: "Move to higher ground immediately. Do not walk through moving water. Avoid contact with floodwater. Listen to authorities.",
      fire: "Evacuate immediately. Stay low to avoid smoke. Do not use elevators. Call emergency services.",
      forest_fire: "Evacuate if ordered. Close all windows and doors. Move to a cleared area. Monitor air quality. Stay indoors if smoke is heavy.",
      earthquake: "Drop, Cover, and Hold On. Stay away from windows. If outside, move away from buildings. After shaking stops, evacuate carefully.",
      cyclone: "Stay indoors. Move to a safe room away from windows. Stock emergency supplies. Follow evacuation orders.",
      landslide: "Move away from the path of the landslide. Do not return until area is declared safe. Watch for flooding.",
      heatwave: "Stay hydrated. Avoid outdoor activities during peak heat. Stay in air-conditioned areas. Check on vulnerable persons."
    };
    return instructions[disasterType.toLowerCase()] || "Follow local authority instructions. Stay safe and alert.";
  };

  // Function to open forward modal
  const handleForwardSOS = (sos: any) => {
    setSelectedSOS(sos);
    setShowForwardModal(true);
    setSelectedTeam(null);
  };

  // Function to forward SOS to selected team
  const confirmForwardSOS = async () => {
    if (!selectedSOS || !selectedTeam) return;
    
    setForwardingTeam(true);
    
    try {
      // Simulate forwarding to team (you can integrate with backend later)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`✅ SOS successfully forwarded to ${selectedTeam}\n\nIncident: ${selectedSOS.title}\nLocation: ${selectedSOS.address}\n\nThe team has been notified and will respond shortly.`);
      
      setShowForwardModal(false);
      setSelectedSOS(null);
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error forwarding SOS:", error);
      alert("Failed to forward SOS. Please try again.");
    } finally {
      setForwardingTeam(false);
    }
  };

  // Function to send SOS to all volunteers
  const handleSendSOS = async (sos: any) => {
    setSelectedSOS(sos);
    setShowSOSModal(true);
  };

  const confirmSendSOS = async () => {
    if (!selectedSOS) return;
    
    setSendingSOSId(selectedSOS.id);
    setSOSResponse(null);
    
    try {
      const response = await fetch("/api/sos-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: selectedSOS.id,
          disasterType: selectedSOS.disasterType,
          title: selectedSOS.title,
          description: selectedSOS.description,
          severity: selectedSOS.severity,
          location: { lat: 20.2961, lng: 85.8245 }, // Default coordinates from address
          address: selectedSOS.address,
          reporterName: selectedSOS.reporter,
          reporterPhone: selectedSOS.phone,
          sentBy: "NDRF_ADMIN"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSOSResponse(data.data);
        // Keep modal open to show success message
      } else {
        alert("Failed to send SOS: " + data.error);
        setShowSOSModal(false);
      }
    } catch (error) {
      console.error("Error sending SOS:", error);
      alert("Failed to send SOS alert. Please try again.");
      setShowSOSModal(false);
    } finally {
      setSendingSOSId(null);
    }
  };

  const sosList = [
    {
      id: "sos-001",
      title: "Flooding in residential colony",
      description:
        "Water level rising rapidly. Multiple families trapped on rooftops.",
      disasterType: "flood",
      severity: "CRITICAL",
      address: "Sector 5, Near Water Tank, Bhubaneswar",
      status: "WARD_NOTIFIED",
      reporter: "Priya Patel",
      phone: "+91-9812345678",
      injuredCount: 3,
      affectedFamilies: 12,
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    },
    {
      id: "sos-002",
      title: "Building collapse after tremors",
      description: "Old building collapsed. Estimated 8-10 people trapped.",
      disasterType: "earthquake",
      severity: "HIGH",
      address: "Main Bazaar Road, Old Town, Bhubaneswar",
      status: "UNVERIFIED",
      reporter: "Arun Singh",
      phone: "+91-9812345679",
      injuredCount: 8,
      affectedFamilies: 4,
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
      id: "sos-003",
      title: "Fire in slum area",
      description: "Large fire spreading. Medical assistance needed urgently.",
      disasterType: "fire",
      severity: "HIGH",
      address: "Slum Area, Railway Station Road, Bhubaneswar",
      status: "VERIFIED",
      reporter: "Meena Devi",
      phone: "+91-9812345680",
      injuredCount: 5,
      affectedFamilies: 30,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
  ];

  const statusFilters = [
    "ALL",
    "UNVERIFIED",
    "WARD_NOTIFIED",
    "VERIFIED",
    "DISPATCHED",
    "RESOLVED",
  ];
  const filtered =
    filter === "ALL" ? sosList : sosList.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          <Bell className="w-6 h-6 inline mr-2 text-amber-600" />
          SOS Alerts &amp; Management
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Full control over emergency reports • Verify and dispatch teams
        </p>
      </div>

      {/* Workflow banner */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 font-medium mb-2 uppercase">
          SOS Validation Workflow
        </p>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {[
            "🆕 New SOS",
            "→",
            "📋 UNVERIFIED",
            "→",
            "📞 WARD NOTIFIED",
            "→",
            "✅ VERIFIED",
            "→",
            "🚁 DISPATCHED",
            "→",
            "✔ RESOLVED",
          ].map((step, i) => (
            <span
              key={i}
              className={cn(
                "font-medium",
                step === "→"
                  ? "text-gray-400"
                  : "bg-white border border-gray-200 px-2 py-1 rounded text-gray-700"
              )}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
            )}
          >
            {f} {f !== "ALL" && `(${sosList.filter((s) => s.status === f).length})`}
          </button>
        ))}
      </div>

      {/* SOS list */}
      <div className="space-y-4">
        {filtered.map((sos) => (
          <div
            key={sos.id}
            className="bg-gray-50 p-5 rounded-lg border border-gray-200"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{getDisasterIcon(sos.disasterType)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-semibold text-gray-900">
                    {sos.title}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded border",
                      getSeverityColor(sos.severity)
                    )}
                  >
                    {sos.severity}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded border",
                      getStatusColor(sos.status)
                    )}
                  >
                    {sos.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{sos.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">
                      <MapPin className="w-3 h-3 inline" /> Location
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {sos.address}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">
                      <User className="w-3 h-3 inline" /> Reporter
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {sos.reporter}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">
                      <Phone className="w-3 h-3 inline" /> Phone
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {sos.phone}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline" /> Reported
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {getRelativeTime(sos.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => handleForwardSOS(sos)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
                  >
                    📤 Forward SOS
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    🚁 Dispatch Team
                  </button>
                  <button 
                    onClick={() => handleSendRescueAlert(sos)}
                    disabled={sendingRescueAlert === sos.id}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingRescueAlert === sos.id ? (
                      <>⏳ Sending...</>
                    ) : (
                      <>🚒 Rescue Team Alert</>
                    )}
                  </button>
                  <button 
                    onClick={() => handleSendCitizenAlert(sos)}
                    disabled={sendingCitizenAlert === sos.id}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingCitizenAlert === sos.id ? (
                      <>⏳ Sending...</>
                    ) : (
                      <>📱 Citizen Alert</>
                    )}
                  </button>
                  <button 
                    onClick={() => handleSendSOS(sos)}
                    disabled={sendingSOSId === sos.id}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingSOSId === sos.id ? (
                      <>⏳ Sending...</>
                    ) : (
                      <>📢 Alert Volunteers</>
                    )}
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium">
                    ⛔ Mark as False
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forward SOS Modal */}
      {showForwardModal && selectedSOS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Send className="w-6 h-6" />
                Forward SOS to Response Team
              </h3>
              <p className="text-green-100 mt-1">Select the appropriate team to handle this emergency</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Incident Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">📋 Incident Details</h5>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">Type:</span> <span className="font-medium text-gray-900">{selectedSOS.disasterType}</span></div>
                  <div><span className="text-gray-600">Title:</span> <span className="font-medium text-gray-900">{selectedSOS.title}</span></div>
                  <div><span className="text-gray-600">Location:</span> <span className="font-medium text-gray-900">{selectedSOS.address}</span></div>
                  <div><span className="text-gray-600">Severity:</span> <span className="font-medium text-red-600">{selectedSOS.severity}</span></div>
                </div>
              </div>

              {/* Team Selection */}
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">🚨 Select Response Team:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'fire', name: '🚒 Fire Department', desc: 'Fire, rescue operations' },
                    { id: 'police', name: '👮 Police / Defense Team', desc: 'Security, crowd control' },
                    { id: 'medical', name: '🚑 Medical / Ambulance', desc: 'Medical emergencies, injuries' },
                    { id: 'ndrf', name: '🛡️ NDRF', desc: 'Disaster response force' },
                    { id: 'civil', name: '🏛️ Civil Defense', desc: 'Civil protection, evacuation' },
                    { id: 'power', name: '⚡ Power Department', desc: 'Electrical emergencies' },
                    { id: 'water', name: '💧 Water & Sanitation', desc: 'Water supply, sanitation' },
                    { id: 'forest', name: '🌲 Forest Department', desc: 'Forest fires, wildlife' },
                  ].map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team.name)}
                      className={cn(
                        "text-left p-4 rounded-lg border-2 transition-all",
                        selectedTeam === team.name
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                      )}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{team.name}</div>
                      <div className="text-xs text-gray-600">{team.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTeam && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selected team: <strong>{selectedTeam}</strong></span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowForwardModal(false);
                    setSelectedSOS(null);
                    setSelectedTeam(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={forwardingTeam}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmForwardSOS}
                  disabled={!selectedTeam || forwardingTeam}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {forwardingTeam ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Forwarding...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Forward to Team
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS Alert Confirmation Modal */}
      {showSOSModal && selectedSOS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-xl">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Radio className="w-6 h-6 animate-pulse" />
                Alert All Volunteers
              </h3>
              <p className="text-orange-100 mt-1">Send SOS broadcast to available volunteers</p>
            </div>
            
            {!sosResponse ? (
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      This will send an <strong>emergency SOS alert</strong> to all verified and available volunteers. 
                      The alert will include disaster details, victim location, and required skills.
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Incident Details
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Disaster Type</div>
                      <div className="font-medium text-gray-900 flex items-center gap-1">
                        {getDisasterIcon(selectedSOS.disasterType)} {selectedSOS.disasterType}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Severity</div>
                      <div className={cn("font-medium inline-block px-2 py-1 rounded text-sm", getSeverityColor(selectedSOS.severity))}>
                        {selectedSOS.severity}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Incident</div>
                    <div className="font-medium text-gray-900">{selectedSOS.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{selectedSOS.description}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3 inline" /> Location
                    </div>
                    <div className="font-medium text-gray-900">{selectedSOS.address}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">
                        <User className="w-3 h-3 inline" /> Reporter
                      </div>
                      <div className="font-medium text-gray-900">{selectedSOS.reporter}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">
                        <Phone className="w-3 h-3 inline" /> Contact
                      </div>
                      <div className="font-medium text-gray-900">{selectedSOS.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">📋 Volunteers Will Receive:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Disaster type and severity level</li>
                    <li>✓ Exact location with GPS coordinates</li>
                    <li>✓ Reporter contact details</li>
                    <li>✓ Required skills (auto-matched based on disaster type)</li>
                    <li>✓ Immediate action instructions</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowSOSModal(false);
                      setSelectedSOS(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                    disabled={sendingSOSId !== null}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSendSOS}
                    disabled={sendingSOSId !== null}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingSOSId ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending SOS...
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4" />
                        Confirm & Send SOS
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">SOS Alert Sent Successfully!</h4>
                  <p className="text-gray-600">Volunteers have been notified and are en route.</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Alert Summary
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-green-600">Volunteers Notified</div>
                      <div className="text-2xl font-bold text-green-900">{sosResponse.totalVolunteersNotified}</div>
                    </div>
                    <div>
                      <div className="text-sm text-green-600">Required Skills</div>
                      <div className="text-sm font-medium text-green-900 mt-1">
                        {sosResponse.requiredSkills?.join(", ") || "General assistance"}
                      </div>
                    </div>
                  </div>
                </div>

                {sosResponse.notifications && sosResponse.notifications.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <h5 className="font-semibold text-gray-900 mb-3">Sample Notifications (First 5)</h5>
                    <div className="space-y-2">
                      {sosResponse.notifications.map((notif: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm">
                          <div className="font-medium text-gray-900">{notif.volunteerName}</div>
                          <div className="text-xs text-gray-500">{notif.volunteerPhone}</div>
                          <div className="text-xs text-blue-600 mt-1">
                            Skills: {notif.volunteerSkills?.join(", ") || "None listed"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowSOSModal(false);
                      setSelectedSOS(null);
                      setSOSResponse(null);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Success Modal */}
      {showAlertModal && alertResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={cn(
              "text-white p-6 rounded-t-xl",
              alertResponse.type === 'rescue' 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600" 
                : "bg-gradient-to-r from-indigo-600 to-blue-600"
            )}>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                {alertResponse.type === 'rescue' ? (
                  <>
                    <Radio className="w-6 h-6" />
                    Rescue Team Alert Sent
                  </>
                ) : (
                  <>
                    <Radio className="w-6 h-6" />
                    Citizen Alert Sent
                  </>
                )}
              </h3>
              <p className="text-white opacity-90 mt-1">
                {alertResponse.type === 'rescue' 
                  ? "Emergency alert broadcast to rescue teams" 
                  : "Mass notification sent to citizens in affected area"}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Alert Sent Successfully</p>
                    <p className="text-sm text-green-700 mt-1">{alertResponse.message}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Disaster Type</div>
                  <div className="font-medium text-gray-900 capitalize">{alertResponse.disaster_type}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">
                    {alertResponse.type === 'rescue' ? 'Teams Notified' : 'Citizens Notified'}
                  </div>
                  <div className="font-medium text-gray-900">
                    {alertResponse.type === 'rescue' 
                      ? alertResponse.teams_notified 
                      : alertResponse.citizens_notified?.toLocaleString()}
                  </div>
                </div>
              </div>

              {alertResponse.type === 'rescue' && alertResponse.rescue_teams && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Notified Rescue Teams
                  </h5>
                  <div className="space-y-2">
                    {alertResponse.rescue_teams.map((team: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded border border-gray-200 text-sm">
                        <div className="font-medium text-gray-900">{team.team_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {team.contact_number}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {team.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alertResponse.type === 'citizen' && alertResponse.sample_recipients && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Alert sent to <strong>{alertResponse.citizens_notified?.toLocaleString()}</strong> citizens 
                      in <strong>{alertResponse.location}</strong> via SMS, Email, and Push Notifications.
                    </span>
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Sent At</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(alertResponse.sent_at).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAlertModal(false);
                    setAlertResponse(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hospitals Tab Component
function HospitalsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const hospitals = [
    {
      id: "hosp-001",
      name: "AIIMS Bhubaneswar",
      address: "Sijua, Patrapada, Bhubaneswar, Odisha",
      phone: "0674-2476789",
      state: "Odisha",
      district: "Bhubaneswar",
      capacity: 500,
      available: 87,
      specialties: ["Trauma", "Burns", "Orthopedic", "Neurology"],
      type: "GOVERNMENT",
      distanceKm: 12,
    },
    {
      id: "hosp-002",
      name: "SCB Medical College",
      address: "Manglabag, Cuttack, Odisha",
      phone: "0671-2413406",
      state: "Odisha",
      district: "Cuttack",
      capacity: 700,
      available: 143,
      specialties: ["Trauma", "Burns", "Pediatric"],
      type: "GOVERNMENT",
      distanceKm: 28,
    },
    {
      id: "hosp-003",
      name: "Apollo Hospital Bhubaneswar",
      address: "Plot No. 251, Sainik School Road, Bhubaneswar",
      phone: "0674-6661066",
      state: "Odisha",
      district: "Bhubaneswar",
      capacity: 350,
      available: 52,
      specialties: ["Cardiac", "Trauma", "Neurology"],
      type: "PRIVATE",
      distanceKm: 8,
    },
  ];

  const filtered = hospitals.filter((h) => {
    const matchSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterType === "ALL" || h.type === filterType;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Nearest Hospitals</h2>
        <p className="text-gray-600 text-sm mt-1">
          Sorted by proximity to active disaster zones
        </p>
      </div>

      {/* Search & filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search hospitals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {["ALL", "GOVERNMENT", "PRIVATE", "NGO"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
              filterType === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Hospital list */}
      <div className="space-y-4">
        {filtered.map((h) => {
          const availabilityPct = (h.available / h.capacity) * 100;
          return (
            <div
              key={h.id}
              className="bg-gray-50 p-5 rounded-lg border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-900">{h.name}</h3>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded border",
                        h.type === "GOVERNMENT"
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-blue-700 bg-blue-50 border-blue-200"
                      )}
                    >
                      {h.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-sm">
                      <div className="text-xs text-gray-500">Distance</div>
                      <div className="font-semibold text-gray-900">
                        {h.distanceKm} km
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-gray-500">
                        <Bed className="w-3 h-3 inline" /> Available Beds
                      </div>
                      <div className="font-semibold text-green-600">
                        {h.available} / {h.capacity}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-gray-500">
                        <Phone className="w-3 h-3 inline" /> Phone
                      </div>
                      <div className="font-semibold text-gray-900">
                        {h.phone}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-xs text-gray-500">
                        <MapPin className="w-3 h-3 inline" /> Location
                      </div>
                      <div className="font-semibold text-gray-900">
                        {h.district}, {h.state}
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Capacity</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(availabilityPct)}% available
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          availabilityPct < 20
                            ? "bg-red-500"
                            : availabilityPct < 40
                              ? "bg-amber-500"
                              : "bg-green-500"
                        )}
                        style={{ width: `${availabilityPct}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {h.specialties.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-1 rounded border text-cyan-700 bg-cyan-50 border-cyan-200"
                      >
                        ⚕️ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Relief Camps Tab Component
function ReliefCampsTab() {
  const camps = [
    {
      id: "camp-001",
      name: "Bhubaneswar Relief Centre Alpha",
      address: "Exhibition Ground, Unit 4, Bhubaneswar",
      state: "Odisha",
      district: "Bhubaneswar",
      capacity: 2000,
      currentOccupancy: 847,
      status: "ACTIVE",
      food: "ADEQUATE",
      water: "ADEQUATE",
      medicine: "LOW",
      shelter: "ADEQUATE",
      adminContact: "District Collector",
      adminPhone: "0674-2392345",
    },
    {
      id: "camp-002",
      name: "Cuttack Flood Relief Camp",
      address: "Police Line Ground, Cuttack",
      state: "Odisha",
      district: "Cuttack",
      capacity: 1500,
      currentOccupancy: 1420,
      status: "FULL",
      food: "LOW",
      water: "ADEQUATE",
      medicine: "CRITICAL",
      shelter: "ADEQUATE",
      adminContact: "DM Cuttack",
      adminPhone: "0671-2305678",
    },
    {
      id: "camp-003",
      name: "Puri Cyclone Shelter",
      address: "Govt. High School Ground, Puri Town",
      state: "Odisha",
      district: "Puri",
      capacity: 3000,
      currentOccupancy: 312,
      status: "ACTIVE",
      food: "SURPLUS",
      water: "ADEQUATE",
      medicine: "ADEQUATE",
      shelter: "ADEQUATE",
      adminContact: "Block Development Officer",
      adminPhone: "06752-234567",
    },
  ];

  const supplyStatus = {
    SURPLUS: { color: "text-blue-700 bg-blue-50 border-blue-200", icon: "✅" },
    ADEQUATE: {
      color: "text-green-700 bg-green-50 border-green-200",
      icon: "🟢",
    },
    LOW: { color: "text-amber-700 bg-amber-50 border-amber-200", icon: "🟡" },
    CRITICAL: { color: "text-red-700 bg-red-50 border-red-200", icon: "🔴" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Relief Camp Coordination
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage camps, track capacity, monitor supplies, coordinate transfers
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Camp
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Camps", value: camps.length, color: "text-gray-900" },
          {
            label: "Active",
            value: camps.filter((c) => c.status === "ACTIVE").length,
            color: "text-green-600",
          },
          {
            label: "At Capacity",
            value: camps.filter((c) => c.status === "FULL").length,
            color: "text-red-600",
          },
          {
            label: "Total Capacity",
            value: camps.reduce((s, c) => s + c.capacity, 0).toLocaleString(),
            color: "text-blue-600",
          },
          {
            label: "Currently Housed",
            value: camps
              .reduce((s, c) => s + c.currentOccupancy, 0)
              .toLocaleString(),
            color: "text-amber-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white p-4 rounded-lg border border-gray-200 text-center"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Camps list */}
      <div className="space-y-4">
        {camps.map((camp) => {
          const pct = Math.round((camp.currentOccupancy / camp.capacity) * 100);
          const isFull = pct >= 100;
          const isLow = pct >= 80;
          return (
            <div
              key={camp.id}
              className="bg-gray-50 p-5 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{camp.name}</h3>
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {camp.district}, {camp.state}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded border",
                    camp.status === "ACTIVE"
                      ? "text-green-700 bg-green-50 border-green-200"
                      : "text-red-700 bg-red-50 border-red-200"
                  )}
                >
                  {camp.status}
                </span>
              </div>

              {/* Occupancy */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Occupancy
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      isFull
                        ? "text-red-600"
                        : isLow
                          ? "text-amber-600"
                          : "text-green-600"
                    )}
                  >
                    {camp.currentOccupancy}/{camp.capacity} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isFull
                        ? "bg-red-500"
                        : isLow
                          ? "bg-amber-500"
                          : "bg-green-500"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Supply status */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: "🍚 Food", key: camp.food },
                  { label: "💧 Water", key: camp.water },
                  { label: "💊 Meds", key: camp.medicine },
                  { label: "⛺ Shelter", key: camp.shelter },
                ].map((supply) => {
                  const status =
                    supplyStatus[supply.key as keyof typeof supplyStatus];
                  return (
                    <div
                      key={supply.label}
                      className={cn(
                        "rounded-lg p-2 text-center border text-xs",
                        status.color
                      )}
                    >
                      <div>{supply.label.split(" ")[0]}</div>
                      <div className="font-semibold">{status.icon}</div>
                    </div>
                  );
                })}
              </div>

              {/* Contact info */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{camp.adminContact}</span> •{" "}
                {camp.adminPhone}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          <BarChart3 className="w-6 h-6 inline mr-2 text-blue-600" />
          Analytics &amp; Insights
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          7-month historical data • Disaster trends, response times, SOS patterns
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total SOS (7m)",
            value: "316",
            change: "+12%",
            up: true,
            icon: AlertTriangle,
            color: "text-amber-600",
          },
          {
            label: "Resolution Rate",
            value: "90.2%",
            change: "+4.1%",
            up: true,
            icon: Activity,
            color: "text-green-600",
          },
          {
            label: "Avg Response",
            value: "42 min",
            change: "-30%",
            up: false,
            icon: Clock,
            color: "text-blue-600",
          },
          {
            label: "Teams Active",
            value: "12",
            change: "+3",
            up: true,
            icon: Users,
            color: "text-purple-600",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${kpi.color}`} />
                <span
                  className={cn(
                    "text-xs font-medium",
                    kpi.up ? "text-green-600" : "text-blue-600"
                  )}
                >
                  {kpi.up ? "↑" : "↓"} {kpi.change}
                </span>
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>
                {kpi.value}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            <Activity className="w-4 h-4 inline mr-2 text-amber-600" />
            Monthly SOS &amp; Resolution
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Chart visualization here</p>
              <p className="text-sm mt-1">
                Will integrate with Recharts library
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            <Clock className="w-4 h-4 inline mr-2 text-blue-600" />
            Response Time Trends
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Chart visualization here</p>
              <p className="text-sm mt-1">
                Will integrate with Recharts library
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <FileDown className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Export &amp; Reports
          </h3>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          Generate comprehensive reports for NDMA, state authorities and district administration.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition border border-blue-200">
            <FileDown className="w-4 h-4" />
            <span className="font-medium text-sm">Daily Situation Report</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition border border-blue-200">
            <FileDown className="w-4 h-4" />
            <span className="font-medium text-sm">Resource Utilization</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition border border-blue-200">
            <FileDown className="w-4 h-4" />
            <span className="font-medium text-sm">
              Response Time Analysis
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
