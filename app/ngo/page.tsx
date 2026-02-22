"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  TrendingUp, 
  MapPin, 
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  FileText,
  Upload,
  Truck,
  Heart,
  X,
  Send,
  Navigation2,
  Locate
} from "lucide-react";

export default function NGOPortal() {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [deliveryPercentage, setDeliveryPercentage] = useState(100);
  const [deliveryMethod, setDeliveryMethod] = useState<'deliver' | 'pickup'>('deliver');
  const [selectedCamp, setSelectedCamp] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Real-time data from API
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [ongoingContributions, setOngoingContributions] = useState<any[]>([]);
  const [contributionHistory, setContributionHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalContributions: 0,
    peopleHelped: 0,
    ongoingContributions: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock NGO ID - in production, get from auth session
  const ngoId = "ngo-demo-001";

  // Relief camps data
  const reliefCamps = [
    { id: 1, name: "Sinhagad Road Relief Camp", address: "Sinhagad Road, Pune", coords: "18.4574,73.8574" },
    { id: 2, name: "Deccan Gymkhana Camp", address: "Fergusson College Road, Pune", coords: "18.5204,73.8567" },
    { id: 3, name: "Kothrud Emergency Center", address: "Paud Road, Kothrud, Pune", coords: "18.5074,73.8077" },
    { id: 4, name: "Hadapsar Relief Station", address: "Hadapsar, Pune", coords: "18.5089,73.9260" },
    { id: 5, name: "Wakad Disaster Hub", address: "Wakad, Pimpri-Chinchwad", coords: "18.5979,73.7624" },
  ];

  // Mock NGO data
  const ngoData = {
    organizationName: "Maharashtra Relief Foundation",
    registrationNo: "80G/12A-2020-MH",
    contactPerson: "Priya Sharma",
    isVerified: true,
  };

  // Fetch pending requests from API
  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/resources/requests?status=pending');
      const data = await response.json();
      if (data.success) {
        setPendingRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Fetch NGO contributions
  const fetchContributions = async () => {
    try {
      const response = await fetch(`/api/ngo/contributions?ngoId=${ngoId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setOngoingContributions(data.ongoing);
        setContributionHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPendingRequests(), fetchContributions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Real-time polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingRequests();
      fetchContributions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle response submission
  const handleConfirmResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let locationInfo = '';
      if (deliveryMethod === 'deliver') {
        const camp = reliefCamps.find(c => c.id.toString() === selectedCamp);
        if (!camp) {
          alert('Please select a relief camp');
          return;
        }
        locationInfo = camp.name;
      } else {
        if (!userLocation) {
          alert('Please grant location access');
          return;
        }
        locationInfo = `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
      }

      const response = await fetch('/api/resources/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          ngoId,
          deliveryPercentage,
          deliveryMethod,
          deliveryLocation: locationInfo,
          estimatedDeliveryTime: '2-4 hours', // Can be made dynamic
          notes: `${deliveryPercentage}% of requested quantity will be delivered`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(
          `✅ Response Submitted Successfully!\n\n` +
          `Resource: ${selectedRequest.resourceType}\n` +
          `Delivering: ${deliveryPercentage}% of requested quantity\n` +
          `${deliveryMethod === 'deliver' ? `To: ${locationInfo}` : `Pickup from: ${locationInfo}`}\n\n` +
          `Your response has been sent to ${selectedRequest.requestedBy}.`
        );
        
        // Refresh data immediately
        await Promise.all([fetchPendingRequests(), fetchContributions()]);
        setShowResponseModal(false);
      } else {
        alert('Failed to submit response. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response. Please try again.');
    }
  };

  const handleGrantLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          alert(`✅ Location Granted!\nLat: ${position.coords.latitude.toFixed(6)}\nLng: ${position.coords.longitude.toFixed(6)}`);
        },
        (error) => {
          alert('❌ Failed to get location. Please enable location services.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      alert('❌ Geolocation is not supported by your browser');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">NGO Resource Portal</h1>
                <p className="text-orange-200 text-sm">
                  {ngoData.organizationName}
                  {ngoData.isVerified && " ✓ Verified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowDonationForm(true)}
                className="px-6 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Contribute Resources
              </button>
              <Link 
                href="/portal" 
                className="px-4 py-2 bg-orange-700 rounded-lg hover:bg-orange-800 transition text-sm"
              >
                Switch Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-blue-800 font-medium">🔄 Loading live data from database...</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Contributions</span>
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalContributions}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">People Helped</span>
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{Math.round(stats.peopleHelped).toLocaleString()}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Ongoing Contributions</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.ongoingContributions}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Verification</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-600">Verified</div>
            <div className="text-xs text-gray-700 mt-1">{ngoData.registrationNo}</div>
          </div>
        </div>

        {/* Coordination Requests - LIVE */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl shadow-lg mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Resource Requests from Authorities</h2>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
          
          {pendingRequests.length === 0 ? (
            <div className="bg-white bg-opacity-20 backdrop-blur p-6 rounded-lg text-center">
              <p className="text-lg">✅ No pending requests at the moment</p>
              <p className="text-sm text-orange-100 mt-2">New requests will appear here in real-time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white bg-opacity-20 backdrop-blur p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{request.resourceType}</h3>
                      <p className="text-orange-100 text-sm">by {request.requestedBy}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      request.urgency === 'urgent' 
                        ? 'bg-red-600' 
                        : request.urgency === 'high'
                        ? 'bg-orange-800'
                        : 'bg-orange-600'
                    }`}>
                      {request.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <p>📦 Quantity: <strong>{request.quantity}</strong></p>
                    <p>📍 Location: {request.location}</p>
                    <p>🕐 {getTimeAgo(request.createdAt)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedRequest(request);
                      setDeliveryPercentage(100);
                      setDeliveryMethod('deliver');
                      setSelectedCamp('');
                      setUserLocation(null);
                      setShowResponseModal(true);
                    }}
                    className="w-full px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Respond to Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ongoing Contributions */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Ongoing Contributions</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {ongoingContributions.length} Active
              </span>
            </div>
            
            {ongoingContributions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No ongoing contributions</p>
                <p className="text-sm mt-1">Respond to requests above to start helping!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ongoingContributions.map((contribution) => (
                  <div 
                    key={contribution.id} 
                    className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{contribution.resourceType}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>📦 Qty: <strong>{contribution.quantity}</strong></span>
                          <span>✅ Delivering: <strong>{contribution.deliveryPercentage}%</strong></span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          {contribution.deliveryMethod === 'deliver' ? '🚚' : '📍'} {contribution.deliveryLocation}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          🏢 Requested by: <strong>{contribution.requestedBy}</strong>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Responded {getTimeAgo(contribution.respondedAt)}
                          </span>
                          <span>⏱️ ETA: {contribution.estimatedDeliveryTime}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase ml-3 bg-blue-600 text-white">
                        IN PROGRESS
                      </span>
                    </div>
                    {contribution.notes && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-blue-700 text-sm">📝 {contribution.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Contribution History */}
            {contributionHistory.length > 0 && (
              <>
                <div className="flex items-center justify-between mt-8 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Contribution History</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {contributionHistory.length} Completed
                  </span>
                </div>
                
                <div className="space-y-3">
                  {contributionHistory.slice(0, 5).map((contribution) => (
                    <div 
                      key={contribution.id} 
                      className="border-l-4 border-green-600 bg-green-50 p-3 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">{contribution.resourceType}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>📦 {contribution.quantity}</span>
                            <span>✅ {contribution.deliveryPercentage}%</span>
                            <span>{contribution.deliveryLocation}</span>
                          </div>
                        </div>
                        <span className="text-xs text-green-700 font-medium">
                          ✓ {getTimeAgo(contribution.fulfilledAt || contribution.respondedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Impact Dashboard & Quick Actions */}
          <div className="space-y-6">
            {/* Impact Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-sm border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Impact This Month</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Food Distributed</span>
                  <span className="font-bold text-gray-900">5,000 meals</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Medical Kits</span>
                  <span className="font-bold text-gray-900">150 units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Shelter Materials</span>
                  <span className="font-bold text-gray-900">80 families</span>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold text-sm">35% increase from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Profile */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Organization Profile</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">Organization</span>
                  <p className="font-semibold text-gray-900">{ngoData.organizationName}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Registration No.</span>
                  <p className="font-semibold text-gray-900">{ngoData.registrationNo}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Contact Person</span>
                  <p className="font-semibold text-gray-900">{ngoData.contactPerson}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Verification Status</span>
                  <p className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Verified by NDMA
                  </p>
                </div>
                <button className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Reports */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">Reports</h2>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition text-sm">
                  📊 Monthly Impact Report
                </button>
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition text-sm">
                  🚚 Resource Tracking Report
                </button>
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded transition text-sm">
                  💰 Transparency Certificate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Response to Request Modal */}
        {showResponseModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Respond to Request</h2>
                <button 
                  onClick={() => setShowResponseModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Request Details */}
              <div className="bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-2">{selectedRequest.type}</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>📦 Requested: <strong>{selectedRequest.quantity}</strong></p>
                  <p>🏢 By: <strong>{selectedRequest.requestedBy}</strong></p>
                  <p>📍 Target: {selectedRequest.location}</p>
                  <p className={`inline-block px-2 py-1 rounded text-xs font-bold mt-2 ${
                    selectedRequest.urgency === 'urgent' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-200 text-orange-900'
                  }`}>
                    {selectedRequest.urgency.toUpperCase()} PRIORITY
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmResponse} className="space-y-5">
                
                {/* Delivery Percentage Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How much can you deliver?
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-orange-600">{deliveryPercentage}%</span>
                      <span className="text-sm text-gray-600">
                        ≈ {Math.round(parseInt(selectedRequest.quantity) * deliveryPercentage / 100)} units
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      value={deliveryPercentage}
                      onChange={(e) => setDeliveryPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      style={{
                        background: `linear-gradient(to right, #ea580c 0%, #ea580c ${deliveryPercentage}%, #e5e7eb ${deliveryPercentage}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Delivery Method <span className="text-red-600">*</span>
                  </label>
                  
                  {/* Radio Options */}
                  <div className="space-y-3">
                    {/* Option 1: Deliver to Camp */}
                    <div 
                      onClick={() => setDeliveryMethod('deliver')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        deliveryMethod === 'deliver' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          name="deliveryMethod" 
                          value="deliver"
                          checked={deliveryMethod === 'deliver'}
                          onChange={(e) => e.target.checked && setDeliveryMethod('deliver')}
                          className="mt-1 w-4 h-4 text-orange-600 accent-orange-600"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">I will deliver to relief camp</div>
                          <p className="text-sm text-gray-600 mb-3">Select destination camp and get directions</p>
                          
                          {deliveryMethod === 'deliver' && (
                            <div className="space-y-2">
                              <select 
                                value={selectedCamp}
                                onChange={(e) => setSelectedCamp(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                required={deliveryMethod === 'deliver'}
                              >
                                <option value="">Select Relief Camp</option>
                                {reliefCamps.map(camp => (
                                  <option key={camp.id} value={camp.id}>
                                    {camp.name} - {camp.address}
                                  </option>
                                ))}
                              </select>
                              
                              {selectedCamp && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const camp = reliefCamps.find(c => c.id.toString() === selectedCamp);
                                    if (camp) {
                                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${camp.coords}`, '_blank');
                                    }
                                  }}
                                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                                >
                                  <Navigation2 className="w-4 h-4" />
                                  Open in Google Maps
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Request Pickup */}
                    <div 
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        deliveryMethod === 'pickup' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          name="deliveryMethod" 
                          value="pickup"
                          checked={deliveryMethod === 'pickup'}
                          onChange={(e) => e.target.checked && setDeliveryMethod('pickup')}
                          className="mt-1 w-4 h-4 text-orange-600 accent-orange-600"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">Request logistics team to pick up</div>
                          <p className="text-sm text-gray-600 mb-3">Grant your location for pickup coordination</p>
                          
                          {deliveryMethod === 'pickup' && (
                            <button
                              type="button"
                              onClick={handleGrantLocation}
                              className={`w-full px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm ${
                                userLocation 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-orange-600 text-white hover:bg-orange-700'
                              }`}
                            >
                              <Locate className="w-4 h-4" />
                              {userLocation 
                                ? `✓ Location Granted (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` 
                                : 'Grant Location Access'
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Time
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  >
                    <option value="">Select timeframe</option>
                    <option value="immediate">Within 2 hours (Immediate)</option>
                    <option value="today">Within today</option>
                    <option value="tomorrow">By tomorrow</option>
                    <option value="2-3days">2-3 days</option>
                    <option value="week">Within a week</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    rows={3}
                    placeholder="Any special conditions, vehicle details, contact person..."
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2"
                  >
                    <Truck className="w-5 h-5" />
                    Confirm Response
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Donation Form Modal */}
        {showDonationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contribute Resources</h2>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                alert("✓ Resource contribution submitted!\n\nThank you for your generosity.\n\nContribution ID: RES-2025-" + Math.random().toString(36).substr(2, 9).toUpperCase());
                setShowDonationForm(false);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resource Type
                  </label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option>Food Supplies (Meals/Packets)</option>
                    <option>Medical Supplies</option>
                    <option>Blankets & Clothing</option>
                    <option>Shelter Materials (Tents, Tarpaulin)</option>
                    <option>Water & Sanitation</option>
                    <option>Vehicles (Ambulance, Trucks)</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                      <option>Packets</option>
                      <option>Units</option>
                      <option>Liters</option>
                      <option>Kgs</option>
                      <option>Pieces</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Location
                  </label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Warehouse address or storage location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date (if applicable)
                  </label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transportation Available?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="transport" value="yes" />
                      <span className="text-sm">Yes, we can deliver</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="transport" value="no" />
                      <span className="text-sm">No, pickup needed</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="Any special handling instructions or conditions..."
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                  >
                    Submit Contribution
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowDonationForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
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
