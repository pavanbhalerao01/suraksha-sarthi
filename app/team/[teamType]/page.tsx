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
  "relief-camp": {
    name: "Relief Camp Incharge",
    color: "purple",
    skills: ["Camp Management", "Resource Allocation", "Evacuee Registration"],
  },
};

export default function ActionTeamPage() {
  const params = useParams();
  const teamType = params.teamType as string;
  const team = teamConfig[teamType as keyof typeof teamConfig] || teamConfig.ndrf;
  const [onDuty, setOnDuty] = useState(false);
  const [showResourceRequest, setShowResourceRequest] = useState(false);
  const [resourceRequests, setResourceRequests] = useState<any[]>([]);

  // Relief Camp specific data
  const reliefCampData = {
    campName: "Relief Camp - Sinhagad Road Flood Zone",
    location: "Near PMC School, Sinhagad Road, Pune",
    coordinates: "18.4574° N, 73.8112° E",
    capacity: 500,
    currentOccupancy: 347,
    registered: 347,
    facilities: ["Medical Unit", "Food Distribution", "Sanitation", "Children's Area"],
    openedOn: "20 Feb 2025, 10:30 AM",
  };

  const resourceInventory = [
    { item: "Food Packets", current: 450, required: 1000, unit: "packets", status: "low" },
    { item: "Water Bottles", current: 800, required: 1500, unit: "bottles", status: "low" },
    { item: "Blankets", current: 250, required: 500, unit: "pieces", status: "critical" },
    { item: "Medical Supplies", current: 150, required: 200, unit: "kits", status: "medium" },
    { item: "Tarpaulin Sheets", current: 80, required: 100, unit: "sheets", status: "good" },
    { item: "Hygiene Kits", current: 100, required: 400, unit: "kits", status: "critical" },
  ];

  const handleResourceRequest = (item: string, quantity: number, priority: string) => {
    const newRequest = {
      id: `REQ-${Date.now()}`,
      item,
      quantity,
      priority,
      timestamp: new Date().toLocaleString(),
      status: "Pending"
    };
    setResourceRequests([...resourceRequests, newRequest]);
    setShowResourceRequest(false);
  };

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

  // Relief Camp Dashboard
  if (teamType === 'relief-camp') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  <p className="text-purple-200 text-sm">Relief Camp Management Dashboard</p>
                </div>
              </div>
              <Link 
                href="/portal" 
                className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-800 transition text-sm"
              >
                Switch Portal
              </Link>
            </div>
          </div>
        </header>

        {/* Camp Info Banner */}
        <div className="bg-purple-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">{reliefCampData.campName}</span>
            </div>
            <span className="text-purple-100 text-sm">Status: Active | Opened: {reliefCampData.openedOn}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Camp Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Current Occupancy</span>
                <Radio className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{reliefCampData.currentOccupancy}</div>
              <div className="text-xs text-gray-500 mt-1">of {reliefCampData.capacity} capacity ({Math.round((reliefCampData.currentOccupancy/reliefCampData.capacity)*100)}% full)</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Registered Evacuees</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{reliefCampData.registered}</div>
              <div className="text-xs text-green-600 mt-1">All verified</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Resource Requests</span>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{resourceRequests.length}</div>
              <div className="text-xs text-orange-600 mt-1">{resourceRequests.filter(r => r.status === "Pending").length} pending</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Active Facilities</span>
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{reliefCampData.facilities.length}</div>
              <div className="text-xs text-gray-500 mt-1">All operational</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camp Location & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Location Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Camp Location
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Address:</span>
                    <p className="font-semibold text-gray-900">{reliefCampData.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">GPS Coordinates:</span>
                    <p className="font-mono text-sm text-gray-900">{reliefCampData.coordinates}</p>
                  </div>
                  <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Map View</p>
                      <p className="text-xs">(OpenStreetMap integration)</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Share Location with Teams
                  </button>
                </div>
              </div>

              {/* Resource Inventory */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Resource Inventory</h2>
                  <button 
                    onClick={() => setShowResourceRequest(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                  >
                    + Request Resources
                  </button>
                </div>
                
                <div className="space-y-3">
                  {resourceInventory.map((resource) => {
                    const percentage = (resource.current / resource.required) * 100;
                    const statusColor = 
                      resource.status === 'critical' ? 'red' :
                      resource.status === 'low' ? 'orange' :
                      resource.status === 'medium' ? 'yellow' : 'green';
                    
                    return (
                      <div key={resource.item} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{resource.item}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase bg-${statusColor}-100 text-${statusColor}-800`}>
                            {resource.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-${statusColor}-600 h-2 rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 min-w-[100px] text-right">
                            {resource.current} / {resource.required} {resource.unit}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {resource.required - resource.current} {resource.unit} needed
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resource Request History */}
              {resourceRequests.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Resource Requests</h2>
                  <div className="space-y-3">
                    {resourceRequests.map((request) => (
                      <div key={request.id} className="border-l-4 border-purple-600 bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">{request.id}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                request.priority === 'urgent' ? 'bg-red-600 text-white' :
                                request.priority === 'high' ? 'bg-orange-600 text-white' :
                                'bg-yellow-600 text-white'
                              }`}>
                                {request.priority}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-900">{request.item}</h3>
                            <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
                            <p className="text-xs text-gray-500 mt-1">Requested: {request.timestamp}</p>
                          </div>
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Facilities */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Active Facilities</h2>
                <div className="space-y-2">
                  {reliefCampData.facilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Capabilities */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Management Skills</h2>
                <div className="space-y-2">
                  {team.skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Command Communication */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Command Center</h2>
                </div>
                <p className="text-purple-100 mb-4 text-sm">
                  Direct coordination with relief operations
                </p>
                <button className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition">
                  Send Message
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Upload Camp Photos</span>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    <span className="text-sm">Register New Evacuee</span>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Report Emergency</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Request Modal */}
        {showResourceRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Request Resources</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleResourceRequest(
                  formData.get('item') as string,
                  Number(formData.get('quantity')),
                  formData.get('priority') as string
                );
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Item
                    </label>
                    <select 
                      name="item"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="">Select item...</option>
                      {resourceInventory.map((res) => (
                        <option key={res.item} value={res.item}>{res.item}</option>
                      ))}
                      <option value="Other">Other (specify in notes)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Needed
                    </label>
                    <input 
                      type="number" 
                      name="quantity"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority Level
                    </label>
                    <select 
                      name="priority"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="urgent">🔴 Urgent - Immediate need</option>
                      <option value="high">🟠 High - Within 4 hours</option>
                      <option value="medium">🟡 Medium - Within 24 hours</option>
                    </select>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowResourceRequest(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular Field Team Dashboard
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
