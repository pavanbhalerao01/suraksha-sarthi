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
  Upload,
  Power,
  PowerOff,
  Share2,
  Send
} from "lucide-react";
import { useGeolocation, formatCoordinates, shareLocation } from "@/lib/useGeolocation";

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
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showEvacueeForm, setShowEvacueeForm] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Action team specific states
  const [showIncidentUpload, setShowIncidentUpload] = useState(false);
  const [showHazardReport, setShowHazardReport] = useState(false);
  const teamId = `${teamType}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Location tracking with geolocation hook
  const location = useGeolocation({
    watch: onDuty && teamType !== 'relief-camp', // Continuous tracking when on duty
    enableHighAccuracy: true,
  });

  // Send location updates to server when on duty
  useEffect(() => {
    if (
      onDuty && 
      teamType !== 'relief-camp' && 
      location.latitude && 
      location.longitude
    ) {
      const updateLocation = async () => {
        try {
          await fetch('/api/location/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamId,
              teamType,
              teamName: team.name,
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              heading: location.heading,
              speed: location.speed,
              onDuty: true,
            }),
          });
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      };

      updateLocation();
      // Update every 10 seconds while on duty
      const interval = setInterval(updateLocation, 10000);
      
      return () => clearInterval(interval);
    }
  }, [onDuty, location.latitude, location.longitude, teamType]);

  // Remove location when going off duty
  const handleDutyToggle = async () => {
    const newDutyStatus = !onDuty;
    setOnDuty(newDutyStatus);

    if (!newDutyStatus && teamType !== 'relief-camp') {
      // Going off duty - remove from tracking
      try {
        await fetch(`/api/location/track?teamId=${teamId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to stop location tracking:', error);
      }
    }
  };

  // Share location handler
  const handleShareLocation = async () => {
    if (!location.latitude || !location.longitude) {
      alert('Location not available. Please enable location permissions.');
      return;
    }

    const result = await shareLocation(
      location.latitude,
      location.longitude,
      `${team.name} Location`
    );

    if (result.success) {
      if (result.method === 'clipboard') {
        alert('Location copied to clipboard!');
      }
    } else {
      alert(result.error || 'Failed to share location');
    }
  };

  // Upload incident photos handler
  const handleIncidentUpload = async (formData: FormData) => {
    try {
      formData.append('teamId', teamId);
      formData.append('teamType', teamType);
      formData.append('teamName', team.name);
      
      if (location.latitude && location.longitude) {
        formData.append('latitude', location.latitude.toString());
        formData.append('longitude', location.longitude.toString());
      }

      const response = await fetch('/api/incidents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`Incident reported successfully with ${data.photoCount} photo(s)!`);
        setShowIncidentUpload(false);
      } else {
        alert('Failed to upload incident. Please try again.');
      }
    } catch (error) {
      console.error('Incident upload error:', error);
      alert('Failed to upload incident. Please check your connection.');
    }
  };

  // Report hazard handler
  const handleHazardReport = async (formData: FormData) => {
    try {
      const hazardData = {
        teamId,
        teamType,
        teamName: team.name,
        hazardType: formData.get('hazardType'),
        severity: formData.get('severity'),
        location: formData.get('location'),
        description: formData.get('description'),
        affectedArea: formData.get('affectedArea'),
        requiresImmediate: formData.get('requiresImmediate') === 'on',
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const response = await fetch('/api/hazards/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hazardData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Hazard reported successfully with ${data.hazardReport.severity} severity!`);
        setShowHazardReport(false);
      } else {
        alert('Failed to report hazard. Please try again.');
      }
    } catch (error) {
      console.error('Hazard report error:', error);
      alert('Failed to report hazard. Please check your connection.');
    }
  };

  // Relief Camp specific data
  const reliefCampData = {
    campName: "Relief Camp - Sinhagad Road Flood Zone",
    location: "Near PMC School, Sinhagad Road, Pune",
    coordinates: "18.4574° N, 73.8112° E",
    capacity: 500,
    currentOccupancy: 347,
    registered: 347,
    openedOn: "20 Feb 2025, 10:30 AM",
  };

  const [facilities, setFacilities] = useState([
    { name: "Medical Unit", active: true },
    { name: "Food Distribution", active: true },
    { name: "Sanitation", active: true },
    { name: "Children's Area", active: true },
  ]);

  const [resourceInventory, setResourceInventory] = useState([
    { item: "Food Packets", current: 450, required: 1000, unit: "packets", status: "low" },
    { item: "Water Bottles", current: 800, required: 1500, unit: "bottles", status: "low" },
    { item: "Blankets", current: 250, required: 500, unit: "pieces", status: "critical" },
    { item: "Medical Supplies", current: 150, required: 200, unit: "kits", status: "medium" },
    { item: "Tarpaulin Sheets", current: 80, required: 100, unit: "sheets", status: "good" },
    { item: "Hygiene Kits", current: 100, required: 400, unit: "kits", status: "critical" },
  ]);

  const updateResourceQuantity = (index: number, newCurrent: number) => {
    const updated = [...resourceInventory];
    updated[index].current = newCurrent;
    // Recalculate status
    const percentage = (newCurrent / updated[index].required) * 100;
    updated[index].status = 
      percentage < 30 ? 'critical' :
      percentage < 60 ? 'low' :
      percentage < 80 ? 'medium' : 'good';
    setResourceInventory(updated);
  };

  const toggleFacility = (index: number) => {
    const updated = [...facilities];
    updated[index].active = !updated[index].active;
    setFacilities(updated);
  };

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

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const fileNames = Array.from(files).map(f => f.name);
      setUploadedPhotos([...uploadedPhotos, ...fileNames]);
      setShowPhotoUpload(false);
      // In production: upload to cloud storage and send to NDRF team
      alert(`${files.length} photo(s) uploaded and sent to NDRF Command Center`);
    }
  };

  const handleEvacueeRegistration = async (formData: FormData) => {
    const evacueeData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      aadhaar: formData.get('aadhaar'),
      address: formData.get('address'),
      familyMembers: formData.get('familyMembers'),
      medicalNeeds: formData.get('medicalNeeds'),
    };
    
    try {
      const response = await fetch('/api/evacuees/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evacueeData),
      });
      
      if (response.ok) {
        setShowEvacueeForm(false);
        alert('Evacuee registered successfully!');
        // Update registered count
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check your connection.');
    }
  };

  const handleSendMessage = async (formData: FormData) => {
    const recipients = formData.getAll('recipients');
    const message = formData.get('message');
    const images = formData.getAll('images');

    if (recipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    if (!message) {
      alert('Please enter a message');
      return;
    }

    try {
      const messageData = new FormData();
      messageData.append('sender', 'Relief Camp Incharge');
      messageData.append('senderCamp', reliefCampData.campName);
      messageData.append('recipients', JSON.stringify(recipients));
      messageData.append('message', message as string);
      
      // Append images
      for (let i = 0; i < images.length; i++) {
        messageData.append('images', images[i]);
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        body: messageData,
      });

      if (response.ok) {
        setShowMessageModal(false);
        alert(`Message sent successfully to ${recipients.length} team(s)!`);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Message sending error:', error);
      alert('Failed to send message. Please check your connection.');
    }
  };

  // Handle relief camp location sharing
  const handleReliefCampLocationShare = async () => {
    console.log('🔄 Attempting to share relief camp location...');
    
    // Parse coordinates from reliefCampData
    const coordsMatch = reliefCampData.coordinates.match(/([\d.]+)° N, ([\d.]+)° E/);
    
    if (!coordsMatch) {
      console.error('❌ Failed to parse coordinates:', reliefCampData.coordinates);
      alert('Error: Invalid coordinates format');
      return;
    }

    const latitude = parseFloat(coordsMatch[1]);
    const longitude = parseFloat(coordsMatch[2]);

    console.log('📍 Parsed coordinates:', { latitude, longitude });
    console.log('📋 Sharing details:', {
      campName: reliefCampData.campName,
      location: reliefCampData.location,
      coordinates: `${latitude}°N, ${longitude}°E`
    });

    try {
      const result = await shareLocation(
        latitude,
        longitude,
        `${reliefCampData.campName} - ${reliefCampData.location}`
      );

      if (result.success) {
        if (result.method === 'share') {
          console.log('✅ Location shared via native share sheet');
          alert('Location shared successfully!');
        } else if (result.method === 'clipboard') {
          console.log('✅ Location copied to clipboard');
          alert('📋 Camp location copied to clipboard!\n\nYou can now paste it in WhatsApp, SMS, or any messaging app.');
        }
      } else {
        console.error('❌ Share failed:', result.error);
        alert(result.error || 'Failed to share location. Please try again.');
      }
    } catch (error) {
      console.error('❌ Unexpected error while sharing location:', error);
      alert('An unexpected error occurred. Please check the console for details.');
    }
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
              <div className="text-3xl font-bold text-gray-900">{facilities.filter(f => f.active).length}</div>
              <div className="text-xs text-gray-500 mt-1">of {facilities.length} total</div>
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
                  <button 
                    onClick={handleReliefCampLocationShare}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
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
                  {resourceInventory.map((resource, index) => {
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
                        <div className="flex items-center gap-3 mb-2">
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
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs text-gray-600 font-medium">Update Current Stock:</label>
                          <input 
                            type="number" 
                            min="0"
                            value={resource.current}
                            onChange={(e) => updateResourceQuantity(index, parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                          />
                          <span className="text-xs text-gray-500">{resource.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {resource.required - resource.current > 0 
                            ? `${resource.required - resource.current} ${resource.unit} needed` 
                            : 'Stock sufficient'}
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
                <h2 className="text-lg font-bold text-gray-900 mb-4">Camp Facilities</h2>
                <div className="space-y-2">
                  {facilities.map((facility, index) => (
                    <div key={facility.name} className={`flex items-center justify-between p-3 rounded transition ${
                      facility.active ? 'bg-green-50' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${facility.active ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${facility.active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {facility.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFacility(index)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          facility.active ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          facility.active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
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
                <button 
                  onClick={() => setShowMessageModal(true)}
                  className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  Send Message
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowPhotoUpload(true)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Upload Camp Photos</span>
                  </button>
                  <button 
                    onClick={() => setShowEvacueeForm(true)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                  >
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

        {/* Photo Upload Modal */}
        {showPhotoUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Camp Photos</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload photos to share with NDRF Command Center. They will be notified immediately.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Photos
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can select multiple photos</p>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="border border-green-200 bg-green-50 rounded p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Previously Uploaded ({uploadedPhotos.length})
                    </p>
                    <ul className="text-xs text-green-700 space-y-1">
                      {uploadedPhotos.slice(-3).map((photo, i) => (
                        <li key={i}>✓ {photo}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPhotoUpload(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evacuee Registration Modal */}
        {showEvacueeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Evacuee</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEvacueeRegistration(formData);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <input 
                      type="text" 
                      name="aadhaar"
                      pattern="[0-9]{12}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="12-digit Aadhaar (optional)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Address (Evacuated From)
                    </label>
                    <textarea 
                      name="address"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter address from where evacuated"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Family Members *
                    </label>
                    <input 
                      type="number" 
                      name="familyMembers"
                      required
                      min="1"
                      defaultValue="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Needs
                    </label>
                    <input 
                      type="text" 
                      name="medicalNeeds"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Diabetes, BP, etc."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEvacueeForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Register Evacuee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Send Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message to Action Teams</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSendMessage(formData);
              }}>
                <div className="space-y-4">
                  {/* Recipient Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Recipients * (Choose one or more teams)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="recipients" 
                          value="NDRF Team"
                          className="mr-2 w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium">🔵 NDRF Team</span>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-cyan-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="recipients" 
                          value="SDRF Team"
                          className="mr-2 w-4 h-4 text-cyan-600"
                        />
                        <span className="text-sm font-medium">🔷 SDRF Team</span>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-red-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="recipients" 
                          value="Fire Services"
                          className="mr-2 w-4 h-4 text-red-600"
                        />
                        <span className="text-sm font-medium">🔴 Fire Services</span>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="recipients" 
                          value="Police Team"
                          className="mr-2 w-4 h-4 text-slate-600"
                        />
                        <span className="text-sm font-medium">⚫ Police Team</span>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-green-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="recipients" 
                          value="Medical Team"
                          className="mr-2 w-4 h-4 text-green-600"
                        />
                        <span className="text-sm font-medium">🟢 Medical Team</span>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-amber-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="recipients" 
                          value="Civil Defense"
                          className="mr-2 w-4 h-4 text-amber-600"
                        />
                        <span className="text-sm font-medium">🟡 Civil Defense</span>
                      </label>
                    </div>
                  </div>

                  {/* Message Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea 
                      name="message"
                      required
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Type your message here..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Images (Optional)
                    </label>
                    <input 
                      type="file" 
                      name="images"
                      accept="image/*"
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can select multiple images</p>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-800">
                      <strong>From:</strong> {reliefCampData.campName}<br />
                      <strong>Location:</strong> {reliefCampData.location}<br />
                      <strong>Coordinates:</strong> {reliefCampData.coordinates}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Send Message
                  </button>
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
                  onClick={handleDutyToggle}
                  className={`px-6 py-2 bg-white text-${team.color}-600 rounded-lg font-semibold hover:bg-${team.color}-50 transition flex items-center gap-2`}
                >
                  <Power className="w-4 h-4" />
                  Start Duty
                </button>
              ) : (
                <button 
                  onClick={handleDutyToggle}
                  className={`px-6 py-2 bg-${team.color}-700 text-white rounded-lg font-semibold hover:bg-${team.color}-800 transition flex items-center gap-2`}
                >
                  <PowerOff className="w-4 h-4" />
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
              {location.latitude && location.longitude && (
                <span className={`text-${team.color}-100 text-sm`}>
                  📍 {formatCoordinates(location.latitude, location.longitude)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-${team.color}-100 text-sm`}>Connected to Command Center</span>
              {location.accuracy && (
                <span className={`text-${team.color}-200 text-xs`}>
                  ±{Math.round(location.accuracy)}m
                </span>
              )}
            </div>
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
              <button 
                onClick={() => setShowMessageModal(true)}
                className={`w-full px-4 py-2 bg-white text-${team.color}-600 rounded-lg font-semibold hover:bg-${team.color}-50 transition`}
              >
                Send Message
              </button>
            </div>

            {/* Location Sharing */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>
              {location.latitude && location.longitude ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium text-gray-900 mb-1">Current Position:</div>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                      {formatCoordinates(location.latitude, location.longitude)}
                    </div>
                    {location.accuracy && (
                      <div className="text-xs text-gray-500 mt-1">
                        Accuracy: ±{Math.round(location.accuracy)} meters
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleShareLocation}
                    className={`w-full px-4 py-2 bg-${team.color}-600 text-white rounded-lg font-semibold hover:bg-${team.color}-700 transition flex items-center justify-center gap-2`}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Location
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">
                    {location.error || 'Location not available'}
                  </p>
                  <button 
                    onClick={location.getLocation}
                    disabled={location.loading}
                    className={`w-full px-4 py-2 bg-${team.color}-600 text-white rounded-lg font-semibold hover:bg-${team.color}-700 transition disabled:opacity-50`}
                  >
                    {location.loading ? 'Getting Location...' : 'Enable Location'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowIncidentUpload(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload Incident Photo</span>
                </button>
                <button 
                  onClick={() => setShowResourceRequest(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Request Resources</span>
                </button>
                <button 
                  onClick={() => setShowHazardReport(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Report Hazard</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODALS FOR ACTION TEAMS */}

        {/* Send Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message to Command Center</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSendMessage(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Recipients *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
                        <input type="checkbox" name="recipients" value="NDRF Admin" className="mr-2 w-4 h-4" />
                        <span className="text-sm font-medium">🔵 NDRF Admin</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-purple-50 cursor-pointer">
                        <input type="checkbox" name="recipients" value="Relief Camp" className="mr-2 w-4 h-4" />
                        <span className="text-sm font-medium">🟣 Relief Camps</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea 
                      name="message"
                      required
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="Type your message..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attach Images (Optional)</label>
                    <input 
                      type="file" 
                      name="images"
                      accept="image/*"
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>From:</strong> {team.name}<br />
                      {location.latitude && location.longitude && (
                        <>
                          <strong>Location:</strong> {formatCoordinates(location.latitude, location.longitude)}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Incident Photos Modal */}
        {showIncidentUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Incident Photos</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleIncidentUpload(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type *</label>
                    <select 
                      name="incidentType"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select incident type</option>
                      <option value="Building Collapse">Building Collapse</option>
                      <option value="Flood">Flood</option>
                      <option value="Fire">Fire</option>
                      <option value="Medical Emergency">Medical Emergency</option>
                      <option value="Road Accident">Road Accident</option>
                      <option value="Gas Leak">Gas Leak</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input 
                      type="text"
                      name="location"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter incident location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      placeholder="Additional details about the incident..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos *</label>
                    <input 
                      type="file" 
                      name="photos"
                      accept="image/*"
                      multiple
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload one or more photos of the incident</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowIncidentUpload(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                  >
                    Upload Incident
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Hazard Modal */}
        {showHazardReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                Report Hazard
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleHazardReport(formData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hazard Type *</label>
                    <select 
                      name="hazardType"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600"
                    >
                      <option value="">Select hazard type</option>
                      <option value="Structural Damage">Structural Damage</option>
                      <option value="Gas Leak">Gas Leak</option>
                      <option value="Live Wire">Live Wire / Electrical</option>
                      <option value="Chemical Spill">Chemical Spill</option>
                      <option value="Landslide Risk">Landslide Risk</option>
                      <option value="Flood Risk">Flood Risk</option>
                      <option value="Fire Hazard">Fire Hazard</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                    <select 
                      name="severity"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600"
                    >
                      <option value="">Select severity</option>
                      <option value="low">Low - Monitor situation</option>
                      <option value="medium">Medium - Attention needed</option>
                      <option value="high">High - Immediate action required</option>
                      <option value="critical">Critical - Emergency response</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input 
                      type="text"
                      name="location"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600"
                      placeholder="Enter hazard location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      name="description"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600"
                      placeholder="Describe the hazard in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affected Area (Optional)</label>
                    <input 
                      type="text"
                      name="affectedArea"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600"
                      placeholder="e.g., 500m radius, 2 buildings"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      name="requiresImmediate"
                      id="requiresImmediate"
                      className="w-4 h-4"
                    />
                    <label htmlFor="requiresImmediate" className="text-sm font-medium text-gray-700">
                      🚨 Requires immediate evacuation or response
                    </label>
                  </div>

                  {location.latitude && location.longitude && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-xs text-orange-800">
                        <strong>Your Location:</strong> {formatCoordinates(location.latitude, location.longitude)}
                        <br />
                        <span className="text-xs">This will be attached to the hazard report</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowHazardReport(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
                  >
                    Report Hazard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
