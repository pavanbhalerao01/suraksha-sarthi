"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Star,
  Award,
  AlertCircle,
  Navigation,
  Shield,
  LogIn,
  LogOut,
  FileText
} from "lucide-react";

export default function VolunteerPortal() {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  // Mock volunteer data
  const volunteerData = {
    name: "Rajesh Kumar",
    status: "verified",
    skills: ["First Aid", "Swimming", "Driving"],
    tasksCompleted: 12,
    hoursServed: 48,
    rating: 4.8,
    verifiedBy: "Pune Ward Office 15"
  };

  const availableTasks = [
    {
      id: 1,
      title: "Food Distribution at Relief Camp",
      location: "Sinhagad Road Relief Camp",
      priority: "high",
      distance: "2.3 km",
      requiredSkills: ["Driving"],
      estimatedHours: 3,
      peopleAffected: 150
    },
    {
      id: 2,
      title: "Medical Assistance Required",
      location: "Deccan Area",
      priority: "urgent",
      distance: "4.1 km",
      requiredSkills: ["First Aid"],
      estimatedHours: 2,
      peopleAffected: 25
    },
    {
      id: 3,
      title: "Rescue Support - Flooded Area",
      location: "Kothrud Riverbank",
      priority: "urgent",
      distance: "5.8 km",
      requiredSkills: ["Swimming", "First Aid"],
      estimatedHours: 4,
      peopleAffected: 30
    }
  ];

  const handleCheckIn = () => {
    setIsOnDuty(true);
    alert("✓ Check-in successful!\n\nYou are now ON DUTY and visible to coordination teams.\n\nYour GPS location will be tracked for safety.");
  };

  const handleCheckOut = () => {
    setIsOnDuty(false);
    alert("✓ Check-out successful!\n\nThank you for your service!\n\nYour hours have been logged.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Volunteer Portal</h1>
                <p className="text-green-200 text-sm">
                  {volunteerData.status === 'verified' 
                    ? `✓ Verified by ${volunteerData.verifiedBy}` 
                    : '⏳ Verification Pending'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
                {!isOnDuty ? (
                  <button 
                    onClick={handleCheckIn}
                    className="px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Check In
                  </button>
                ) : (
                  <button 
                    onClick={handleCheckOut}
                    className="px-6 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Check Out
                  </button>
                )}
                <Link 
                  href="/portal" 
                  className="px-4 py-2 bg-green-700 rounded-lg hover:bg-green-800 transition text-sm"
                >
                  Switch Portal
                </Link>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/volunteer/auth/login";
                  }}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-sm text-white"
                >
                  Logout
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* On Duty Status Banner */}
      {isOnDuty && (
        <div className="bg-green-600 text-white py-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">You are ON DUTY - GPS tracking active</span>
            </div>
            <span className="text-green-100 text-sm">Safety geofencing enabled</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Tasks Completed</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{volunteerData.tasksCompleted}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Hours Served</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{volunteerData.hoursServed}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Rating</span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{volunteerData.rating}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Status</span>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-600">Verified</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Tasks */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Available Tasks (Matched to Your Skills)</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {availableTasks.length} Tasks
              </span>
            </div>
            
            <div className="space-y-4">
              {availableTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`border-l-4 p-4 rounded-lg ${
                    task.priority === 'urgent' 
                      ? 'border-red-600 bg-red-50' 
                      : task.priority === 'high'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-blue-600 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {task.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          {task.distance}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {task.requiredSkills.map((skill) => (
                          <span 
                            key={skill}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>⏱️ Est. {task.estimatedHours}h</span>
                        <span>👥 {task.peopleAffected} people affected</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      task.priority === 'urgent'
                        ? 'bg-red-600 text-white'
                        : task.priority === 'high'
                        ? 'bg-orange-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <button className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                    Accept Task
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Profile & Skills */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Profile</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">Name</span>
                  <p className="font-semibold text-gray-900">{volunteerData.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Verification Status</span>
                  <p className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{volunteerData.verifiedBy}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Skills</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {volunteerData.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl shadow-sm border border-yellow-200">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Top Volunteer</p>
                    <p className="text-xs text-gray-600">50+ hours served</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    💙
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">First Responder</p>
                    <p className="text-xs text-gray-600">First to accept 10 tasks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Resources */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Training</h2>
              </div>
              <div className="space-y-2 text-sm">
                <a href="#" className="block p-2 hover:bg-gray-50 rounded transition">
                  📖 First Aid Manual
                </a>
                <a href="#" className="block p-2 hover:bg-gray-50 rounded transition">
                  🎥 Disaster Response Video
                </a>
                <a href="#" className="block p-2 hover:bg-gray-50 rounded transition">
                  ✅ Safety Protocols Checklist
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form (if not registered) */}
        {showRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Volunteer Registration</h2>
              <form className="space-y-4">
                <input 
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input 
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input 
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Select Ward/Area</option>
                  <option>Ward 15 - Sinhagad Road</option>
                  <option>Ward 8 - Deccan</option>
                  <option>Ward 12 - Kothrud</option>
                </select>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (Select all that apply)
                  </label>
                  <div className="space-y-2">
                    {["First Aid", "Swimming", "Driving", "Medical", "Cooking", "Language Translation"].map((skill) => (
                      <label key={skill} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Submit Registration
                </button>
                <button 
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
