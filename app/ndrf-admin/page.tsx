"use client";

import Link from "next/link";
import { useState } from "react";
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

  const predictions = [
    {
      id: 1,
      type: "cyclone",
      state: "Odisha",
      district: "Puri",
      severity: "CRITICAL",
      confidence: 87.5,
      date: "2026-02-23",
      model: "cyclone_predictor_v3",
      affectedArea: "2,500 km²",
      affectedPeople: "1.5 Lakh",
      description:
        "Deep depression in Bay of Bengal likely to intensify into a severe cyclonic storm.",
    },
    {
      id: 2,
      type: "flood",
      state: "Assam",
      district: "Kaziranga",
      severity: "HIGH",
      confidence: 79.3,
      date: "2026-02-24",
      model: "flood_predictor_v2",
      affectedArea: "1,800 km²",
      affectedPeople: "85,000",
      description: "Brahmaputra river levels rising due to heavy rainfall.",
    },
    {
      id: 3,
      type: "earthquake",
      state: "Gujarat",
      district: "Kutch",
      severity: "HIGH",
      confidence: 65.2,
      date: "2026-02-25",
      model: "seismic_predictor_v1",
      affectedArea: "3,200 km²",
      affectedPeople: "2.1 Lakh",
      description:
        "Seismic activity detected near Kutch fault line. Moderate earthquake possible.",
    },
  ];

  const models = [
    { id: "all", label: "All Models" },
    { id: "cyclone", label: "🌀 Cyclone" },
    { id: "flood", label: "🌊 Flood" },
    { id: "earthquake", label: "🌍 Earthquake" },
    { id: "landslide", label: "⛰️ Landslide" },
    { id: "heatwave", label: "🌡️ Heatwave" },
  ];

  const filtered =
    activeModel === "all"
      ? predictions
      : predictions.filter((p) => p.type === activeModel);

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
        {models.map((m) => (
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
          </button>
        ))}
      </div>

      {/* Predictions list */}
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
                  {p.district}, {p.state}
                </div>
                <p className="text-sm text-gray-700 mb-3">{p.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="text-sm font-bold text-green-600">
                      {p.confidence}%
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Date</div>
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
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                    ✅ Verify
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    🚁 Dispatch Team
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
