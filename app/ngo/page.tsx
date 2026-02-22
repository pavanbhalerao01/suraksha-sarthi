"use client";

import { useState } from "react";
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
  Send
} from "lucide-react";

export default function NGOPortal() {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [deliveryPercentage, setDeliveryPercentage] = useState(100);
  const [deliveryLocation, setDeliveryLocation] = useState('');

  // Mock NGO data
  const ngoData = {
    organizationName: "Maharashtra Relief Foundation",
    registrationNo: "80G/12A-2020-MH",
    contactPerson: "Priya Sharma",
    isVerified: true,
    resourcesContributed: 245,
    peopleHelped: 1850,
    activeContributions: 12
  };

  const contributedResources = [
    {
      id: 1,
      type: "Food Packets",
      quantity: 1000,
      location: "Pune Warehouse",
      status: "delivered",
      allocatedTo: "Sinhagad Road Relief Camp",
      contributedDate: "2 days ago",
      impact: "500 people fed"
    },
    {
      id: 2,
      type: "Medical Supplies",
      quantity: 50,
      location: "Deccan Medical Store",
      status: "allocated",
      allocatedTo: "NDRF Team Alpha",
      contributedDate: "1 day ago",
      impact: "Pending deployment"
    },
    {
      id: 3,
      type: "Blankets",
      quantity: 200,
      location: "Kothrud Office",
      status: "available",
      allocatedTo: null,
      contributedDate: "3 hours ago",
      impact: "Ready for allocation"
    }
  ];

  const coordinationRequests = [
    {
      id: 1,
      type: "Food Supplies",
      requestedBy: "NDRF Command",
      quantity: "500 packets",
      urgency: "high",
      location: "Multiple Relief Camps",
      requestDate: "2 hours ago"
    },
    {
      id: 2,
      type: "Temporary Shelter Material",
      requestedBy: "District Collector",
      quantity: "100 tents",
      urgency: "urgent",
      location: "Flood-affected areas",
      requestDate: "30 min ago"
    }
  ];

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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Contributions</span>
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{ngoData.resourcesContributed}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">People Helped</span>
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{ngoData.peopleHelped.toLocaleString()}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Active Resources</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{ngoData.activeContributions}</div>
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

        {/* Coordination Requests */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl shadow-lg mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Resource Requests from Authorities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coordinationRequests.map((request) => (
              <div key={request.id} className="bg-white bg-opacity-20 backdrop-blur p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{request.type}</h3>
                    <p className="text-orange-100 text-sm">by {request.requestedBy}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    request.urgency === 'urgent' 
                      ? 'bg-red-600' 
                      : 'bg-orange-800'
                  }`}>
                    {request.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <p>📦 Quantity: <strong>{request.quantity}</strong></p>
                  <p>📍 Location: {request.location}</p>
                  <p>🕐 {request.requestDate}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedRequest(request);
                    setDeliveryPercentage(100);
                    setDeliveryLocation('');
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
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contributed Resources */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Your Resource Contributions</h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                {contributedResources.length} Active
              </span>
            </div>
            
            <div className="space-y-4">
              {contributedResources.map((resource) => (
                <div 
                  key={resource.id} 
                  className={`border-l-4 p-4 rounded-lg ${
                    resource.status === 'delivered' 
                      ? 'border-green-600 bg-green-50' 
                      : resource.status === 'allocated'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-orange-600 bg-orange-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{resource.type}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>📦 Qty: <strong>{resource.quantity}</strong></span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {resource.location}
                        </span>
                      </div>
                      {resource.allocatedTo && (
                        <p className="text-sm text-gray-700 mb-1">
                          🎯 Allocated to: <strong>{resource.allocatedTo}</strong>
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-700">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resource.contributedDate}
                        </span>
                        <span>💪 Impact: {resource.impact}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ml-3 ${
                      resource.status === 'delivered'
                        ? 'bg-green-600 text-white'
                        : resource.status === 'allocated'
                        ? 'bg-blue-600 text-white'
                        : 'bg-orange-600 text-white'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                  {resource.status === 'delivered' && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-green-700 text-sm font-medium">
                        ✓ Delivery confirmed • View impact report →
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
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

              <form onSubmit={(e) => {
                e.preventDefault();
                const deliveryAmount = Math.round(parseInt(selectedRequest.quantity) * deliveryPercentage / 100);
                alert(
                  `✅ Response Submitted Successfully!\n\n` +
                  `Resource: ${selectedRequest.type}\n` +
                  `Delivering: ${deliveryAmount} units (${deliveryPercentage}% of requested)\n` +
                  `Delivery Location: ${deliveryLocation}\n\n` +
                  `Your response has been sent to ${selectedRequest.requestedBy}.\n` +
                  `Response ID: RES-${Date.now().toString(36).toUpperCase()}`
                );
                setShowResponseModal(false);
              }} className="space-y-5">
                
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

                {/* Delivery Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Location <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Enter full delivery address"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Provide detailed address including district and landmarks
                  </p>
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
