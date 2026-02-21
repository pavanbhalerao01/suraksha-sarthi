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
  Droplets,
  HeartPulse,
  ArrowUpDown,
  CircleDot,
  ClipboardCheck,
  Megaphone,
  Home,
  Baby,
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
  | "relief-camps"
  | "analytics";

export default function NDRFAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchedTeams, setDispatchedTeams] = useState<number>(0);
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predictions');
        const data = await response.json();
        
        if (data.predictions && Array.isArray(data.predictions)) {
          setPredictions(data.predictions);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
    // Refresh predictions every 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic stats from ML predictions
  const stats = {
    // Count high and critical severity predictions as active incidents
    activeIncidents: predictions.filter(p => 
      p.severity === 'HIGH' || p.severity === 'CRITICAL'
    ).length,
    
    // Teams deployed = estimated from predictions + manually dispatched from Task Allocation
    teamsDeployed: Math.ceil(predictions.filter(p => 
      p.severity === 'HIGH' || p.severity === 'CRITICAL'
    ).length / 2) + dispatchedTeams,
    
    // Estimate volunteers (5 volunteers per medium+ severity incident)
    volunteersActive: predictions.filter(p => 
      p.severity === 'MEDIUM' || p.severity === 'HIGH' || p.severity === 'CRITICAL'
    ).length * 5,
    
    avgResponseTime: "18 min", // This could be calculated from actual response data
  };

  const ndrfData = {
    name: "NDRF Command Center",
    region: "National Operations",
    ...stats
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
      badge: loading ? "..." : predictions.length > 0 ? predictions.length.toString() : undefined,
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
      badge: loading ? "..." : stats.activeIncidents > 0 ? stats.activeIncidents.toString() : undefined,
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
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-16 rounded"></div>
              ) : (
                ndrfData.activeIncidents
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {loading ? "Loading..." : "From ML predictions"}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Teams Deployed</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-16 rounded"></div>
              ) : (
                ndrfData.teamsDeployed
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">{loading ? "Loading..." : "NDRF + SDRF"}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Volunteers Active</span>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-16 rounded"></div>
              ) : (
                ndrfData.volunteersActive
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">{loading ? "Loading..." : "Estimated"}</div>
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
          {activeTab === "tasks" && <TasksTab predictions={predictions} loading={loading} onDispatch={() => setDispatchedTeams((n: number) => n + 1)} />}
          {activeTab === "sos" && <SOSTab onDispatch={() => setDispatchedTeams((n: number) => n + 1)} />}
          {activeTab === "relief-camps" && <ReliefCampsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [source, setSource] = useState<'live' | 'cached' | 'none'>('none');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard-predictions');
        const data = await res.json();
        setPredictions(data.predictions || []);
        setBackendOnline(data.backendOnline || false);
        setSource(data.source || 'none');
      } catch {
        setPredictions([]);
        setBackendOnline(false);
        setSource('none');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats from live predictions only
  const criticalCount = predictions.filter(p => p.severity === 'CRITICAL').length;
  const highCount = predictions.filter(p => p.severity === 'HIGH').length;
  const totalAffected = predictions.reduce((sum, p) => {
    const n = parseFloat((p.affectedPeople || '0').replace(/[^0-9.]/g, ''));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const statCards = [
    {
      label: "Active Disasters",
      value: loading ? "—" : predictions.length,
      sub: loading ? "Loading..." : backendOnline ? "From ML models" : source === 'cached' ? "Cached" : "Backend offline",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Critical Alerts",
      value: loading ? "—" : criticalCount,
      sub: loading ? "Loading..." : `${highCount} HIGH severity`,
      icon: Zap,
      color: "text-orange-600",
    },
    {
      label: "Cyclones",
      value: loading ? "—" : predictions.filter(p => p.type === 'cyclone').length,
      sub: "ML predicted",
      icon: Radio,
      color: "text-blue-600",
    },
    {
      label: "Floods",
      value: loading ? "—" : predictions.filter(p => p.type === 'flood').length,
      sub: "ML predicted",
      icon: Truck,
      color: "text-cyan-600",
    },
    {
      label: "Heatwaves",
      value: loading ? "—" : predictions.filter(p => p.type === 'heatwave').length,
      sub: "ML predicted",
      icon: Activity,
      color: "text-amber-600",
    },
    {
      label: "People at Risk",
      value: loading ? "—" : totalAffected > 0 ? `${(totalAffected / 1000).toFixed(0)}K` : "0",
      sub: "Estimated",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Command Dashboard</h2>
          <p className="text-gray-600 text-sm mt-1">
            Real-time ML prediction overview • Cyclones, Floods &amp; Heatwaves
          </p>
        </div>
        {/* Backend status indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
          backendOnline
            ? "bg-green-50 border-green-200 text-green-700"
            : source === 'cached'
            ? "bg-yellow-50 border-yellow-200 text-yellow-700"
            : "bg-red-50 border-red-200 text-red-700"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            backendOnline ? "bg-green-500 animate-pulse" : source === 'cached' ? "bg-yellow-500" : "bg-red-500"
          )} />
          {backendOnline ? "ML Backend Online" : source === 'cached' ? "Showing Cached Data" : "ML Backend Offline"}
        </div>
      </div>

      {/* Stat cards — computed from ML predictions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <TrendingUp className="w-3 h-3 text-gray-400" />
              </div>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mb-1" />
              ) : (
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              )}
              <div className="text-xs text-gray-600 mt-0.5 leading-tight">{s.label}</div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Active & Predicted Disasters — only from ML */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active &amp; Predicted Disasters
          <span className="ml-2 text-sm font-normal text-gray-500">(Cyclone · Flood · Heatwave)</span>
        </h3>

        {/* Backend offline notice */}
        {!backendOnline && !loading && source !== 'cached' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">ML Backend is Offline</p>
              <p className="text-xs text-red-700 mt-0.5">
                No predictions available. Start the Python backend to see ML-predicted disasters.
              </p>
              <code className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded mt-1 inline-block">
                cd backend &amp;&amp; python main.py
              </code>
            </div>
          </div>
        )}

        {source === 'cached' && !backendOnline && (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <p className="text-xs text-yellow-800">Showing last known predictions (backend offline). Data may be outdated.</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg border border-gray-200" />
            ))}
          </div>
        )}

        {/* No predictions at all */}
        {!loading && predictions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <Shield className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No disasters predicted</p>
            <p className="text-gray-400 text-sm mt-1">
              {backendOnline
                ? "ML models are running — no current threats detected."
                : "Start the backend to get live ML predictions."}
            </p>
          </div>
        )}

        {/* Prediction cards */}
        {!loading && predictions.length > 0 && (
          <div className="space-y-3">
            {predictions.map((d, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getDisasterIcon(d.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 capitalize">{d.type}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded border", getSeverityColor(d.severity))}>
                        {d.severity}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded border",
                        source === 'live'
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-yellow-700 bg-yellow-50 border-yellow-200"
                      )}>
                        {source === 'live' ? '🟢 LIVE' : '🟡 CACHED'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {d.district}, {d.state}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      <span>Date: {d.date}</span>
                      {d.model && <span className="text-purple-600">Model: {d.model}</span>}
                    </div>
                    {d.description && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{d.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
// Standalone teams pool (realistic NDRF/SDRF teams — not from ML)
const AVAILABLE_TEAMS = [
  {
    id: "team-alpha",
    name: "Alpha Force — Odisha NDRF",
    state: "Odisha",
    district: "Cuttack",
    memberCount: 25,
    expertise: ["flood", "cyclone", "landslide"],
    distanceKm: 85,
    unit: "NDRF",
  },
  {
    id: "team-bravo",
    name: "Bravo Squad — Maharashtra SDRF",
    state: "Maharashtra",
    district: "Nagpur",
    memberCount: 20,
    expertise: ["earthquake", "landslide", "fire"],
    distanceKm: 320,
    unit: "SDRF",
  },
  {
    id: "team-charlie",
    name: "Charlie Unit — Bihar NDRF",
    state: "Bihar",
    district: "Patna",
    memberCount: 30,
    expertise: ["flood", "heatwave"],
    distanceKm: 210,
    unit: "NDRF",
  },
  {
    id: "team-delta",
    name: "Delta Squad — Gujarat SDRF",
    state: "Gujarat",
    district: "Ahmedabad",
    memberCount: 18,
    expertise: ["cyclone", "flood", "earthquake"],
    distanceKm: 450,
    unit: "SDRF",
  },
];

// Demo disaster shown when ML backend is offline — for demonstration only
const DEMO_DISASTER = {
  id: "demo-001",
  type: "flood",
  severity: "CRITICAL",
  state: "Maharashtra",
  district: "Pune",
  date: "2026-02-23",
  description: "Heavy rainfall over Western Ghats causing rapid water level rise in Mutha river basin.",
  model: "FloodNet-v2 (DEMO)",
  isDemo: true,
};

function TasksTab({ predictions, loading, onDispatch }: {
  predictions: any[];
  loading: boolean;
  onDispatch: () => void;
}) {
  // Only show HIGH and CRITICAL severity disasters from ML
  const highSeverityDisasters = predictions.filter(
    (p) => p.severity === "CRITICAL" || p.severity === "HIGH" || p.severity === "VERY HIGH"
  );

  // Use demo task when backend is offline and no real predictions available
  const isDemo = !loading && highSeverityDisasters.length === 0;
  const displayDisasters = isDemo ? [DEMO_DISASTER] : highSeverityDisasters;

  const [selectedDisaster, setSelectedDisaster] = useState<any>(null);
  // key: `${teamId}-${disasterId}`, value: true when dispatched
  const [dispatchedKeys, setDispatchedKeys] = useState<Set<string>>(new Set());

  // Keep selected disaster in sync when predictions load
  useEffect(() => {
    if (displayDisasters.length > 0 && !selectedDisaster) {
      setSelectedDisaster(displayDisasters[0]);
    }
  }, [displayDisasters.length]);

  const handleDispatch = (teamId: string, disasterId: string) => {
    const key = `${teamId}-${disasterId}`;
    if (dispatchedKeys.has(key)) return;
    setDispatchedKeys((prev) => new Set(prev).add(key));
    onDispatch();
  };

  const currentDisaster = selectedDisaster || displayDisasters[0];

  // Sort teams: exact expertise match first
  const sortedTeams = currentDisaster
    ? [...AVAILABLE_TEAMS].sort((a, b) => {
        const aMatch = a.expertise.includes((currentDisaster.type || "").toLowerCase());
        const bMatch = b.expertise.includes((currentDisaster.type || "").toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return a.distanceKm - b.distanceKm;
      })
    : AVAILABLE_TEAMS;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          <Brain className="w-6 h-6 inline mr-2 text-blue-600" />
          Intelligent Task Allocation
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Showing only HIGH &amp; CRITICAL severity disasters from ML predictions
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>NDRF Control:</strong> Only high-risk disasters are listed here. Select a disaster to see matching teams ranked by expertise and proximity. Dispatching a team updates the Teams Deployed counter.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {isDemo && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
              <span className="text-amber-600 text-lg">🔶</span>
              <div className="text-sm text-amber-800">
                <strong>Demo Mode</strong> — Python backend is offline. Showing a sample disaster task to demonstrate the dispatch workflow. Start the backend to load live ML predictions.
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disaster selector — live from ML */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Select Disaster
              <span className={`ml-2 text-xs border rounded-full px-2 py-0.5 ${
                isDemo ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-red-100 text-red-700 border-red-200"
              }`}>
                {isDemo ? "DEMO" : `${highSeverityDisasters.length} active`}
              </span>
            </h3>
            <div className="space-y-3">
              {displayDisasters.map((d, idx) => {
                const disId = d.id || `${d.type}-${d.state}-${idx}`;
                return (
                  <button
                    key={disId}
                    onClick={() => setSelectedDisaster(d)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all",
                      currentDisaster === d || currentDisaster?.type === d.type && currentDisaster?.state === d.state
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
                          <span className={cn("text-xs px-2 py-0.5 rounded border", getSeverityColor(d.severity))}>
                            {d.severity}
                          </span>
                          {d.isDemo && (
                            <span className="text-xs px-2 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-300 font-semibold">
                              DEMO
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {d.district}, {d.state}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {d.date}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team recommendations */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">
              Available Teams
              {currentDisaster && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  — matched for {currentDisaster.type} response
                </span>
              )}
            </h3>
            <div className="space-y-4">
              {sortedTeams.map((team, idx) => {
                const disId = currentDisaster
                  ? currentDisaster.id || `${currentDisaster.type}-${currentDisaster.state}-0`
                  : "none";
                const key = `${team.id}-${disId}`;
                const isDispatched = dispatchedKeys.has(key);
                const isMatch = currentDisaster
                  ? team.expertise.includes((currentDisaster.type || "").toLowerCase())
                  : false;

                return (
                  <div
                    key={team.id}
                    className={cn(
                      "border rounded-lg p-5 transition-all",
                      isDispatched
                        ? "bg-green-50 border-green-300"
                        : "bg-gradient-to-r from-blue-50 to-white border-blue-200"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{team.name}</h4>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {team.district}, {team.state}
                        </div>
                      </div>
                      {idx === 0 && !isDispatched && (
                        <div className="flex items-center gap-1 bg-blue-100 border border-blue-300 rounded-full px-3 py-1">
                          <Star className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-700 font-bold">Best Match</span>
                        </div>
                      )}
                      {isDispatched && (
                        <div className="flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-3 py-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700 font-bold">Dispatched</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className={cn(
                        "text-xs rounded px-2 py-1 border",
                        isDispatched
                          ? "bg-green-100 border-green-200 text-green-700"
                          : "bg-green-50 border-green-200 text-green-700"
                      )}>
                        {isDispatched ? "✓ DEPLOYED" : "✓ AVAILABLE"}
                      </div>
                      <div className="text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-1">
                        👥 {team.memberCount} members
                      </div>
                      <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded px-2 py-1">
                        📍 ~{team.distanceKm} km away
                      </div>
                      <div className="text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded px-2 py-1">
                        {team.unit}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {team.expertise.map((e) => (
                        <span
                          key={e}
                          className={cn(
                            "text-xs px-2 py-1 rounded border capitalize",
                            isMatch && e === (currentDisaster?.type || "").toLowerCase()
                              ? "text-green-700 bg-green-50 border-green-200 font-semibold"
                              : "text-gray-600 bg-gray-50 border-gray-200"
                          )}
                        >
                          {getDisasterIcon(e)} {e}
                        </span>
                      ))}
                    </div>

                    <button
                      disabled={isDispatched}
                      onClick={() => handleDispatch(team.id, disId)}
                      className={cn(
                        "w-full py-2 rounded-lg transition font-medium text-sm",
                        isDispatched
                          ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                    >
                      {isDispatched ? "✓ Team Dispatched" : "Dispatch Team"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

// SOS Tab Component
function SOSTab({ onDispatch }: { onDispatch: () => void }) {
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
  const [dismissedSOSIds, setDismissedSOSIds] = useState<Set<string>>(new Set());
  const [dispatchedSOSIds, setDispatchedSOSIds] = useState<Set<string>>(new Set());

  const handleDispatchTeam = (sosId: string) => {
    if (dispatchedSOSIds.has(sosId)) return;
    setDispatchedSOSIds(prev => new Set(prev).add(sosId));
    onDispatch();
  };

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

  // Function to mark SOS as false alert
  const handleMarkAsFalse = (sosId: string) => {
    if (confirm("Are you sure you want to mark this SOS as a false alert? This action will remove it from the list.")) {
      setDismissedSOSIds(prev => new Set(prev).add(sosId));
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
  
  // Filter by status and remove dismissed SOSs
  const filtered = (filter === "ALL" ? sosList : sosList.filter((s) => s.status === filter))
    .filter((s) => !dismissedSOSIds.has(s.id));

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
                  <button 
                    onClick={() => handleDispatchTeam(sos.id)}
                    disabled={dispatchedSOSIds.has(sos.id)}
                    className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                      dispatchedSOSIds.has(sos.id)
                        ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {dispatchedSOSIds.has(sos.id) ? "✓ Team Dispatched" : "🚁 Dispatch Team"}
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
                  <button 
                    onClick={() => handleMarkAsFalse(sos.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  Forward SOS to Response Team
                </h3>
                <p className="text-green-100 mt-1">Select the appropriate team to handle this emergency</p>
              </div>
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setSelectedSOS(null);
                  setSelectedTeam(null);
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
            </div>

            {/* Sticky Footer with Buttons */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setSelectedSOS(null);
                  setSelectedTeam(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white transition font-medium"
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

// Relief Camps Tab Component
function ReliefCampsTab() {
  // ── Sub-tab state ──
  type CampSubTab = "overview" | "transfers" | "alerts";
  const [subTab, setSubTab] = useState<CampSubTab>("overview");
  const [expandedCamp, setExpandedCamp] = useState<string | null>(null);
  const [showAddCamp, setShowAddCamp] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestCampId, setRequestCampId] = useState<string>("");

  // ── Resource request state ──
  interface ResourceRequest {
    id: string;
    campId: string;
    campName: string;
    resource: string;
    quantity: string;
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    status: "PENDING" | "APPROVED" | "IN_TRANSIT" | "DELIVERED" | "REJECTED";
    requestedAt: string;
    eta?: string;
    notes?: string;
  }

  const [requests, setRequests] = useState<ResourceRequest[]>([
    {
      id: "REQ-001",
      campId: "camp-001",
      campName: "Pune Flood Relief Camp",
      resource: "Medical Kits",
      quantity: "200 units",
      priority: "CRITICAL",
      status: "IN_TRANSIT",
      requestedAt: "2026-02-22 08:30",
      eta: "2 hrs",
      notes: "Urgent - 45 injured civilians",
    },
    {
      id: "REQ-002",
      campId: "camp-002",
      campName: "Satara Emergency Shelter",
      resource: "Drinking Water",
      quantity: "5000 liters",
      priority: "HIGH",
      status: "APPROVED",
      requestedAt: "2026-02-22 06:15",
      eta: "4 hrs",
    },
    {
      id: "REQ-003",
      campId: "camp-003",
      campName: "Sangli Cyclone Camp",
      resource: "Blankets & Tarpaulins",
      quantity: "500 pieces",
      priority: "MEDIUM",
      status: "PENDING",
      requestedAt: "2026-02-21 22:00",
    },
    {
      id: "REQ-004",
      campId: "camp-001",
      campName: "Pune Flood Relief Camp",
      resource: "Rice & Dal",
      quantity: "2 tonnes",
      priority: "HIGH",
      status: "DELIVERED",
      requestedAt: "2026-02-21 14:00",
      notes: "Delivered via SDRF truck convoy",
    },
    {
      id: "REQ-005",
      campId: "camp-004",
      campName: "Kolhapur Relief Centre",
      resource: "Portable Generators",
      quantity: "10 units",
      priority: "MEDIUM",
      status: "PENDING",
      requestedAt: "2026-02-22 09:00",
    },
  ]);

  // ── New request form state ──
  const [newReq, setNewReq] = useState({
    resource: "",
    quantity: "",
    priority: "HIGH" as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    notes: "",
  });

  // ── Camp data (Maharashtra-focused) ──
  const camps = [
    {
      id: "camp-001",
      name: "Pune Flood Relief Camp",
      address: "Sinhagad Road Community Hall, Pune",
      district: "Pune",
      state: "Maharashtra",
      capacity: 2500,
      currentOccupancy: 1847,
      status: "ACTIVE" as const,
      food: "LOW" as const,
      water: "ADEQUATE" as const,
      medicine: "CRITICAL" as const,
      shelter: "ADEQUATE" as const,
      power: "GENERATOR" as const,
      sanitation: "ADEQUATE" as const,
      adminContact: "DM Pune – IAS S. Kulkarni",
      adminPhone: "020-2612-3456",
      lat: 18.4927,
      lng: 73.8267,
      activeDisaster: "Monsoon Flood",
      teams: 4,
      doctors: 6,
      volunteers: 28,
      children: 312,
      elderly: 189,
      injured: 45,
      lastUpdated: "10 min ago",
    },
    {
      id: "camp-002",
      name: "Satara Emergency Shelter",
      address: "Govt. Polytechnic Ground, Satara",
      district: "Satara",
      state: "Maharashtra",
      capacity: 1800,
      currentOccupancy: 1690,
      status: "FULL" as const,
      food: "ADEQUATE" as const,
      water: "LOW" as const,
      medicine: "ADEQUATE" as const,
      shelter: "ADEQUATE" as const,
      power: "GRID" as const,
      sanitation: "LOW" as const,
      adminContact: "ADM Satara – R. Patil",
      adminPhone: "02162-234567",
      lat: 17.6805,
      lng: 74.0183,
      activeDisaster: "Landslide",
      teams: 3,
      doctors: 4,
      volunteers: 18,
      children: 245,
      elderly: 156,
      injured: 22,
      lastUpdated: "25 min ago",
    },
    {
      id: "camp-003",
      name: "Sangli Cyclone Camp",
      address: "Vishrambag Sports Complex, Sangli",
      district: "Sangli",
      state: "Maharashtra",
      capacity: 3000,
      currentOccupancy: 512,
      status: "ACTIVE" as const,
      food: "SURPLUS" as const,
      water: "ADEQUATE" as const,
      medicine: "ADEQUATE" as const,
      shelter: "ADEQUATE" as const,
      power: "GRID" as const,
      sanitation: "ADEQUATE" as const,
      adminContact: "BDO – V. Jadhav",
      adminPhone: "0233-2623456",
      lat: 16.8524,
      lng: 74.5815,
      activeDisaster: "Cyclone Warning",
      teams: 2,
      doctors: 3,
      volunteers: 12,
      children: 78,
      elderly: 94,
      injured: 5,
      lastUpdated: "5 min ago",
    },
    {
      id: "camp-004",
      name: "Kolhapur Relief Centre",
      address: "Shivaji Stadium, Kolhapur",
      district: "Kolhapur",
      state: "Maharashtra",
      capacity: 2200,
      currentOccupancy: 1100,
      status: "ACTIVE" as const,
      food: "ADEQUATE" as const,
      water: "ADEQUATE" as const,
      medicine: "LOW" as const,
      shelter: "ADEQUATE" as const,
      power: "GENERATOR" as const,
      sanitation: "ADEQUATE" as const,
      adminContact: "DC Kolhapur – A. More",
      adminPhone: "0231-2654321",
      lat: 16.7050,
      lng: 74.2433,
      activeDisaster: "Flood Aftermath",
      teams: 3,
      doctors: 5,
      volunteers: 22,
      children: 134,
      elderly: 112,
      injured: 18,
      lastUpdated: "15 min ago",
    },
    {
      id: "camp-005",
      name: "Ratnagiri Coast Shelter",
      address: "Fisheries College Campus, Ratnagiri",
      district: "Ratnagiri",
      state: "Maharashtra",
      capacity: 1200,
      currentOccupancy: 340,
      status: "ACTIVE" as const,
      food: "ADEQUATE" as const,
      water: "ADEQUATE" as const,
      medicine: "ADEQUATE" as const,
      shelter: "LOW" as const,
      power: "SOLAR" as const,
      sanitation: "ADEQUATE" as const,
      adminContact: "Tehsildar – P. Sawant",
      adminPhone: "02352-223456",
      lat: 16.9902,
      lng: 73.3120,
      activeDisaster: "Cyclone Preparedness",
      teams: 2,
      doctors: 2,
      volunteers: 8,
      children: 56,
      elderly: 67,
      injured: 3,
      lastUpdated: "1 hr ago",
    },
  ];

  const supplyLevel = {
    SURPLUS:  { label: "Surplus",   bg: "bg-blue-500",   text: "text-blue-700",  pill: "bg-blue-50 border-blue-200 text-blue-700",   dot: "bg-blue-500" },
    ADEQUATE: { label: "OK",        bg: "bg-emerald-500", text: "text-emerald-700", pill: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
    LOW:      { label: "Low",       bg: "bg-amber-500",  text: "text-amber-700", pill: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
    CRITICAL: { label: "Critical",  bg: "bg-red-500",    text: "text-red-700",   pill: "bg-red-50 border-red-200 text-red-700",    dot: "bg-red-500" },
    GENERATOR: { label: "Generator", bg: "bg-amber-500", text: "text-amber-700", pill: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
    GRID:     { label: "Grid",      bg: "bg-emerald-500", text: "text-emerald-700", pill: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
    SOLAR:    { label: "Solar",     bg: "bg-blue-500",   text: "text-blue-700",  pill: "bg-blue-50 border-blue-200 text-blue-700",   dot: "bg-blue-500" },
  };

  const priorityStyle = {
    CRITICAL: { bg: "bg-red-100 border-red-300 text-red-800", dot: "bg-red-500 animate-pulse" },
    HIGH:     { bg: "bg-orange-100 border-orange-300 text-orange-800", dot: "bg-orange-500" },
    MEDIUM:   { bg: "bg-yellow-100 border-yellow-300 text-yellow-800", dot: "bg-yellow-500" },
    LOW:      { bg: "bg-gray-100 border-gray-300 text-gray-700", dot: "bg-gray-400" },
  };

  const statusFlow = {
    PENDING:    { label: "Pending",     icon: Clock,         color: "text-amber-600 bg-amber-50", step: 1 },
    APPROVED:   { label: "Approved",    icon: CheckCircle2,  color: "text-blue-600 bg-blue-50", step: 2 },
    IN_TRANSIT: { label: "In Transit",  icon: Truck,         color: "text-purple-600 bg-purple-50", step: 3 },
    DELIVERED:  { label: "Delivered",   icon: Package,       color: "text-emerald-600 bg-emerald-50", step: 4 },
    REJECTED:   { label: "Rejected",    icon: XCircle,       color: "text-red-600 bg-red-50", step: 0 },
  };

  // ── Computed values ──
  const totalCapacity = camps.reduce((s, c) => s + c.capacity, 0);
  const totalOccupancy = camps.reduce((s, c) => s + c.currentOccupancy, 0);
  const totalChildren = camps.reduce((s, c) => s + c.children, 0);
  const totalElderly = camps.reduce((s, c) => s + c.elderly, 0);
  const totalInjured = camps.reduce((s, c) => s + c.injured, 0);
  const criticalAlerts = camps.filter(c =>
    c.food === "CRITICAL" || c.water === "CRITICAL" || c.medicine === "CRITICAL" || c.shelter === "CRITICAL"
  );
  const lowAlerts = camps.filter(c =>
    c.food === "LOW" || c.water === "LOW" || c.medicine === "LOW" || c.shelter === "LOW" || c.sanitation === "LOW"
  );

  // ── Request handlers ──
  const handleSubmitRequest = () => {
    if (!newReq.resource || !newReq.quantity || !requestCampId) return;
    const camp = camps.find(c => c.id === requestCampId);
    const req: ResourceRequest = {
      id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
      campId: requestCampId,
      campName: camp?.name || "",
      resource: newReq.resource,
      quantity: newReq.quantity,
      priority: newReq.priority,
      status: "PENDING",
      requestedAt: new Date().toLocaleString("en-IN"),
      notes: newReq.notes || undefined,
    };
    setRequests(prev => [req, ...prev]);
    setNewReq({ resource: "", quantity: "", priority: "HIGH", notes: "" });
    setShowRequestForm(false);
    setRequestCampId("");
  };

  const advanceRequest = (id: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const flow: ResourceRequest["status"][] = ["PENDING", "APPROVED", "IN_TRANSIT", "DELIVERED"];
      const idx = flow.indexOf(r.status);
      if (idx < flow.length - 1) return { ...r, status: flow[idx + 1] };
      return r;
    }));
  };

  // ── Supply indicator micro-component ──
  const SupplyDot = ({ level }: { level: string }) => {
    const s = supplyLevel[level as keyof typeof supplyLevel] || supplyLevel.ADEQUATE;
    return (
      <div className="flex items-center gap-1.5" title={s.label}>
        <span className={cn("w-2 h-2 rounded-full", s.dot)} />
        <span className={cn("text-[11px] font-medium", s.text)}>{s.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-5">

      {/* ══════ HEADER ══════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tent className="w-6 h-6 text-orange-600" />
            Relief Camp Command
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {camps.length} camps &bull; {totalOccupancy.toLocaleString()} evacuees &bull; {criticalAlerts.length + lowAlerts.length} supply alerts
          </p>
        </div>
        <button
          onClick={() => setShowAddCamp(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Register New Camp
        </button>
      </div>

      {/* ══════ TOP KPI STRIP ══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Camps",    value: camps.length,                      icon: Tent,       gradient: "from-orange-500 to-amber-500" },
          { label: "Evacuees",       value: totalOccupancy.toLocaleString(),   icon: Users,      gradient: "from-blue-500 to-cyan-500" },
          { label: "Available Beds", value: (totalCapacity - totalOccupancy).toLocaleString(), icon: Bed, gradient: "from-emerald-500 to-green-500" },
          { label: "Children",       value: totalChildren,                     icon: Baby,       gradient: "from-pink-500 to-rose-500" },
          { label: "Elderly",        value: totalElderly,                      icon: HeartPulse, gradient: "from-purple-500 to-violet-500" },
          { label: "Injured",        value: totalInjured,                      icon: AlertTriangle, gradient: "from-red-500 to-rose-600" },
        ].map((kpi) => {
          const K = kpi.icon;
          return (
            <div key={kpi.label} className="relative overflow-hidden rounded-xl border bg-white shadow-sm group hover:shadow-md transition-shadow">
              <div className={cn("absolute inset-0 opacity-[0.07] bg-gradient-to-br", kpi.gradient)} />
              <div className="relative p-3.5">
                <K className="w-4 h-4 text-gray-400 mb-1.5" />
                <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════ SUB-TAB NAVIGATION ══════ */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {([
          { key: "overview" as CampSubTab, label: "Camp Overview", icon: Home, count: camps.length },
          { key: "transfers" as CampSubTab, label: "Transfers", icon: ArrowUpDown },
          { key: "alerts" as CampSubTab, label: "Supply Alerts", icon: Megaphone, count: criticalAlerts.length + lowAlerts.length },
        ]).map((tab) => {
          const T = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
                subTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <T className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                  subTab === tab.key ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-600"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══════ SUB-TAB: CAMP OVERVIEW ══════ */}
      {subTab === "overview" && (
        <div className="space-y-4">
          {camps.map((camp) => {
            const pct = Math.round((camp.currentOccupancy / camp.capacity) * 100);
            const isExpanded = expandedCamp === camp.id;
            const capacityColor = pct >= 95 ? "from-red-500 to-rose-500" : pct >= 75 ? "from-amber-500 to-orange-500" : "from-emerald-500 to-green-500";
            const capacityText = pct >= 95 ? "text-red-700" : pct >= 75 ? "text-amber-700" : "text-emerald-700";

            return (
              <div key={camp.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* ── Top bar gradient ── */}
                <div className={cn("h-1.5 bg-gradient-to-r", capacityColor)} />

                {/* ── Main row ── */}
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                    {/* Left: camp info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{camp.name}</h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap",
                          camp.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {camp.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{camp.district}, {camp.state}</span>
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-orange-500" />{camp.activeDisaster}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {camp.lastUpdated}</span>
                      </div>
                    </div>

                    {/* Center: capacity ring */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke={pct >= 95 ? "#ef4444" : pct >= 75 ? "#f59e0b" : "#10b981"} strokeWidth="3"
                            strokeDasharray={`${pct * 0.975} 100`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={cn("text-sm font-bold", capacityText)}>{pct}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div className="font-bold text-gray-900 text-base">{camp.currentOccupancy.toLocaleString()}</div>
                        <div>of {camp.capacity.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Right: supply dots */}
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 min-w-[200px]">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">🍚 <SupplyDot level={camp.food} /></div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">💧 <SupplyDot level={camp.water} /></div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">💊 <SupplyDot level={camp.medicine} /></div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">⛺ <SupplyDot level={camp.shelter} /></div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">⚡ <SupplyDot level={camp.power} /></div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">🚿 <SupplyDot level={camp.sanitation} /></div>
                    </div>

                    {/* Expand toggle + Quick actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRequestCampId(camp.id);
                          setShowRequestForm(true);
                        }}
                        className="px-3 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-xs font-medium"
                        title="Raise Resource Request"
                      >
                        <Package className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setExpandedCamp(isExpanded ? null : camp.id)}
                        className="px-3 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-xs"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded details ── */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <div className="text-xs text-blue-600 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Teams</div>
                          <div className="text-xl font-bold text-blue-800">{camp.teams}</div>
                          <div className="text-[10px] text-blue-500">NDRF/SDRF deployed</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                          <div className="text-xs text-green-600 mb-1 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Doctors</div>
                          <div className="text-xl font-bold text-green-800">{camp.doctors}</div>
                          <div className="text-[10px] text-green-500">Medical staff on-site</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                          <div className="text-xs text-purple-600 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Volunteers</div>
                          <div className="text-xl font-bold text-purple-800">{camp.volunteers}</div>
                          <div className="text-[10px] text-purple-500">Active volunteers</div>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                          <div className="text-xs text-rose-600 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Injured</div>
                          <div className="text-xl font-bold text-rose-800">{camp.injured}</div>
                          <div className="text-[10px] text-rose-500">Need medical attention</div>
                        </div>
                      </div>

                      {/* Demographics bar */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="text-xs font-medium text-gray-600 mb-3">Evacuee Demographics</div>
                        <div className="flex h-5 rounded-full overflow-hidden">
                          <div className="bg-blue-400" style={{ width: `${((camp.currentOccupancy - camp.children - camp.elderly) / camp.currentOccupancy * 100)}%` }} title="Adults" />
                          <div className="bg-pink-400" style={{ width: `${(camp.children / camp.currentOccupancy * 100)}%` }} title="Children" />
                          <div className="bg-purple-400" style={{ width: `${(camp.elderly / camp.currentOccupancy * 100)}%` }} title="Elderly" />
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full" /> Adults ({camp.currentOccupancy - camp.children - camp.elderly})</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-pink-400 rounded-full" /> Children ({camp.children})</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-400 rounded-full" /> Elderly ({camp.elderly})</span>
                        </div>
                      </div>

                      {/* Contact & quick actions */}
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{camp.adminContact}</span>
                          <span className="font-mono text-gray-800">{camp.adminPhone}</span>
                        </div>
                        <button
                          onClick={() => {
                            setRequestCampId(camp.id);
                            setShowRequestForm(true);
                          }}
                          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-xs font-medium flex items-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Raise Resource Request
                        </button>
                        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium flex items-center gap-1.5">
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          Transfer Evacuees
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════ SUB-TAB: TRANSFERS ══════ */}
      {subTab === "transfers" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              Inter-Camp Transfer System
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Transfer evacuees from overcrowded camps to those with available capacity. Smart suggestions based on proximity and resource levels.
            </p>

            {/* Smart suggestions */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">⚡ Smart Transfer Suggestions</div>

              {camps
                .filter(c => (c.currentOccupancy / c.capacity) >= 0.85)
                .map(fromCamp => {
                  const toCamp = camps
                    .filter(c => c.id !== fromCamp.id && (c.currentOccupancy / c.capacity) < 0.6)
                    .sort((a, b) => (a.currentOccupancy / a.capacity) - (b.currentOccupancy / b.capacity))[0];
                  if (!toCamp) return null;
                  const transferCount = Math.min(
                    Math.round(fromCamp.currentOccupancy * 0.15),
                    toCamp.capacity - toCamp.currentOccupancy
                  );
                  return (
                    <div key={fromCamp.id} className="bg-white rounded-xl border border-blue-100 p-4 flex flex-col sm:flex-row items-center gap-4">
                      {/* From */}
                      <div className="flex-1 text-center sm:text-left">
                        <div className="text-sm font-bold text-gray-900">{fromCamp.name}</div>
                        <div className="text-xs text-red-600">{Math.round((fromCamp.currentOccupancy / fromCamp.capacity) * 100)}% full — {fromCamp.currentOccupancy} evacuees</div>
                      </div>
                      {/* Arrow */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-lg font-bold text-blue-600">→ {transferCount} people →</div>
                        <div className="text-[10px] text-gray-500">Suggested transfer</div>
                      </div>
                      {/* To */}
                      <div className="flex-1 text-center sm:text-right">
                        <div className="text-sm font-bold text-gray-900">{toCamp.name}</div>
                        <div className="text-xs text-emerald-600">{Math.round((toCamp.currentOccupancy / toCamp.capacity) * 100)}% full — {toCamp.capacity - toCamp.currentOccupancy} beds free</div>
                      </div>
                      {/* Action */}
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                        Initiate
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Capacity overview bars */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Camp Capacity Overview
            </h3>
            <div className="space-y-3">
              {camps.map(camp => {
                const pct = Math.round((camp.currentOccupancy / camp.capacity) * 100);
                return (
                  <div key={camp.id} className="flex items-center gap-3">
                    <span className="w-40 text-sm font-medium text-gray-700 truncate">{camp.name.replace(" Relief Camp", "").replace(" Emergency Shelter", "").replace(" Cyclone Camp", "").replace(" Relief Centre", "").replace(" Coast Shelter", "")}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pct >= 95 ? "bg-gradient-to-r from-red-500 to-rose-400" :
                          pct >= 75 ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                          "bg-gradient-to-r from-emerald-500 to-green-400"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                        {camp.currentOccupancy} / {camp.capacity}
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs font-bold w-10 text-right",
                      pct >= 95 ? "text-red-600" : pct >= 75 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════ SUB-TAB: SUPPLY ALERTS ══════ */}
      {subTab === "alerts" && (
        <div className="space-y-4">
          {/* Critical alerts */}
          {criticalAlerts.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-200 p-5">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                CRITICAL — Immediate Action Required
              </h3>
              <div className="space-y-2">
                {camps.map(camp => {
                  const criticals = [
                    camp.food === "CRITICAL" && "Food",
                    camp.water === "CRITICAL" && "Water",
                    camp.medicine === "CRITICAL" && "Medicine",
                    camp.shelter === "CRITICAL" && "Shelter",
                  ].filter(Boolean);
                  if (criticals.length === 0) return null;
                  return (
                    <div key={camp.id} className="bg-white/80 rounded-xl p-4 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-red-900">{camp.name}</div>
                        <div className="text-xs text-red-700 mt-0.5">
                          🔴 Critical: {criticals.join(", ")} &bull; {camp.currentOccupancy} evacuees affected
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setRequestCampId(camp.id);
                          setNewReq(prev => ({ ...prev, priority: "CRITICAL", resource: criticals.join(", ") }));
                          setShowRequestForm(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Emergency Request
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Low alerts */}
          {lowAlerts.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5">
              <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                LOW STOCK — Replenishment Needed Soon
              </h3>
              <div className="space-y-2">
                {camps.map(camp => {
                  const lows = [
                    camp.food === "LOW" && "Food",
                    camp.water === "LOW" && "Water",
                    camp.medicine === "LOW" && "Medicine",
                    camp.shelter === "LOW" && "Shelter",
                    camp.sanitation === "LOW" && "Sanitation",
                  ].filter(Boolean);
                  if (lows.length === 0) return null;
                  return (
                    <div key={camp.id} className="bg-white/80 rounded-xl p-4 border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-amber-900">{camp.name}</div>
                        <div className="text-xs text-amber-700 mt-0.5">
                          🟡 Low: {lows.join(", ")} &bull; {camp.currentOccupancy} evacuees
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setRequestCampId(camp.id);
                          setNewReq(prev => ({ ...prev, priority: "HIGH", resource: lows.join(", ") }));
                          setShowRequestForm(true);
                        }}
                        className="px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Request Supplies
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {criticalAlerts.length === 0 && lowAlerts.length === 0 && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-emerald-800 text-lg">All Supplies Adequate</h3>
              <p className="text-emerald-600 text-sm mt-1">No critical or low-stock alerts at this time.</p>
            </div>
          )}
        </div>
      )}

      {/* ══════ RESOURCE REQUEST MODAL ══════ */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Raise Resource Request
              </h3>
              <button onClick={() => { setShowRequestForm(false); setNewReq({ resource: "", quantity: "", priority: "HIGH", notes: "" }); }} className="text-white/80 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Camp selector */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Camp</label>
                <select
                  value={requestCampId}
                  onChange={(e) => setRequestCampId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="">Select camp...</option>
                  {camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Resource */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Resource Needed</label>
                <input
                  type="text"
                  value={newReq.resource}
                  onChange={(e) => setNewReq(p => ({ ...p, resource: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="e.g. Medical Kits, Drinking Water, Blankets..."
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Quantity</label>
                <input
                  type="text"
                  value={newReq.quantity}
                  onChange={(e) => setNewReq(p => ({ ...p, quantity: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="e.g. 200 units, 5000 liters, 2 tonnes..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewReq(prev => ({ ...prev, priority: p }))}
                      className={cn(
                        "text-xs font-bold py-2 rounded-lg border-2 transition-all",
                        newReq.priority === p
                          ? priorityStyle[p].bg + " border-current scale-105"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Notes (optional)</label>
                <textarea
                  value={newReq.notes}
                  onChange={(e) => setNewReq(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none h-20"
                  placeholder="Additional context for the request..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => { setShowRequestForm(false); setNewReq({ resource: "", quantity: "", priority: "HIGH", notes: "" }); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!newReq.resource || !newReq.quantity || !requestCampId}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab() {
  // ── 7-month Maharashtra SOS & Resolution data (Aug 2025 – Feb 2026) ──
  const monthlySOS = [
    { month: 'Aug 25',  sos: 68,  resolved: 60,  pending: 8  },
    { month: 'Sep 25',  sos: 82,  resolved: 74,  pending: 8  },
    { month: 'Oct 25',  sos: 41,  resolved: 39,  pending: 2  },
    { month: 'Nov 25',  sos: 27,  resolved: 26,  pending: 1  },
    { month: 'Dec 25',  sos: 19,  resolved: 18,  pending: 1  },
    { month: 'Jan 26',  sos: 34,  resolved: 31,  pending: 3  },
    { month: 'Feb 26',  sos: 45,  resolved: 37,  pending: 8  },
  ];

  // Response time trend (minutes)
  const responseTime = [
    { month: 'Aug 25', avg: 58, ndrf: 42, sdrf: 65, volunteer: 85 },
    { month: 'Sep 25', avg: 62, ndrf: 45, sdrf: 60, volunteer: 90 },
    { month: 'Oct 25', avg: 50, ndrf: 35, sdrf: 52, volunteer: 72 },
    { month: 'Nov 25', avg: 45, ndrf: 30, sdrf: 48, volunteer: 65 },
    { month: 'Dec 25', avg: 40, ndrf: 28, sdrf: 44, volunteer: 60 },
    { month: 'Jan 26', avg: 44, ndrf: 32, sdrf: 46, volunteer: 64 },
    { month: 'Feb 26', avg: 42, ndrf: 30, sdrf: 45, volunteer: 62 },
  ];

  // Disaster type breakdown
  const disasterBreakdown = [
    { type: 'Flood', count: 124, color: '#3b82f6' },
    { type: 'Cyclone', count: 56, color: '#8b5cf6' },
    { type: 'Heatwave', count: 48, color: '#f59e0b' },
    { type: 'Landslide', count: 42, color: '#ef4444' },
    { type: 'Earthquake', count: 18, color: '#06b6d4' },
  ];

  // Compute KPIs
  const totalSOS = monthlySOS.reduce((s, m) => s + m.sos, 0);
  const totalResolved = monthlySOS.reduce((s, m) => s + m.resolved, 0);
  const resolutionRate = ((totalResolved / totalSOS) * 100).toFixed(1);
  const latestAvgResponse = responseTime[responseTime.length - 1].avg;
  const prevAvgResponse = responseTime[0].avg;
  const responseImprovement = Math.round(
    ((prevAvgResponse - latestAvgResponse) / prevAvgResponse) * 100
  );

  // Bar dimensions for the pure-CSS bar chart (no Recharts needed for breakdown)
  const maxDisasterCount = Math.max(...disasterBreakdown.map((d) => d.count));

  // ── CSV download helper ──
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDailySituation = () => {
    const today = new Date().toLocaleDateString('en-IN');
    const headers = ['Report Field', 'Value'];
    const rows: string[][] = [
      ['Report Title', 'Daily Situation Report - NDRF Maharashtra'],
      ['Generated On', today],
      ['Reporting Period', 'Aug 2025 - Feb 2026'],
      ['---', '---'],
      ['Total SOS Received', totalSOS.toString()],
      ['Total Resolved', totalResolved.toString()],
      ['Total Pending', (totalSOS - totalResolved).toString()],
      ['Resolution Rate', `${resolutionRate}%`],
      ['Avg Response Time', `${latestAvgResponse} min`],
      ['Response Improvement', `${responseImprovement}%`],
      ['Active Teams', '12'],
      ['---', '---'],
      ['DISASTER BREAKDOWN', ''],
      ...disasterBreakdown.map(d => [d.type, d.count.toString()]),
      ['---', '---'],
      ['MONTHLY SOS SUMMARY', ''],
      ['Month', 'SOS / Resolved / Pending'],
      ...monthlySOS.map(m => [m.month, `${m.sos} / ${m.resolved} / ${m.pending}`]),
    ];
    downloadCSV(`NDRF_Daily_Situation_${today.replace(/\//g, '-')}.csv`, headers, rows);
  };

  const exportResourceUtilization = () => {
    const today = new Date().toLocaleDateString('en-IN');
    const headers = ['Month', 'Total SOS', 'Resolved', 'Pending', 'Resolution Rate (%)'];
    const rows = monthlySOS.map(m => [
      m.month,
      m.sos.toString(),
      m.resolved.toString(),
      m.pending.toString(),
      ((m.resolved / m.sos) * 100).toFixed(1),
    ]);
    // Add totals row
    rows.push([
      'TOTAL',
      totalSOS.toString(),
      totalResolved.toString(),
      (totalSOS - totalResolved).toString(),
      resolutionRate,
    ]);
    // Add disaster breakdown
    rows.push([]);
    rows.push(['Disaster Type', 'Incidents', 'Percentage', '', '']);
    disasterBreakdown.forEach(d => {
      rows.push([d.type, d.count.toString(), `${((d.count / totalSOS) * 100).toFixed(1)}%`, '', '']);
    });
    downloadCSV(`NDRF_Resource_Utilization_${today.replace(/\//g, '-')}.csv`, headers, rows);
  };

  const exportResponseTimeAnalysis = () => {
    const today = new Date().toLocaleDateString('en-IN');
    const headers = ['Month', 'Avg Response (min)', 'NDRF (min)', 'SDRF (min)', 'Volunteer (min)'];
    const rows = responseTime.map(r => [
      r.month,
      r.avg.toString(),
      r.ndrf.toString(),
      r.sdrf.toString(),
      r.volunteer.toString(),
    ]);
    // Add summary
    const avgAll = Math.round(responseTime.reduce((s, r) => s + r.avg, 0) / responseTime.length);
    const avgNdrf = Math.round(responseTime.reduce((s, r) => s + r.ndrf, 0) / responseTime.length);
    const avgSdrf = Math.round(responseTime.reduce((s, r) => s + r.sdrf, 0) / responseTime.length);
    const avgVol = Math.round(responseTime.reduce((s, r) => s + r.volunteer, 0) / responseTime.length);
    rows.push(['AVERAGE', avgAll.toString(), avgNdrf.toString(), avgSdrf.toString(), avgVol.toString()]);
    rows.push([]);
    rows.push(['First Month Avg', prevAvgResponse.toString(), '', '', '']);
    rows.push(['Latest Month Avg', latestAvgResponse.toString(), '', '', '']);
    rows.push(['Improvement', `${responseImprovement}%`, '', '', '']);
    downloadCSV(`NDRF_Response_Time_Analysis_${today.replace(/\//g, '-')}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          <BarChart3 className="w-6 h-6 inline mr-2 text-blue-600" />
          Analytics &amp; Insights
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          7-month historical data (Aug 2025 – Feb 2026) • Maharashtra disaster operations
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total SOS (7m)",
            value: totalSOS.toString(),
            change: "+12%",
            up: true,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-200",
          },
          {
            label: "Resolution Rate",
            value: `${resolutionRate}%`,
            change: "+4.1%",
            up: true,
            icon: Activity,
            color: "text-green-600",
            bg: "bg-green-50 border-green-200",
          },
          {
            label: "Avg Response",
            value: `${latestAvgResponse} min`,
            change: `-${responseImprovement}%`,
            up: false,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-200",
          },
          {
            label: "Teams Active",
            value: "12",
            change: "+3",
            up: true,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50 border-purple-200",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`p-4 rounded-xl border shadow-sm ${kpi.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${kpi.color}`} />
                <span
                  className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded",
                    kpi.up ? "text-green-700 bg-green-100" : "text-blue-700 bg-blue-100"
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

      {/* ═══════ CHARTS ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Monthly SOS & Resolution ── */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">
            <Activity className="w-4 h-4 inline mr-2 text-amber-600" />
            Monthly SOS &amp; Resolution
          </h3>
          <p className="text-xs text-gray-500 mb-4">Stacked bar: Resolved (green) vs Pending (red)</p>
          <div className="h-64 flex items-end gap-3 px-2">
            {monthlySOS.map((m) => {
              const maxVal = Math.max(...monthlySOS.map((x) => x.sos));
              const totalH = (m.sos / maxVal) * 100;
              const resolvedH = (m.resolved / maxVal) * 100;
              const pendingH = (m.pending / maxVal) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  {/* Value label */}
                  <span className="text-[10px] font-bold text-gray-700">{m.sos}</span>
                  {/* Stacked bar */}
                  <div className="w-full rounded-t-md overflow-hidden flex flex-col-reverse" style={{ height: `${totalH}%` }}>
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ height: `${(resolvedH / totalH) * 100}%` }}
                      title={`Resolved: ${m.resolved}`}
                    />
                    <div
                      className="bg-red-400 transition-all duration-500"
                      style={{ height: `${(pendingH / totalH) * 100}%` }}
                      title={`Pending: ${m.pending}`}
                    />
                  </div>
                  {/* Month label */}
                  <span className="text-[10px] text-gray-500 whitespace-nowrap mt-1">{m.month}</span>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" /> Resolved</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm inline-block" /> Pending</span>
          </div>
        </div>

        {/* ── Response Time Trends ── */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">
            <Clock className="w-4 h-4 inline mr-2 text-blue-600" />
            Response Time Trends
          </h3>
          <p className="text-xs text-gray-500 mb-4">Average response time (minutes) by team type</p>
          {(() => {
            const W = 600, H = 200, PAD = 30, MAXY = 95;
            const xStep = (W - PAD * 2) / (responseTime.length - 1);
            const toY = (v: number) => PAD + ((MAXY - v) / MAXY) * (H - PAD * 2);
            const toX = (i: number) => PAD + i * xStep;
            const makeLine = (key: 'ndrf' | 'sdrf' | 'volunteer' | 'avg') =>
              responseTime.map((r, i) => `${toX(i)},${toY(r[key])}`).join(' ');

            return (
              <div className="h-64">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                  {/* Grid */}
                  {[0, 30, 60, 90].map((v) => (
                    <g key={v}>
                      <line x1={PAD} y1={toY(v)} x2={W - PAD} y2={toY(v)} stroke="#e5e7eb" strokeWidth="1" />
                      <text x={PAD - 4} y={toY(v) + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{v}m</text>
                    </g>
                  ))}
                  {/* X labels */}
                  {responseTime.map((r, i) => (
                    <text key={r.month} x={toX(i)} y={H - 5} textAnchor="middle" fontSize="10" fill="#9ca3af">{r.month}</text>
                  ))}
                  {/* NDRF */}
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" points={makeLine('ndrf')} />
                  {responseTime.map((r, i) => <circle key={`n${i}`} cx={toX(i)} cy={toY(r.ndrf)} r="3" fill="#3b82f6" />)}
                  {/* SDRF */}
                  <polyline fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="6 3" points={makeLine('sdrf')} />
                  {responseTime.map((r, i) => <circle key={`s${i}`} cx={toX(i)} cy={toY(r.sdrf)} r="3" fill="#8b5cf6" />)}
                  {/* Volunteer */}
                  <polyline fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 4" points={makeLine('volunteer')} />
                  {responseTime.map((r, i) => <circle key={`v${i}`} cx={toX(i)} cy={toY(r.volunteer)} r="3" fill="#f59e0b" />)}
                  {/* Average (bold) */}
                  <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinejoin="round" points={makeLine('avg')} />
                  {responseTime.map((r, i) => <circle key={`a${i}`} cx={toX(i)} cy={toY(r.avg)} r="4" fill="#10b981" />)}
                </svg>
              </div>
            );
          })()}
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> NDRF</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block" /> SDRF</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block" /> Volunteer</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Avg</span>
          </div>
        </div>
      </div>

      {/* ── Disaster Type Breakdown ── */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">
          <BarChart3 className="w-4 h-4 inline mr-2 text-blue-600" />
          Disaster Type Breakdown (7 months)
        </h3>
        <div className="space-y-3">
          {disasterBreakdown.map((d) => (
            <div key={d.type} className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium text-gray-700">{d.type}</span>
              <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                  style={{
                    width: `${(d.count / maxDisasterCount) * 100}%`,
                    backgroundColor: d.color,
                  }}
                >
                  <span className="text-[11px] font-bold text-white drop-shadow-sm">{d.count}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">
                {((d.count / totalSOS) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
          <button
            onClick={exportDailySituation}
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 active:scale-95 transition border border-blue-200"
          >
            <FileDown className="w-4 h-4" />
            <span className="font-medium text-sm">Daily Situation Report</span>
          </button>
          <button
            onClick={exportResourceUtilization}
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 active:scale-95 transition border border-blue-200"
          >
            <FileDown className="w-4 h-4" />
            <span className="font-medium text-sm">Resource Utilization</span>
          </button>
          <button
            onClick={exportResponseTimeAnalysis}
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 active:scale-95 transition border border-blue-200"
          >
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
