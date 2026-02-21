"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Radio, 
  MapPin, 
  Navigation,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Camera,
  Upload
} from "lucide-react";

const teamConfig = {
  ndrf: {
    name: "NDRF Field Team",
    color: "blue",
    skills: ["Water Rescue", "Building Collapse", "High Angle Rescue"],
  },
  sdrf: {
    name: "SDRF Field Team",
    color: "cyan",
    skills: ["Flood Response", "Evacuation", "Relief Distribution"],
  },
  fire: {
    name: "Fire Services",
    color: "red",
    skills: ["Fire Fighting", "Medical First Response", "Hazmat"],
  },
  police: {
    name: "Police Team",
    color: "slate",
    skills: ["Crowd Control", "Traffic Management", "Security"],
  },
  medical: {
    name: "Medical Emergency Team",
    color: "green",
    skills: ["Emergency Medicine", "Triage", "Ambulance Services"],
  },
  "civil-defense": {
    name: "Civil Defense Team",
    color: "amber",
    skills: ["Shelter Management", "Supplies Distribution", "Coordination"],
  },
};

export default function ActionTeamPage() {
  const params = useParams();
  const teamType = params.teamType as string;
  const team = teamConfig[teamType as keyof typeof teamConfig] || teamConfig.ndrf;
  const [onDuty, setOnDuty] = useState(false);

  // Mock assigned incidents
  const assignedIncidents = [
    {
      id: "INC-001",
      type: "Building Collapse",
      location: "Sinhagad Road, Pune",
      distance: "2.3 km",
      priority: "urgent",
      peopleAffected: 15,
      status: "assigned",
      assignedTime: "10 min ago",
    },
    {
      id: "INC-002",
      type: "Flood Rescue",
      location: "Deccan Area",
      distance: "4.1 km",
      priority: "high",
      peopleAffected: 8,
      status: "assigned",
      assignedTime: "25 min ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`bg-${team.color}-600 text-white shadow-lg`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <p className={`text-${team.color}-200 text-sm`}>Field Operations Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!onDuty ? (
                <button 
                  onClick={() => setOnDuty(true)}
                  className={`px-6 py-2 bg-white text-${team.color}-600 rounded-lg font-semibold hover:bg-${team.color}-50 transition`}
                >
                  Start Duty
                </button>
              ) : (
                <button 
                  onClick={() => setOnDuty(false)}
                  className={`px-6 py-2 bg-${team.color}-700 text-white rounded-lg font-semibold hover:bg-${team.color}-800 transition`}
                >
                  End Duty
                </button>
              )}
              <Link 
                href="/portal" 
                className={`px-4 py-2 bg-${team.color}-700 rounded-lg hover:bg-${team.color}-800 transition text-sm`}
              >
                Switch Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* On Duty Banner */}
      {onDuty && (
        <div className={`bg-${team.color}-600 text-white py-3`}>
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">ON DUTY - GPS Tracking Active</span>
            </div>
            <span className={`text-${team.color}-100 text-sm`}>Connected to Command Center</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Assigned Incidents</span>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{assignedIncidents.length}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Completed Today</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">5</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Avg Response Time</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">12 min</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">People Helped</span>
              <Radio className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">38</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Incidents */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Assigned Incidents</h2>
              <span className={`px-3 py-1 bg-${team.color}-100 text-${team.color}-800 rounded-full text-xs font-medium`}>
                {assignedIncidents.length} Active
              </span>
            </div>
            
            <div className="space-y-4">
              {assignedIncidents.map((incident) => (
                <div 
                  key={incident.id} 
                  className={`border-l-4 ${
                    incident.priority === 'urgent' 
                      ? 'border-red-600 bg-red-50' 
                      : 'border-orange-600 bg-orange-50'
                  } p-4 rounded-lg`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          incident.priority === 'urgent'
                            ? 'bg-red-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}>
                          {incident.priority}
                        </span>
                        <span className="font-bold text-gray-900">{incident.id}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{incident.type}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {incident.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          {incident.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👥 {incident.peopleAffected} people affected</span>
                        <span>🕐 Assigned {incident.assignedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className={`flex-1 px-4 py-2 bg-${team.color}-600 text-white rounded-lg font-semibold hover:bg-${team.color}-700 transition`}>
                      Navigate
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                      Start Response
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Info & Communication */}
          <div className="space-y-6">
            {/* Team Skills */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Team Capabilities</h2>
              <div className="space-y-2">
                {team.skills.map((skill) => (
                  <div key={skill} className={`flex items-center gap-2 p-2 bg-${team.color}-50 rounded`}>
                    <CheckCircle className={`w-4 h-4 text-${team.color}-600`} />
                    <span className="text-sm font-medium text-gray-900">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Command Communication */}
            <div className={`bg-gradient-to-br from-${team.color}-600 to-${team.color}-700 p-6 rounded-xl shadow-lg text-white`}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5" />
                <h2 className="text-lg font-bold">Command Center</h2>
              </div>
              <p className={`text-${team.color}-100 mb-4 text-sm`}>
                Direct communication with coordination team
              </p>
              <button className={`w-full px-4 py-2 bg-white text-${team.color}-600 rounded-lg font-semibold hover:bg-${team.color}-50 transition`}>
                Send Message
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload Incident Photo</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Request Resources</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Report Hazard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
