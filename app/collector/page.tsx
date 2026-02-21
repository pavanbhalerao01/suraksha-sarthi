import Link from "next/link";
import { 
  Eye, 
  MessageSquare, 
  FileDown, 
  Users, 
  MapPin, 
  AlertTriangle,
  Radio,
  Shield
} from "lucide-react";

export default function DistrictCollectorDashboard() {
  // Mock data - will be replaced with actual data from database
  const districtData = {
    name: "Pune District",
    activeIncidents: 12,
    teamsDeployed: 8,
    volunteersActive: 45,
    avgResponseTime: "18 min"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">District Collector Portal</h1>
                <p className="text-purple-200 text-sm">{districtData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/portal" 
                className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-800 transition text-sm"
              >
                Switch Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-purple-50 border-l-4 border-purple-600 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Eye className="w-5 h-5 text-purple-600" />
          <p className="text-purple-900 text-sm">
            <strong>View-Only Access:</strong> You can view all coordination data and communicate directly with NDRF Command. 
            To request operational changes, use the NDRF Communication channel.
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
            <div className="text-3xl font-bold text-gray-900">{districtData.activeIncidents}</div>
            <div className="text-xs text-gray-500 mt-1">In {districtData.name}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Teams Deployed</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{districtData.teamsDeployed}</div>
            <div className="text-xs text-gray-500 mt-1">NDRF + SDRF</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Volunteers Active</span>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{districtData.volunteersActive}</div>
            <div className="text-xs text-gray-500 mt-1">On ground now</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Avg Response Time</span>
              <Radio className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{districtData.avgResponseTime}</div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
        </div>

        {/* NDRF Direct Communication */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6" />
            <h2 className="text-xl font-bold">Direct NDRF Communication</h2>
          </div>
          <p className="text-purple-100 mb-4">
            Communicate directly with NDRF Command Center for urgent coordination, resource requests, or policy decisions.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition">
              Send Message to NDRF
            </button>
            <button className="px-6 py-3 bg-purple-800 text-white rounded-lg font-semibold hover:bg-purple-900 transition">
              View Message History
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Incident Map */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Live Incident Map</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Live Updates
              </span>
            </div>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Interactive map showing all incidents, teams, and volunteers</p>
                <p className="text-sm mt-1">Will be integrated with Leaflet.js</p>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Incidents</h2>
            <div className="space-y-3">
              {[
                { id: 1, type: "Flood", location: "Sinhagad Road", severity: "high", time: "15 min ago" },
                { id: 2, type: "Building Collapse", location: "Deccan", severity: "critical", time: "32 min ago" },
                { id: 3, type: "Medical Emergency", location: "Kothrud", severity: "medium", time: "1 hour ago" }
              ].map((incident) => (
                <div key={incident.id} className="border-l-4 border-purple-600 bg-gray-50 p-3 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{incident.type}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mb-1">{incident.location}</p>
                  <p className="text-gray-400 text-xs">{incident.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export & Reports Section */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <FileDown className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Export & Reports</h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Generate comprehensive reports for district administration and state authorities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition border border-purple-200">
              <FileDown className="w-4 h-4" />
              <span className="font-medium text-sm">Daily Situation Report</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition border border-purple-200">
              <FileDown className="w-4 h-4" />
              <span className="font-medium text-sm">Resource Utilization</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition border border-purple-200">
              <FileDown className="w-4 h-4" />
              <span className="font-medium text-sm">Response Time Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
