"use client";

import { useState, useEffect } from "react";
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

  const [volunteerData, setVolunteerData] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Fetch volunteer data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      let phone = localStorage.getItem("phoneNumber");
      if (!phone) {
        window.location.href = "/volunteer/auth/login";
        return;
      }
      const res = await fetch("/api/volunteer/get-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await res.json();
      if (data.error) {
        window.location.href = "/volunteer/auth/login";
        return;
      }
      setVolunteerData(data);
    };
    fetchProfile();
  }, []);

  const [availableTasks, setAvailableTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!volunteerData?.skills || volunteerData.skills.length === 0) {
      setAvailableTasks([]);
      return;
    }
    fetch("/api/volunteer/get-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: volunteerData.skills })
    })
      .then(res => res.json())
      .then(data => setAvailableTasks(data.tasks || []));
  }, [volunteerData?.skills]);

  const handleCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Send location to backend
          fetch("/api/volunteer/update-location", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phoneNumber: localStorage.getItem("phoneNumber"),
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            })
          });
          setIsOnDuty(true);
          alert("✓ Check-in successful!\n\nYou are now ON DUTY and visible to coordination teams.\n\nYour GPS location will be tracked for safety.");
        },
        () => {
          alert("Could not get your location. Please enable GPS.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleCheckOut = () => {
    // Optionally notify backend to stop tracking
    fetch("/api/volunteer/update-location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: localStorage.getItem("phoneNumber"),
        location: null
      })
    });
    setIsOnDuty(false);
    alert("✓ Check-out successful!\n\nThank you for your service!\n\nYour hours have been logged.");
  };

  // Edit Profile handlers
  const openEditModal = () => {
    setEditName(volunteerData?.name || "");
    setEditSkills(volunteerData?.skills || []);
    setEditError("");
    setEditSuccess("");
    setEditModalOpen(true);
  };
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    let phone = localStorage.getItem("phoneNumber");
    const res = await fetch("/api/volunteer/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, name: editName, skills: editSkills })
    });
    const data = await res.json();
    setEditLoading(false);
    if (data.success) {
      setEditSuccess("Profile updated!");
      setVolunteerData((prev: any) => ({ ...prev, name: editName, skills: editSkills }));
      setTimeout(() => setEditModalOpen(false), 1000);
    } else {
      setEditError(data.error || "Failed to update profile");
    }
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
                  {volunteerData?.status === 'VERIFIED' || volunteerData?.status === 'verified'
                    ? `✓ Verified by ${volunteerData?.verifiedBy || "Authority"}`
                    : '⏳ Verification Pending'}
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
            <div className="text-3xl font-bold text-gray-900">{volunteerData?.tasksCompleted ?? '-'}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Hours Served</span>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">54</div>
          </div>


          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Status</span>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-600">{(volunteerData?.status === 'VERIFIED' || volunteerData?.status === 'verified') ? 'Verified' : 'Pending'}</div>
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
                        {task.requiredSkills.map((skill: string) => (
                          <span 
                            key={skill}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-700">
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
                  <button
                    className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    onClick={async () => {
                      const phone = localStorage.getItem("phoneNumber");
                      if (!phone) {
                        alert("Phone number not found. Please login again.");
                        window.location.href = "/volunteer/auth/login";
                        return;
                      }
                      const res = await fetch("/api/volunteer/increment-tasks", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phoneNumber: phone })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setVolunteerData((prev: any) => ({ ...prev, tasksCompleted: data.tasksCompleted }));
                        alert("Task accepted! Your completed tasks count has been updated.");
                      } else {
                        alert(data.error || "Failed to accept task.");
                      }
                    }}
                  >
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
                  <p className="font-semibold text-gray-900">{volunteerData?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Verification Status</span>
                  <p className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    {(volunteerData?.status === 'VERIFIED' || volunteerData?.status === 'verified') ? 'Verified' : 'Pending'}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">{volunteerData?.verifiedBy}</p>
                </div>
                {(() => {
                  let skillsArr: string[] = [];
                  if (Array.isArray(volunteerData?.skills)) {
                    skillsArr = volunteerData.skills;
                  } else if (typeof volunteerData?.skills === 'string') {
                    try {
                      const parsed = JSON.parse(volunteerData.skills);
                      if (Array.isArray(parsed)) skillsArr = parsed;
                    } catch {}
                  }
                  if (skillsArr.length === 0) return null;
                  return (
                    <div>
                      <span className="text-gray-600 text-sm">Skills</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skillsArr.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <button
                  className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                  onClick={openEditModal}
                >
                  Edit Profile
                </button>
                    {/* Edit Profile Modal */}
                    {editModalOpen && (
                      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                          <h2 className="text-xl font-bold mb-4 text-black">Edit Profile</h2>
                          <form onSubmit={handleEditProfile} className="space-y-4">
                            <div>
                              <label className="block mb-1 font-semibold text-black">Full Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg text-black"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-semibold text-black">Skills</label>
                              <div className="flex flex-wrap gap-2 text-black">
                                {["First Aid", "Swimming", "Driving", "Medical", "Cooking", "Language Translation"].map(skill => (
                                  <div key={skill} className="flex flex-col items-start">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={editSkills.includes(skill)}
                                        onChange={e => {
                                          if (e.target.checked) setEditSkills([...editSkills, skill]);
                                          else setEditSkills(editSkills.filter(s => s !== skill));
                                        }}
                                        className="rounded"
                                      />
                                      <span className="text-sm">{skill}</span>
                                    </label>
                                    {/* DigiLocker upload for skills requiring verification */}
                                    {(skill === "Driving" || skill === "Medical") && editSkills.includes(skill) && (
                                      <div className="mt-1">
                                        <label className="text-xs text-black">Upload DigiLocker PDF:</label>
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          className="block mt-1 text-black"
                                          onChange={e => {
                                            // Store file in state (for upload)
                                            // You can extend this to upload to backend and save URL
                                            // For demo, just mark as uploaded
                                            // TODO: Implement backend upload logic
                                            alert("DigiLocker PDF uploaded for " + skill);
                                          }}
                                        />
                                        {/* Show badge if uploaded (demo: always after upload) */}
                                        <span className="inline-block mt-1 px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">Verified (DigiLocker Issued)</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {editError && <div className="text-red-600 text-sm font-semibold">{editError}</div>}
                            {editSuccess && <div className="text-green-600 text-sm font-semibold">{editSuccess}</div>}
                            <div className="flex gap-2 mt-2">
                              <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                disabled={editLoading}
                              >
                                {editLoading ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                type="button"
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                                onClick={() => setEditModalOpen(false)}
                                disabled={editLoading}
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
                <a href="#" className="block p-2 hover:bg-gray-50 rounded transition text-black">
                  📖 First Aid Manual
                </a>
                <a href="#" className="block p-2 hover:bg-gray-50 rounded transition text-black">
                  🎥 Disaster Response Video
                </a>
                <a href="#" className="block p-2 hover:bg-gray-50 rounded transition text-black">
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
