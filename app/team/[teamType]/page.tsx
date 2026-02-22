"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Radio, 
  MapPin, 
  Navigation,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Camera,
  Upload,
  Power,
  PowerOff,
  Share2,
  Send,
  Ambulance,
  Truck,
  Phone,
  Users,
  Package,
  X,
  ExternalLink,
  User,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useGeolocation, formatCoordinates, shareLocation } from "@/lib/useGeolocation";
import { geocodeLandmark, getLandmarkSuggestions, PUNE_LANDMARKS } from "@/lib/geocoding";

// ── Helper: extract GPS coords from address strings like "GPS: 18.53, 73.86" ──
function parseGpsFromAddress(text: string): { lat: number; lng: number } | null {
  if (!text) return null;
  const m = text.match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

// ── Leaflet route map inside Navigate modal ──
function RouteLeafletMap({ from, to }: { from: { lat: number; lng: number } | null; to: { lat: number; lng: number } }) {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapRef.current) return;
    let mapInstance: any = null;
    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css" as any);
      const container = mapRef.current!;
      if ((container as any)._leaflet_id) (L as any).DomUtil.empty(container);
      const points: [number, number][] = from
        ? [[from.lat, from.lng], [to.lat, to.lng]]
        : [[to.lat, to.lng]];
      mapInstance = (L as any).map(container).fitBounds(points, { padding: [40, 40] });
      (L as any).tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);
      if (from) {
        (L as any).circleMarker([from.lat, from.lng], { radius: 10, color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.9 })
          .bindPopup("Your Location").addTo(mapInstance);
        (L as any).polyline(points, { color: "#2563eb", weight: 3, dashArray: "8 6" }).addTo(mapInstance);
      }
      (L as any).circleMarker([to.lat, to.lng], { radius: 12, color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.9 })
        .bindPopup("Victim Location").addTo(mapInstance);
    });
    return () => { if (mapInstance) mapInstance.remove(); };
  }, [from, to]);
  return <div ref={mapRef} className="w-full h-72 rounded-lg overflow-hidden" />;
}

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
  ambulance: {
    name: "Ambulance Driver",
    color: "emerald",
    skills: ["Emergency Driving", "Patient Transport", "First Aid"],
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
  const trackingId = useRef(`${teamType}_${Math.random().toString(36).substr(2, 9)}`).current;

  // DB assignments (SOS forwarded from admin)
  const [dbAssignments, setDbAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [startingResponseId, setStartingResponseId] = useState<string | null>(null);
  const [showNavigateModal, setShowNavigateModal] = useState(false);
  const [navigateTarget, setNavigateTarget] = useState<any>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedAssignments, setCompletedAssignments] = useState<any[]>([]);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  
  // Medical team specific states
  const [patients, setPatients] = useState([
    { id: 'P001', name: 'Ramesh Kumar', age: 45, condition: 'Cardiac Arrest', triage: 'RED', vitals: 'Critical', location: 'Sinhagad Road', coordinates: { lat: 18.4611, lng: 73.8067 }, time: new Date(Date.now() - 5*60000), status: 'pending', assignedAmbulance: null as string | null, hospital: null as string | null },
    { id: 'P002', name: 'Sunita Patil', age: 32, condition: 'Fracture', triage: 'YELLOW', vitals: 'Stable', location: 'Deccan Area', coordinates: { lat: 18.5074, lng: 73.8077 }, time: new Date(Date.now() - 12*60000), status: 'pending', assignedAmbulance: null as string | null, hospital: null as string | null },
    { id: 'P003', name: 'Akash Desai', age: 28, condition: 'Minor Cuts', triage: 'GREEN', vitals: 'Normal', location: 'FC Road', coordinates: { lat: 18.5196, lng: 73.8553 }, time: new Date(Date.now() - 20*60000), status: 'resolved', assignedAmbulance: null as string | null, hospital: null as string | null },
  ]);

  const [medicalSupplies, setMedicalSupplies] = useState([
    { item: 'Blood Bags (O+)', current: 15, required: 50, unit: 'units', status: 'critical' },
    { item: 'Oxygen Cylinders', current: 8, required: 20, unit: 'units', status: 'low' },
    { item: 'IV Fluids', current: 45, required: 100, unit: 'bags', status: 'medium' },
    { item: 'Emergency Kits', current: 25, required: 30, unit: 'kits', status: 'good' },
    { item: 'Stretchers', current: 12, required: 15, unit: 'units', status: 'good' },
  ]);

  const [ambulances, setAmbulances] = useState([
    { id: 'AMB-01', status: 'available', driver: 'Mahesh Jadhav', location: 'Base Camp', coordinates: { lat: 18.5204, lng: 73.8567 }, fuel: 85, assignedTo: null },
    { id: 'AMB-02', status: 'on-duty', driver: 'Priya Sharma', location: 'En route to Sinhagad Rd', coordinates: { lat: 18.4711, lng: 73.8167 }, fuel: 60, assignedTo: 'P001' },
    { id: 'AMB-03', status: 'available', driver: 'Suresh Naik', location: 'Deccan Station', coordinates: { lat: 18.5167, lng: 73.8422 }, fuel: 45, assignedTo: null },
    { id: 'AMB-04', status: 'maintenance', driver: '-', location: 'Workshop', coordinates: { lat: 18.5314, lng: 73.8446 }, fuel: 0, assignedTo: null },
  ]);

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showMassRegistration, setShowMassRegistration] = useState(false);
  const [showAssignAmbulance, setShowAssignAmbulance] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Location state for emergency registration
  const [landmarkQuery, setLandmarkQuery] = useState('');
  const [landmarkSuggestions, setLandmarkSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Location tracking with geolocation hook
  const { latitude, longitude, accuracy, error, loading, getLocation, ...locationState } = useGeolocation({
    watch: onDuty && teamType !== 'relief-camp', // Continuous tracking when on duty
    enableHighAccuracy: true,
  });

  // Create location object for backward compatibility
  const location = {
    latitude,
    longitude,
    accuracy,
    error,
    loading,
    getLocation,
    ...locationState,
  };

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

  // Medical Dashboard Helper Functions
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const updateMedicalSupply = (index: number, newCurrent: number) => {
    const updated = [...medicalSupplies];
    updated[index] = { ...updated[index], current: newCurrent };
    const percentage = (newCurrent / updated[index].required) * 100;
    updated[index].status = 
      percentage < 30 ? 'critical' :
      percentage < 50 ? 'low' :
      percentage < 80 ? 'medium' : 'good';
    setMedicalSupplies(updated);
  };

  // Location helpers for emergency registration
  const handleLandmarkSearch = async (query: string) => {
    setLandmarkQuery(query);
    if (query.length < 3) {
      setLandmarkSuggestions([]);
      return;
    }
    setIsGeocoding(true);
    const suggestions = await getLandmarkSuggestions(query);
    setLandmarkSuggestions(suggestions);
    setIsGeocoding(false);
  };

  const handleSelectLocation = (lat: number, lng: number, name: string) => {
    setSelectedLocation({ lat, lng, name });
    setLandmarkQuery(name);
    setLandmarkSuggestions([]);
  };

  const handleUseMyLocation = async () => {
    // Request location permission and get current position
    setIsGeocoding(true);
    
    try {
      // Call getLocation to trigger permission request
      await getLocation();
      
      // Wait a bit for the location to be set
      setTimeout(() => {
        if (latitude && longitude) {
          setSelectedLocation({
            lat: latitude,
            lng: longitude,
            name: 'Current GPS Location'
          });
          setLandmarkQuery('Current GPS Location');
          setIsGeocoding(false);
          alert('✓ GPS location captured successfully!');
        } else if (error) {
          setIsGeocoding(false);
          alert(`GPS Error: ${error}\n\nPlease:\n1. Enable location in browser settings\n2. Allow location access when prompted\n3. Or use landmark search instead`);
        } else {
          setIsGeocoding(false);
          alert('⏳ Getting GPS location...\nPlease wait and try again in a moment.');
        }
      }, 1000);
    } catch (err) {
      setIsGeocoding(false);
      alert('Failed to access GPS. Please:\n1. Check browser location permissions\n2. Use landmark search instead');
    }
  };

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Get location from selected landmark or search
    let coordinates = selectedLocation;
    if (!coordinates) {
      const landmark = formData.get('landmark') as string;
      if (!landmark) {
        alert('Please enter a location or landmark');
        return;
      }
      setIsGeocoding(true);
      const result = await geocodeLandmark(landmark);
      setIsGeocoding(false);
      if (!result) {
        alert('Could not find location. Please try a different landmark.');
        return;
      }
      coordinates = { lat: result.lat, lng: result.lng, name: landmark };
    }

    const triage = formData.get('triage') as string;
    const newPatient = {
      id: `P${String(patients.length + 1).padStart(3, '0')}`,
      name: formData.get('name') as string || 'Unknown',
      age: parseInt(formData.get('age') as string || '0'),
      condition: formData.get('condition') as string,
      triage,
      vitals: triage === 'RED' ? 'Critical' : triage === 'YELLOW' ? 'Stable' : 'Normal',
      location: coordinates.name,
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      time: new Date(),
      status: 'pending',
      assignedAmbulance: null as string | null,
      hospital: null as string | null,
    };
    setPatients([newPatient, ...patients]); // Add to beginning (top priority)
    setShowAddPatient(false);
    setSelectedLocation(null);
    setLandmarkQuery('');
    alert(`Patient ${newPatient.name} registered successfully as ${newPatient.triage} priority`);
  };

  const handleMassRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const count = parseInt(formData.get('count') as string);
    const condition = formData.get('condition') as string || 'Multiple Injuries';
    const triage = formData.get('triage') as string;

    // Get location from selected landmark or search
    let coordinates = selectedLocation;
    if (!coordinates) {
      const landmark = formData.get('landmark') as string;
      if (!landmark) {
        alert('Please enter a location or landmark');
        return;
      }
      setIsGeocoding(true);
      const result = await geocodeLandmark(landmark);
      setIsGeocoding(false);
      if (!result) {
        alert('Could not find location. Please try a different landmark.');
        return;
      }
      coordinates = { lat: result.lat, lng: result.lng, name: landmark };
    }

    const newPatients = Array.from({ length: count }, (_, i) => ({
      id: `P${String(patients.length + i + 1).padStart(3, '0')}`,
      name: `Mass Casualty ${i + 1}`,
      age: 0,
      condition,
      triage,
      vitals: triage === 'RED' ? 'Critical' : triage === 'YELLOW' ? 'Stable' : 'Normal',
      location: coordinates.name,
      coordinates: { lat: coordinates.lat, lng: coordinates.lng },
      time: new Date(),
      status: 'pending',
      assignedAmbulance: null as string | null,
      hospital: null as string | null,
    }));

    setPatients([...newPatients, ...patients]);
    setShowMassRegistration(false);
    setSelectedLocation(null);
    setLandmarkQuery('');
    alert(`⚠️ ${count} patients registered at ${coordinates.name}`);
  };

  const handleNavigateToPatient = (patient: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${patient.coordinates.lat},${patient.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleAssignAmbulanceToPatient = (patient: any, ambulanceId: string) => {
    // Update patient
    const updatedPatients = patients.map(p => 
      p.id === patient.id ? { ...p, status: 'assigned', assignedAmbulance: ambulanceId } : p
    );
    setPatients(updatedPatients);

    // Update ambulance
    const updatedAmbulances = ambulances.map(a =>
      a.id === ambulanceId ? { ...a, status: 'on-duty', assignedTo: patient.id } : a
    );
    setAmbulances(updatedAmbulances);

    setShowAssignAmbulance(false);
    alert(`Ambulance ${ambulanceId} assigned to ${patient.name}`);
  };

  const handleTransportToHospital = (patient: any, hospitalName: string) => {
    const updatedPatients = patients.map(p =>
      p.id === patient.id ? { ...p, status: 'transported', hospital: hospitalName } : p
    );
    setPatients(updatedPatients);

    // Free up ambulance if assigned
    if (patient.assignedAmbulance) {
      const updatedAmbulances = ambulances.map(a =>
        a.id === patient.assignedAmbulance ? { ...a, status: 'available', assignedTo: null } : a
      );
      setAmbulances(updatedAmbulances);
    }

    setShowTransportModal(false);
    alert(`Patient ${patient.name} transported to ${hospitalName}`);
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
        <header className="bg-gray-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">{team.name}</h1>
                  <p className="text-gray-400 text-sm">Relief Camp Management Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  disabled
                  className="px-4 py-2 bg-black text-gray-600 rounded-lg text-sm cursor-not-allowed border border-gray-800"
                  title="Command Center unavailable"
                >
                  Command Center
                </button>
                <Link 
                  href="/portal" 
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-800 transition text-sm"
                >
                  Switch Portal
                </Link>
              </div>
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

  // Medical Emergency Team Dashboard
  if (teamType === 'medical') {
    // Hospital data
    const hospitals = [
      { name: 'Ruby Hall Clinic', beds: 5, icu: 2, ventilators: 1, distance: '3.2 km', coordinates: { lat: 18.5314, lng: 73.8446 } },
      { name: 'Sassoon General', beds: 12, icu: 4, ventilators: 2, distance: '5.1 km', coordinates: { lat: 18.4967, lng: 73.8631 } },
      { name: 'KEM Hospital', beds: 8, icu: 3, ventilators: 1, distance: '7.8 km', coordinates: { lat: 18.5075, lng: 73.9220 } },
    ];

    // Sort patients: Pending first (RED > YELLOW > GREEN), then resolved
    const sortedPatients = [...patients].sort((a, b) => {
      // Pending before resolved
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // Within same status, sort by triage (RED > YELLOW > GREEN)
      const triageOrder = { RED: 0, YELLOW: 1, GREEN: 2 };
      if (triageOrder[a.triage as keyof typeof triageOrder] !== triageOrder[b.triage as keyof typeof triageOrder]) {
        return triageOrder[a.triage as keyof typeof triageOrder] - triageOrder[b.triage as keyof typeof triageOrder];
      }
      
      // Within same triage, newer first
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    //Time formatter
    const formatTimeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      if (seconds < 60) return `${seconds} sec ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours} hr ago`;
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gray-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-8 h-8 text-red-400" />
                <div>
                  <h1 className="text-2xl font-bold">Medical Emergency Team</h1>
                  <p className="text-gray-400 text-sm">Emergency Medical Services Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!onDuty ? (
                  <button 
                    onClick={handleDutyToggle}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Power className="w-4 h-4" />
                    Start Duty
                  </button>
                ) : (
                  <button 
                    onClick={handleDutyToggle}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
                  >
                    <PowerOff className="w-4 h-4" />
                    End Duty
                  </button>
                )}
                <button 
                  disabled
                  className="px-4 py-2 bg-black text-gray-600 rounded-lg text-sm cursor-not-allowed border border-gray-800"
                  title="Command Center unavailable"
                >
                  Command Center
                </button>
                <Link 
                  href="/portal" 
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-800 transition text-sm"
                >
                  Switch Portal
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* On Duty Banner */}
        {onDuty && (
          <div className="bg-red-600 text-white py-3">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">MEDICAL TEAM ON DUTY - Emergency Response Active</span>
                {location.latitude && location.longitude && (
                  <span className="text-red-100 text-sm">
                    📍 {formatCoordinates(location.latitude, location.longitude)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Active Patients</span>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{patients.length}</div>
              <div className="text-xs text-red-600 mt-1">{patients.filter(p => p.triage === 'RED').length} Critical</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Ambulances</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{ambulances.filter(a => a.status === 'available').length}/{ambulances.length}</div>
              <div className="text-xs text-green-600 mt-1">Available</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Hospital Beds</span>
                <Radio className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{hospitals.reduce((acc, h) => acc + h.beds, 0)}</div>
              <div className="text-xs text-blue-600 mt-1">Across 3 hospitals</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Avg Response Time</span>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">8 min</div>
              <div className="text-xs text-purple-600 mt-1">Within target</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Triage */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Patient Triage</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">RED: {patients.filter(p => p.triage === 'RED' && p.status === 'pending').length}</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">YELLOW: {patients.filter(p => p.triage === 'YELLOW' && p.status === 'pending').length}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">GREEN: {patients.filter(p => p.triage === 'GREEN' && p.status === 'pending').length}</span>
                    </div>
                    <button
                      onClick={() => setShowAddPatient(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1"
                    >
                      <span>+</span> Add Patient
                    </button>
                    <button
                      onClick={() => setShowMassRegistration(true)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition flex items-center gap-1"
                    >
                      <span>++</span> Mass Registration
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {sortedPatients.map(patient => (
                    <div 
                      key={patient.id}
                      className={`border-l-4 p-4 rounded-lg ${
                        patient.triage === 'RED' ? 'border-red-600 bg-red-50' :
                        patient.triage === 'YELLOW' ? 'border-yellow-600 bg-yellow-50' :
                        'border-green-600 bg-green-50'
                      } ${patient.status !== 'pending' ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              patient.triage === 'RED' ? 'bg-red-600 text-white' :
                              patient.triage === 'YELLOW' ? 'bg-yellow-600 text-white' :
                              'bg-green-600 text-white'
                            }`}>
                              {patient.triage}
                            </span>
                            <span className="font-bold text-gray-900">{patient.id}</span>
                            {patient.age > 0 && <span className="text-gray-600">• {patient.age}y</span>}
                            <span className={`px-2 py-1 rounded text-xs ${
                              patient.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              patient.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                              patient.status === 'transported' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {patient.status.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">{patient.name}</h3>
                          <div className="text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-4">
                              <span>🩺 {patient.condition}</span>
                              <span>💊 Vitals: {patient.vitals}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {patient.location} • {formatTimeAgo(patient.time)}
                              {patient.assignedAmbulance && <span className="ml-2 text-blue-600 font-semibold">🚑 {patient.assignedAmbulance}</span>}
                              {patient.hospital && <span className="ml-2 text-purple-600 font-semibold">🏥 {patient.hospital}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      {patient.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => handleNavigateToPatient(patient)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                          >
                            Navigate
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowAssignAmbulance(true);
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                          >
                            Assign Ambulance
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowTransportModal(true);
                            }}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                          >
                            Transport to Hospital
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {sortedPatients.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No patients registered</p>
                      <button
                        onClick={() => setShowAddPatient(true)}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                      >
                        Add First Patient
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Supplies */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Medical Supply Inventory</h2>
                <div className="space-y-3">
                  {medicalSupplies.map((supply, index) => {
                    const percentage = (supply.current / supply.required) * 100;
                    const statusColor = 
                      supply.status === 'critical' ? 'red' :
                      supply.status === 'low' ? 'orange' :
                      supply.status === 'medium' ? 'yellow' : 'green';
                    
                    return (
                      <div key={supply.item} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{supply.item}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase bg-${statusColor}-100 text-${statusColor}-800`}>
                            {supply.status}
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
                            {supply.current} / {supply.required} {supply.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <label className="text-xs text-gray-600 font-medium">Update Current Stock:</label>
                          <input 
                            type="number" 
                            min="0"
                            max={supply.required}
                            value={supply.current}
                            onChange={(e) => updateMedicalSupply(index, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Ambulance Fleet - LIVE TRACKING */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Ambulance className="w-5 h-5 text-blue-600" />
                    Ambulance Fleet - Live Tracking
                  </h2>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 font-semibold">LIVE</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {ambulances.map(amb => {
                    // Find if this ambulance is assigned to any patient
                    const assignedPatient = patients.find(p => p.assignedAmbulance === amb.id);
                    
                    return (
                      <div key={amb.id} className={`p-4 border-2 rounded-lg ${
                        amb.status === 'on-duty' 
                          ? 'border-blue-400 bg-blue-50' 
                          : amb.status === 'available' 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Ambulance className={`w-5 h-5 ${
                              amb.status === 'on-duty' ? 'text-blue-600' :
                              amb.status === 'available' ? 'text-green-600' :
                              'text-gray-600'
                            }`} />
                            <span className="font-bold text-gray-900">{amb.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              amb.status === 'available' ? 'bg-green-600 text-white' :
                              amb.status === 'on-duty' ? 'bg-blue-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {amb.status === 'on-duty' ? '🚨 ACTIVE' : amb.status === 'available' ? '✓ READY' : 'OFFLINE'}
                            </span>
                            {amb.status === 'on-duty' && (
                              <Navigation className="w-4 h-4 text-blue-600 animate-pulse" />
                            )}
                          </div>
                        </div>

                        {/* Assignment Details */}
                        {assignedPatient && (
                          <div className="mb-3 p-3 bg-white border border-blue-300 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                assignedPatient.triage === 'RED' ? 'bg-red-600 text-white' :
                                assignedPatient.triage === 'YELLOW' ? 'bg-yellow-600 text-white' :
                                'bg-green-600 text-white'
                              }`}>
                                {assignedPatient.triage}
                              </span>
                              <span className="text-sm font-bold text-gray-900">{assignedPatient.name}</span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>🏥 {assignedPatient.condition}</div>
                              <div>📍 {assignedPatient.location}</div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="text-blue-700 font-semibold">Est. Distance:</span>
                                <span className="text-blue-900 font-bold">
                                  {(() => {
                                    // Calculate distance between ambulance current location and patient
                                    const R = 6371;
                                    const dLat = (assignedPatient.coordinates.lat - parseFloat(amb.location.split(',')[0] || '0')) * Math.PI / 180;
                                    const dLng = (assignedPatient.coordinates.lng - parseFloat(amb.location.split(',')[1] || '0')) * Math.PI / 180;
                                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                            Math.cos(parseFloat(amb.location.split(',')[0] || '0') * Math.PI / 180) * Math.cos(assignedPatient.coordinates.lat * Math.PI / 180) *
                                            Math.sin(dLng/2) * Math.sin(dLng/2);
                                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                    const distance = R * c;
                                    return distance > 1 ? `${distance.toFixed(1)} km` : `${(distance * 1000).toFixed(0)} m`;
                                  })()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-blue-700 font-semibold">ETA:</span>
                                <span className="text-blue-900 font-bold">~8 min</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Driver & Vehicle Info */}
                        <div className="text-xs text-gray-700 space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            <span className="font-semibold">{amb.driver}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span className="font-mono text-xs">{amb.location}</span>
                          </div>
                          {amb.status === 'on-duty' && (
                            <div className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-1">
                              🔴 Live GPS tracking active - Location updating every 10s
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span>⛽ Fuel:</span>
                            <div className="flex-1 bg-gray-300 rounded-full h-2">
                              <div className={`h-2 rounded-full ${amb.fuel > 50 ? 'bg-green-600' : amb.fuel > 20 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${amb.fuel}%` }}></div>
                            </div>
                            <span className="font-bold">{amb.fuel}%</span>
                          </div>
                        </div>

                        {/* Quick Actions for This Ambulance */}
                        {amb.status === 'available' && (
                          <div className="mt-3 pt-3 border-t border-gray-300">
                            <button 
                              onClick={() => alert(`${amb.id} is available for assignment.\n\nAssign to a patient from the Patient List above.`)}
                              className="w-full px-3 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition text-xs"
                            >
                              Available for Assignment
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Fleet Summary */}
                <div className="mt-4 pt-4 border-t border-gray-300 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-xl font-bold text-green-700">{ambulances.filter(a => a.status === 'available').length}</div>
                    <div className="text-xs text-green-600">Available</div>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xl font-bold text-blue-700">{ambulances.filter(a => a.status === 'on-duty').length}</div>
                    <div className="text-xs text-blue-600">On Duty</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xl font-bold text-gray-700">{ambulances.filter(a => a.status === 'offline').length}</div>
                    <div className="text-xs text-gray-600">Offline</div>
                  </div>
                </div>
              </div>

              {/* Hospital Bed Availability */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Hospital Bed Availability</h2>
                <div className="space-y-3">
                  {hospitals.map(hospital => (
                    <div key={hospital.name} className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900 mb-2 text-sm">{hospital.name}</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>🛏️ General Beds:</span>
                          <span className="font-bold text-gray-900">{hospital.beds}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🏥 ICU Beds:</span>
                          <span className="font-bold text-gray-900">{hospital.icu}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🫁 Ventilators:</span>
                          <span className="font-bold text-gray-900">{hospital.ventilators}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>📍 Distance:</span>
                          <span className="font-bold text-blue-600">{hospital.distance}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Emergency Actions</h2>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded transition flex items-center gap-2 border border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-800" />
                    <span className="text-sm font-semibold text-red-800">Request Blood Bank</span>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-900" />
                    <span className="text-sm font-semibold text-gray-900">Document Patient</span>
                  </button>
                  <button 
                    onClick={() => setShowMessageModal(true)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 text-gray-900" />
                    <span className="text-sm font-semibold text-gray-900">Contact Command Center</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message to Command Center</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                setShowMessageModal(false);
                alert('Message sent to command center');
              }}>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                  rows={4}
                  placeholder="Enter your message..."
                  required
                ></textarea>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Patient Modal - EMERGENCY SIMPLIFIED */}
        {showAddPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <div className="bg-red-50 border-l-4 border-red-600 p-3 mb-4">
                <h2 className="text-xl font-bold text-red-900">⚡ Quick Patient Registration</h2>
                <p className="text-sm text-red-700">Fill only critical info - location is auto-detected</p>
              </div>
              <form onSubmit={handleAddPatient}>
                <div className="space-y-4">
                  {/* Triage Priority - FIRST (Most Important) */}
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
                    <label className="block text-sm font-bold text-gray-900 mb-2">🚨 Triage Priority *</label>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="cursor-pointer">
                        <input type="radio" name="triage" value="RED" required className="hidden peer" />
                        <div className="px-4 py-3 bg-white border-2 border-gray-300 peer-checked:border-red-600 peer-checked:bg-red-50 rounded-lg text-center font-bold hover:bg-gray-50 transition">
                          🔴 RED<br/><span className="text-xs font-normal">Critical</span>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="triage" value="YELLOW" required className="hidden peer" />
                        <div className="px-4 py-3 bg-white border-2 border-gray-300 peer-checked:border-yellow-600 peer-checked:bg-yellow-50 rounded-lg text-center font-bold hover:bg-gray-50 transition">
                          🟡 YELLOW<br/><span className="text-xs font-normal">Urgent</span>
                        </div>
                      </label>
                      <label className="cursor-pointer">
                        <input type="radio" name="triage" value="GREEN" required className="hidden peer" />
                        <div className="px-4 py-3 bg-white border-2 border-gray-300 peer-checked:border-green-600 peer-checked:bg-green-50 rounded-lg text-center font-bold hover:bg-gray-50 transition">
                          🟢 GREEN<br/><span className="text-xs font-normal">Minor</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Condition *</label>
                    <input 
                      type="text" 
                      name="condition" 
                      required 
                      placeholder="Bleeding, Fracture, Chest Pain, etc." 
                      className="w-full px-3 py-2 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>

                  {/* Name (Optional for speed) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name (Optional)</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="If known" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  {/* Age (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (Optional)</label>
                    <input 
                      type="number" 
                      name="age" 
                      min="0" 
                      max="120" 
                      placeholder="Approximate age" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>

                  {/* Location - SIMPLIFIED */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <label className="block text-sm font-bold text-blue-900 mb-2">📍 Location *</label>
                    
                    {/* Quick Location Button */}
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Use My Current GPS Location (Fastest)
                    </button>

                    <div className="text-center text-gray-500 text-sm mb-2">OR</div>

                    {/* Landmark Search */}
                    <input
                      type="text"
                      name="landmark"
                      value={landmarkQuery}
                      onChange={(e) => handleLandmarkSearch(e.target.value)}
                      placeholder="Type landmark: Sinhagad Road, FC Road, Deccan..."
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                    />

                    {/* Quick Landmark Buttons */}
                    <div className="text-xs text-gray-600 mb-1">Quick Select:</div>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {PUNE_LANDMARKS.slice(0, 6).map(landmark => (
                        <button
                          key={landmark.name}
                          type="button"
                          onClick={() => handleSelectLocation(landmark.lat, landmark.lng, landmark.name)}
                          className="px-2 py-1 bg-white border border-blue-300 rounded text-xs hover:bg-blue-100 transition"
                        >
                          {landmark.name}
                        </button>
                      ))}
                    </div>

                    {/* Suggestions Dropdown */}
                    {landmarkSuggestions.length > 0 && (
                      <div className="mt-2 border border-blue-300 rounded-lg bg-white max-h-40 overflow-y-auto">
                        {landmarkSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(suggestion.lat, suggestion.lng, suggestion.displayName)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-200 text-sm"
                          >
                            📍 {suggestion.displayName}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Location Display */}
                    {selectedLocation && (
                      <div className="mt-2 bg-green-100 border border-green-500 rounded p-2 text-sm">
                        <strong className="text-green-900">✓ Selected:</strong> {selectedLocation.name}
                      </div>
                    )}
                    
                    {isGeocoding && <div className="mt-2 text-blue-600 text-sm">🔍 Searching location...</div>}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setShowAddPatient(false); 
                      setSelectedLocation(null); 
                      setLandmarkQuery(''); 
                    }} 
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isGeocoding}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:bg-gray-400 text-lg"
                  >
                    {isGeocoding ? 'Finding Location...' : '⚡ Register Patient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mass Registration Modal - EMERGENCY ULTRA-FAST */}
        {showMassRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
                <h2 className="text-xl font-bold text-red-900 mb-1">🚨 Mass Casualty - Quick Register</h2>
                <p className="text-sm text-red-700">For building collapse, accidents, flooding with multiple victims</p>
              </div>
              <form onSubmit={handleMassRegistration}>
                <div className="space-y-4">
                  {/* Number + Triage Priority - COMBINED */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Number of Patients *</label>
                      <input 
                        type="number" 
                        name="count" 
                        required 
                        min="1" 
                        max="200" 
                        defaultValue="5"
                        className="w-full px-4 py-3 text-2xl font-bold border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 text-center" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Triage *</label>
                      <select 
                        name="triage" 
                        required 
                        defaultValue="YELLOW"
                        className="w-full px-3 py-3 text-lg font-bold border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value="RED">🔴 RED</option>
                        <option value="YELLOW">🟡 YELLOW</option>
                        <option value="GREEN">🟢 GREEN</option>
                      </select>
                    </div>
                  </div>

                  {/* Condition (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition (Optional)</label>
                    <input 
                      type="text" 
                      name="condition" 
                      placeholder="e.g., Building Collapse, Flood, Accident" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" 
                    />
                  </div>

                  {/* Location - SMART */}
                  <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                    <label className="block text-sm font-bold text-orange-900 mb-2">📍 Incident Location *</label>
                    
                    {/* Quick GPS Button */}
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition flex items-center justify-center gap-2 text-lg"
                    >
                      <MapPin className="w-6 h-6" />
                      📱 I'M AT THE INCIDENT SITE
                    </button>

                    <div className="text-center text-gray-500 text-sm mb-2">OR Enter Landmark</div>

                    {/* Landmark Search */}
                    <input
                      type="text"
                      name="landmark"
                      value={landmarkQuery}
                      onChange={(e) => handleLandmarkSearch(e.target.value)}
                      placeholder="Building name, road, area..."
                      className="w-full px-3 py-2 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 mb-2"
                    />

                    {/* Quick Landmarks */}
                    <div className="grid grid-cols-2 gap-2">
                      {PUNE_LANDMARKS.slice(0, 8).map(landmark => (
                        <button
                          key={landmark.name}
                          type="button"
                          onClick={() => handleSelectLocation(landmark.lat, landmark.lng, landmark.name)}
                          className="px-3 py-2 bg-white border border-orange-300 rounded text-sm hover:bg-orange-100 transition font-semibold"
                        >
                          {landmark.name}
                        </button>
                      ))}
                    </div>

                    {/* Suggestions */}
                    {landmarkSuggestions.length > 0 && (
                      <div className="mt-2 border-2 border-orange-300 rounded-lg bg-white max-h-36 overflow-y-auto">
                        {landmarkSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLocation(suggestion.lat, suggestion.lng, suggestion.displayName)}
                            className="w-full text-left px-3 py-2 hover:bg-orange-50 border-b border-gray-200 text-sm"
                          >
                            📍 {suggestion.displayName}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Badge */}
                    {selectedLocation && (
                      <div className="mt-2 bg-green-100 border-2 border-green-500 rounded p-3 text-sm">
                        <strong className="text-green-900">✓ LOCATION LOCKED:</strong><br/>
                        {selectedLocation.name}
                      </div>
                    )}
                    
                    {isGeocoding && <div className="mt-2 text-orange-600 text-sm font-semibold">🔍 Searching...</div>}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => { 
                      setShowMassRegistration(false); 
                      setSelectedLocation(null); 
                      setLandmarkQuery(''); 
                    }} 
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isGeocoding}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition disabled:bg-gray-400 text-lg flex items-center justify-center gap-2"
                  >
                    {isGeocoding ? '⏳ Locating...' : '🚨 Register All Patients'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Ambulance Modal */}
        {showAssignAmbulance && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Assign Ambulance to {selectedPatient.name}</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Patient Location:</strong> {selectedPatient.location}<br />
                  <strong>Coordinates:</strong> {selectedPatient.coordinates.lat}, {selectedPatient.coordinates.lng}
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ambulances
                  .filter(amb => amb.status === 'available')
                  .map(amb => {
                    const distance = calculateDistance(
                      selectedPatient.coordinates.lat,
                      selectedPatient.coordinates.lng,
                      amb.coordinates.lat,
                      amb.coordinates.lng
                    );
                    return (
                      <div key={amb.id} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-900">{amb.id}</span>
                              <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                                AVAILABLE
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>👨‍⚕️ Driver: {amb.driver}</div>
                              <div>📍 Current Location: {amb.location}</div>
                              <div className="flex items-center gap-2">
                                <span>⛽ Fuel:</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                  <div className={`h-2 rounded-full ${amb.fuel > 50 ? 'bg-green-600' : amb.fuel > 20 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${amb.fuel}%` }}></div>
                                </div>
                                <span>{amb.fuel}%</span>
                              </div>
                              <div className="font-semibold text-blue-600">
                                📏 Distance: {distance.toFixed(2)} km (ETA: ~{Math.ceil(distance * 3)} min)
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignAmbulanceToPatient(selectedPatient, amb.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {ambulances.filter(amb => amb.status === 'available').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No ambulances available at the moment</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignAmbulance(false);
                    setSelectedPatient(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transport to Hospital Modal */}
        {showTransportModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Transport {selectedPatient.name} to Hospital</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-800">
                  <strong>Patient:</strong> {selectedPatient.name} ({selectedPatient.age}y)<br />
                  <strong>Condition:</strong> {selectedPatient.condition}<br />
                  <strong>Triage:</strong> <span className={`px-2 py-1 rounded text-xs font-bold ${selectedPatient.triage === 'RED' ? 'bg-red-600 text-white' : selectedPatient.triage === 'YELLOW' ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}>{selectedPatient.triage}</span>
                </p>
              </div>
              <div className="space-y-3">
                {hospitals.map(hospital => (
                  <div key={hospital.name} className="border border-gray-200 rounded-lg p-4 hover:bg-purple-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-2">{hospital.name}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>🛏️ General: {hospital.beds} beds</div>
                          <div>🏥 ICU: {hospital.icu} beds</div>
                          <div>🫁 Ventilators: {hospital.ventilators}</div>
                          <div className="font-semibold text-purple-600">📍 {hospital.distance}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTransportToHospital(selectedPatient, hospital.name)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                      >
                        Transport
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTransportModal(false);
                    setSelectedPatient(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Ambulance Driver Portal
  if (teamType === 'ambulance') {
    // Find assigned patient from mock data
    const myAmbulanceId = 'AMB-102'; // In real app, this comes from auth/login
    const assignedPatientData = patients.find(p => p.assignedAmbulance === myAmbulanceId);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ambulance className="w-10 h-10 text-white" />
                <div>
                  <h1 className="text-2xl font-bold">Ambulance {myAmbulanceId}</h1>
                  <p className="text-blue-200 text-sm">Emergency Medical Response Unit</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!onDuty ? (
                  <button 
                    onClick={handleDutyToggle}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg"
                  >
                    <Power className="w-5 h-5" />
                    Start Duty
                  </button>
                ) : (
                  <button 
                    onClick={handleDutyToggle}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg"
                  >
                    <Power className="w-5 h-5" />
                    End Duty
                  </button>
                )}
                <Link 
                  href="/portal" 
                  className="px-4 py-2 bg-blue-800 rounded-lg hover:bg-blue-900 transition text-sm"
                >
                  Switch Portal
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Duty Status Banner */}
          {onDuty ? (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-full p-2">
                  <Navigation className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-green-900">ON DUTY - GPS Tracking Active</div>
                  <div className="text-sm text-green-700">Your location is being shared with medical command center</div>
                </div>
                {location && (
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-semibold">LIVE LOCATION</div>
                    <div className="text-sm font-mono text-green-900">
                      {formatCoordinates(location.latitude, location.longitude)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="font-bold text-gray-900">OFF DUTY</div>
                  <div className="text-sm text-gray-600">Click "Start Duty" to begin receiving assignments and enable GPS tracking</div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Vehicle Status
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-semibold mb-1">Fuel Level</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="font-bold text-blue-900">75%</span>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-semibold mb-1">Equipment</div>
                <div className="font-bold text-green-900">✓ All Ready</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-semibold mb-1">Availability</div>
                <div className="font-bold text-purple-900">{assignedPatientData ? 'ASSIGNED' : 'AVAILABLE'}</div>
              </div>
            </div>
          </div>

          {/* Assigned Patient Card */}
          {assignedPatientData ? (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    ACTIVE ASSIGNMENT
                  </h2>
                  <p className="text-sm text-red-700">Immediate response required</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  assignedPatientData.triage === 'RED' ? 'bg-red-600 text-white' :
                  assignedPatientData.triage === 'YELLOW' ? 'bg-yellow-600 text-white' :
                  'bg-green-600 text-white'
                }`}>
                  {assignedPatientData.triage} PRIORITY
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Patient Name</div>
                    <div className="font-bold text-gray-900">{assignedPatientData.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Age</div>
                    <div className="font-bold text-gray-900">{assignedPatientData.age} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Condition</div>
                    <div className="font-bold text-red-600">{assignedPatientData.condition}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Vitals</div>
                    <div className={`font-bold ${
                      assignedPatientData.vitals === 'Critical' ? 'text-red-600' :
                      assignedPatientData.vitals === 'Stable' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{assignedPatientData.vitals}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Location</div>
                    <div className="font-bold text-gray-900">📍 {assignedPatientData.location}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">
                      {assignedPatientData.coordinates.lat}, {assignedPatientData.coordinates.lng}
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-blue-900">Route to Patient</span>
                  </div>
                  {location.latitude && location.longitude && (
                    <span className="text-sm text-blue-700">
                      Est. Distance: {(() => {
                        const R = 6371; // Earth's radius in km
                        const dLat = (assignedPatientData.coordinates.lat - location.latitude) * Math.PI / 180;
                        const dLng = (assignedPatientData.coordinates.lng - location.longitude) * Math.PI / 180;
                        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                                Math.cos(location.latitude * Math.PI / 180) * Math.cos(assignedPatientData.coordinates.lat * Math.PI / 180) *
                                Math.sin(dLng/2) * Math.sin(dLng/2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        const distance = R * c;
                        return distance.toFixed(1);
                      })()}km
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded p-2">
                    <div className="text-gray-600 text-xs">Your Location</div>
                    <div className="font-mono text-xs text-gray-900">
                      {location.latitude ? `${location.latitude.toFixed(4)}, ${location.longitude?.toFixed(4)}` : 'GPS acquiring...'}
                    </div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="text-gray-600 text-xs">Patient Location</div>
                    <div className="font-mono text-xs text-gray-900">
                      {assignedPatientData.coordinates.lat.toFixed(4)}, {assignedPatientData.coordinates.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1${location.latitude ? `&origin=${location.latitude},${location.longitude}` : ''}&destination=${assignedPatientData.coordinates.lat},${assignedPatientData.coordinates.lng}`;
                    window.open(url, '_blank');
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Navigate to Patient
                </button>
                <button
                  onClick={() => alert('Opening communication channel with medical command...')}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Contact Command
                </button>
              </div>

              {/* Cancel Visit Button */}
              <div className="mt-4 pt-4 border-t border-red-200">
                <button
                  onClick={() => {
                    if (confirm(`⚠️ CANCEL VISIT CONFIRMATION\n\nPatient: ${assignedPatientData.name}\nCondition: ${assignedPatientData.condition}\n\nAre you unable to respond to this emergency?\n\nClick OK to cancel and auto-reassign to another ambulance.`)) {
                      // Cancel visit logic
                      alert(`✓ Visit cancelled for ${assignedPatientData.name}\n\n🔄 Auto-reassigning to nearest available ambulance...\n📲 Medical command has been notified\n\n${myAmbulanceId} is now marked as UNAVAILABLE for reassignment.`);
                      
                      // In production: 
                      // 1. Mark ambulance as unavailable
                      // 2. Remove patient assignment
                      // 3. Trigger auto-reassignment algorithm
                      // 4. Notify medical command
                      // 5. Update patient status to "pending reassignment"
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-red-100 hover:text-red-700 hover:border-red-300 border-2 border-gray-300 transition flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  Cancel Visit (Reassign to Another Ambulance)
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Use only if vehicle breakdown, emergency, or unavailable
                </p>
              </div>

              {assignedPatientData.hospital && (
                <div className="mt-4 bg-purple-100 border border-purple-300 rounded-lg p-4">
                  <div className="font-bold text-purple-900 mb-2">🏥 Transport Destination</div>
                  <div className="text-purple-800">{assignedPatientData.hospital}</div>
                  <button
                    onClick={() => {
                      // In real app, get hospital coordinates from database
                      alert(`Navigating to ${assignedPatientData.hospital}...`);
                    }}
                    className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Navigate to Hospital
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Assignment</h3>
              <p className="text-gray-600">
                {onDuty 
                  ? 'You are available and on standby. Waiting for medical command assignment...'
                  : 'Start your duty to receive patient assignments from medical emergency team'}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowMessageModal(true)}
                className="px-4 py-3 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Report Emergency
              </button>
              <button 
                onClick={() => alert('Requesting backup ambulance...')}
                className="px-4 py-3 bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Request Backup
              </button>
              <button 
                onClick={() => alert('Opening equipment checklist...')}
                className="px-4 py-3 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Medical Supplies
              </button>
              <button 
                onClick={() => {
                  if (location && location.latitude && location.longitude) {
                    shareLocation(location.latitude, location.longitude, `Ambulance ${myAmbulanceId} Location`);
                    alert('GPS location shared with command center');
                  } else {
                    alert('Please enable location services');
                  }
                }}
                className="px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Share Location
              </button>
            </div>
          </div>

          {/* Live GPS Tracking Info */}
          {onDuty && location && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
              <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                Live GPS Tracking
              </h2>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">Current Position</div>
                  <div className="font-mono text-sm text-gray-900">
                    Lat: {location.latitude?.toFixed(6) ?? 'N/A'}, Lng: {location.longitude?.toFixed(6) ?? 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Accuracy: ±{location.accuracy?.toFixed(0) ?? 'N/A'}m
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">Tracking Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-green-700">Active - Updating every 10 seconds</span>
                  </div>
                </div>
                <div className="text-xs text-blue-700 bg-blue-100 rounded p-2">
                  ℹ️ Your real-time location is visible to medical command center and helps them coordinate rescue operations efficiently
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message to Command Center</h2>
              <form onSubmit={(e) => { e.preventDefault(); setShowMessageModal(false); alert('Message sent to command center'); }}>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                  rows={5}
                  placeholder="Describe the situation, request assistance, or report status..."
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
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

  // Fetch DB assignments from admin
  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await fetch(`/api/sos/team-assignments?teamType=${teamType}`);
      const data = await res.json();
      if (data.success) setDbAssignments(data.assignments || []);
    } catch { /* ignore */ } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    const interval = setInterval(fetchAssignments, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamType]);

  const handleStartResponse = async (id: string) => {
    setStartingResponseId(id);
    try {
      const res = await fetch(`/api/sos/team-assignments/${id}/start-response`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setDbAssignments(prev => prev.map(a => a.id === id ? { ...a, status: "IN_PROGRESS" } : a));
      } else {
        alert("Failed to start response: " + data.error);
      }
    } catch { alert("Network error."); } finally {
      setStartingResponseId(null);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    setCompletingId(id);
    try {
      const res = await fetch(`/api/sos/team-assignments/${id}/start-response`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        const completed = dbAssignments.find(a => a.id === id);
        if (completed) {
          setCompletedAssignments(prev => [{ ...completed, completedAt: new Date() }, ...prev]);
        }
        setDbAssignments(prev => prev.filter(a => a.id !== id));
      } else {
        alert("Failed to mark completed: " + data.error);
      }
    } catch { alert("Network error."); } finally {
      setCompletingId(null);
    }
  };

  // Regular Field Team Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <p className="text-gray-400 text-sm">Field Operations Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {!onDuty ? (
                <button 
                  onClick={handleDutyToggle}
                  className={`px-6 py-2 bg-white text-${team.color}-600 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2`}
                >
                  <Power className="w-4 h-4" />
                  Start Duty
                </button>
              ) : (
                <button 
                  onClick={handleDutyToggle}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <PowerOff className="w-4 h-4" />
                  End Duty
                </button>
              )}
              <button 
                disabled
                className="px-4 py-2 bg-black text-gray-600 rounded-lg text-sm cursor-not-allowed border border-gray-800"
                title="Command Center unavailable"
              >
                Command Center
              </button>
              <Link 
                href="/portal" 
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-800 transition text-sm"
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
              <span className="text-gray-600 text-sm">Assigned</span>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {dbAssignments.filter(a => a.status !== "IN_PROGRESS").length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Pending response</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">In Progress</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {dbAssignments.filter(a => a.status === "IN_PROGRESS").length}
            </div>
            <div className="text-xs text-blue-400 mt-1">Active responses</div>
          </div>

          <button
            onClick={() => setShowCompletedModal(true)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-left hover:border-green-400 hover:shadow-md transition w-full"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Completed Today</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{completedAssignments.length}</div>
            {completedAssignments.length > 0 && (
              <div className="text-xs text-green-600 mt-1">Click to view ›</div>
            )}
          </button>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">People Helped</span>
              <Radio className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{completedAssignments.reduce((sum, a) => sum + (a.injuredCount || 0) + (a.affectedFamilies || 0), 0) || completedAssignments.length * 3 || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Est. from completed</div>
          </div>
        </div>

        {/* ━━━━━ Live SOS Assignments from Admin ━━━━━ */}
        {dbAssignments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                🚨 Live SOS Assignments ({dbAssignments.length})
              </h2>
              <button onClick={() => fetchAssignments()} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            <div className="space-y-4">
              {dbAssignments.map((a) => {
                const isInProgress = a.status === "IN_PROGRESS";
                return (
                  <div key={a.id} className={`border-l-4 p-4 rounded-lg ${
                    a.severity === "CRITICAL" ? "border-red-600 bg-red-50" :
                    a.severity === "HIGH" ? "border-orange-500 bg-orange-50" :
                    "border-yellow-500 bg-yellow-50"
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            a.severity === "CRITICAL" ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                          }`}>{a.severity}</span>
                          <span className="text-xs font-mono text-gray-500">{a.sosId}</span>
                          {isInProgress && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">IN PROGRESS</span>}
                        </div>
                        <h3 className="font-bold text-gray-900">{a.title}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{a.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.address}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.reporterName} • {a.reporterPhone}</span>
                        </div>
                        {(a.injuredCount > 0 || a.affectedFamilies > 0) && (
                          <div className="flex gap-3 text-xs text-gray-600 mt-1">
                            {a.injuredCount > 0 && <span>🤕 {a.injuredCount} injured</span>}
                            {a.affectedFamilies > 0 && <span>👨‍👩‍👧 {a.affectedFamilies} families</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          const victimLat = a.lat ? Number(a.lat) : (parseGpsFromAddress(a.address)?.lat ?? null);
                          const victimLng = a.lng ? Number(a.lng) : (parseGpsFromAddress(a.address)?.lng ?? null);
                          setNavigateTarget({ ...a, resolvedLat: victimLat, resolvedLng: victimLng });
                          setShowNavigateModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        <Navigation className="w-4 h-4" /> Navigate
                      </button>
                      {isInProgress ? (
                        <button
                          onClick={() => handleMarkCompleted(a.id)}
                          disabled={completingId === a.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {completingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Mark as Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartResponse(a.id)}
                          disabled={startingResponseId === a.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                        >
                          {startingResponseId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Start Response
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {loadingAssignments && dbAssignments.length === 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading assignments...
          </div>
        )}

        {/* Team Info & Side Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg text-white border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5" />
                <h2 className="text-lg font-bold">Command Center</h2>
              </div>
              <p className="text-gray-300 mb-4 text-sm">
                Direct communication with coordination team
              </p>
              <button 
                onClick={() => setShowMessageModal(true)}
                className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
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
                  <Camera className="w-4 h-4 text-gray-900" />
                  <span className="text-sm font-semibold text-gray-900">Upload Incident Photo</span>
                </button>
                <button 
                  onClick={() => setShowResourceRequest(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-gray-900" />
                  <span className="text-sm font-semibold text-gray-900">Request Resources</span>
                </button>
                <button 
                  onClick={() => setShowHazardReport(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded transition flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-gray-900" />
                  <span className="text-sm font-semibold text-gray-900">Report Hazard</span>
                </button>
              </div>
            </div>
        </div>

        {/* Completed Tasks Modal */}
        {showCompletedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Completed Tasks Today
                </h2>
                <button
                  onClick={() => setShowCompletedModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {completedAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No completed tasks yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Completed assignments will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedAssignments.map((a) => (
                    <div key={a.id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-mono text-gray-500">{a.sosId}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            a.severity === "CRITICAL" ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                          }`}>{a.severity}</span>
                        </div>
                        <span className="text-xs text-green-700 font-medium">
                          ✓ Completed {a.completedAt ? new Date(a.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{a.title}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{a.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.address}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.reporterName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={() => setShowCompletedModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODALS FOR ACTION TEAMS */}

        {/* Navigate Modal */}
        {showNavigateModal && navigateTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-5 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Navigation className="w-5 h-5" /> Navigate to Victim
                  </h3>
                  <p className="text-blue-200 text-sm mt-0.5">
                    {navigateTarget.resolvedLat && navigateTarget.resolvedLng
                      ? `Coords: ${navigateTarget.resolvedLat.toFixed(5)}, ${navigateTarget.resolvedLng.toFixed(5)}`
                      : navigateTarget.address}
                  </p>
                </div>
                <button onClick={() => setShowNavigateModal(false)} className="p-1.5 hover:bg-blue-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {navigateTarget.resolvedLat && navigateTarget.resolvedLng ? (
                  <RouteLeafletMap
                    from={latitude && longitude ? { lat: latitude, lng: longitude } : null}
                    to={{ lat: navigateTarget.resolvedLat, lng: navigateTarget.resolvedLng }}
                  />
                ) : (
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                    GPS coordinates not available for this SOS
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-semibold text-gray-800">{navigateTarget.title}</p>
                  <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{navigateTarget.address}</p>
                  <p className="text-gray-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{navigateTarget.reporterName} • {navigateTarget.reporterPhone}</p>
                </div>
                {navigateTarget.resolvedLat && navigateTarget.resolvedLng && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${navigateTarget.resolvedLat},${navigateTarget.resolvedLng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                  >
                    <ExternalLink className="w-4 h-4" /> Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

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
