'use client';

import { useState, useEffect } from 'react';
import { Shield, Building2, AlertCircle, Users, Package, Radio, X, Phone, Mail, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type UserPortal = 'ndrf' | 'collector' | 'citizen' | 'volunteer' | 'ngo' | 'action-team';
type AuthMode = 'citizen' | 'team' | null;
type AuthStep = 'phone' | 'register' | 'otp' | 'credentials';

export default function PortalSelectionPage() {
  const router = useRouter();
  const [selectedPortal, setSelectedPortal] = useState<UserPortal | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  
  // Authentication modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [authStep, setAuthStep] = useState<AuthStep>('phone');
  const [targetRoute, setTargetRoute] = useState<string>('');
  
  // User existence states
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userName, setUserName] = useState('');
  
  // Form states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Timers
  useEffect(() => {
    if (otpSent && otpExpiresIn > 0) {
      const timer = setInterval(() => {
        setOtpExpiresIn(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, otpExpiresIn]);
  
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const actionTeams = [
    { id: 'ndrf-team', name: 'NDRF Field Team', route: '/team/ndrf' },
    { id: 'sdrf-team', name: 'SDRF Field Team', route: '/team/sdrf' },
    { id: 'fire-team', name: 'Fire Services', route: '/team/fire' },
    { id: 'police-team', name: 'Police Team', route: '/team/police' },
    { id: 'medical-team', name: 'Medical Emergency Team', route: '/team/medical' },
    { id: 'ambulance-team', name: 'Ambulance Fleet', route: '/team/ambulance' },
    { id: 'civil-defense', name: 'Civil Defense Team', route: '/team/civil-defense' },
    { id: 'relief-camp', name: 'Relief Camp Incharge', route: '/team/relief-camp' },
  ];
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const openAuthModal = (mode: AuthMode, route: string) => {
    setAuthMode(mode);
    setTargetRoute(route);
    setAuthStep(mode === 'citizen' ? 'phone' : 'credentials');
    setShowAuthModal(true);
    setError('');
  };
  
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthMode(null);
    setAuthStep('phone');
    setPhone('');
    setOtp('');
    setEmail('');
    setPassword('');
    setUserName('');
    setUserExists(null);
    setError('');
    setOtpSent(false);
  };
  
  // Step 1: Check if phone exists
  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check phone');
      }
      
      if (data.exists) {
        // User exists - skip registration, go straight to OTP
        setUserExists(true);
        setUserName(data.user.name);
        await handleSendOTP();
      } else {
        // New user - show registration form
        setUserExists(false);
        setAuthStep('register');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check phone');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Step 2: Send OTP (for both existing and new users)
  const handleSendOTP = async (registrationData?: { name: string; email?: string }) => {
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          name: registrationData?.name || userName,
          email: registrationData?.email || email,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setOtpSent(true);
      setAuthStep('otp');
      setOtpExpiresIn(300);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle registration form submission
  const handleRegisterAndSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      setError('Name is required');
      return;
    }
    
    await handleSendOTP({ name: userName, email: email || undefined });
  };
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }
      
      closeAuthModal();
      router.push(targetRoute);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };
  
  // DEMO MODE: Instant login bypass (no OTP needed)
  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const demoPhone = phone || '+919999999999'; // Use entered phone or default
      const demoName = userName || 'Demo User';
      
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: demoPhone, name: demoName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Demo login failed');
      }
      
      console.log('✅ Demo login successful!', data);
      closeAuthModal();
      router.push(targetRoute);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: userName, email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }
      
      setOtpExpiresIn(300);
      setResendCooldown(60);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTeamLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      
      closeAuthModal();
      router.push(targetRoute);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamSelection = (teamRoute: string) => {
    openAuthModal('team', teamRoute);
  };

  const portals = [
    {
      id: 'ndrf' as UserPortal,
      title: 'NDRF Admin',
      subtitle: 'Disaster Response Command Center',
      description: 'Full coordination dashboard for NDRF officials to manage all disaster response operations',
      icon: Shield,
      color: 'blue',
      href: '/ndrf-admin',
      features: [
        'Live coordination map',
        'Incident management',
        'Team deployment',
        'Resource allocation',
        'Real-time monitoring',
      ],
    },
    {
      id: 'collector' as UserPortal,
      title: 'District Collector',
      subtitle: 'District Administration Portal',
      description: 'View-only access for district collectors with direct communication channel to NDRF',
      icon: Building2,
      color: 'purple',
      href: '/collector',
      features: [
        'Real-time situation view',
        'Direct NDRF communication',
        'District-level reports',
        'Resource status',
        'Incident tracking',
      ],
    },
    {
      id: 'citizen' as UserPortal,
      title: 'Citizen Portal',
      subtitle: 'Emergency Help & Reporting',
      description: 'For citizens to send SOS, report incidents, and access emergency information',
      icon: AlertCircle,
      color: 'red',
      href: '/citizen',
      features: [
        'Emergency SOS button',
        'Incident reporting with photos',
        'Safety alerts',
        'Help status tracking',
        'Relief camp locations',
      ],
    },
    {
      id: 'volunteer' as UserPortal,
      title: 'Volunteer Portal',
      subtitle: 'Verified Volunteer Network',
      description: 'For pre-registered and verified volunteers to receive task assignments',
      icon: Users,
      color: 'green',
      href: '/volunteer',
      features: [
        'Skill-based task matching',
        'Check-in/check-out',
        'Safety geofencing',
        'Training resources',
        'Performance tracking',
      ],
    },
    {
      id: 'ngo' as UserPortal,
      title: 'NGO & Donors',
      subtitle: 'Resource Contribution Portal',
      description: 'For NGOs and public to contribute resources and track their impact',
      icon: Package,
      color: 'orange',
      href: '/ngo',
      features: [
        'Resource donation',
        'Live tracking',
        'Impact reports',
        'Coordination with authorities',
        'Transparency dashboard',
      ],
    },
    {
      id: 'action-team' as UserPortal,
      title: 'Action Team POC',
      subtitle: 'Field Team Operations',
      description: 'For field team members (NDRF, SDRF, Fire, Police, Medical) to manage on-ground operations',
      icon: Radio,
      color: 'indigo',
      href: '#',
      features: [
        'Assigned incident details',
        'Real-time navigation',
        'Status updates',
        'Resource requests',
        'Communication with command',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Survive<span className="text-blue-600">.exe</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Disaster Risk Assessment & Emergency Coordination Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                PRE-DISASTER: Prediction
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                DURING-DISASTER: Coordination
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isSelected = selectedPortal === portal.id;
            const isActionTeam = portal.id === 'action-team';
            
            return (
              <div
                key={portal.id}
                className={`
                  bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer
                  transform transition-all duration-200 hover:scale-105 hover:shadow-xl
                  ${isSelected ? 'ring-4 ring-' + portal.color + '-500 scale-105' : ''}
                `}
                onClick={() => {
                  setSelectedPortal(portal.id);
                  if (isActionTeam) {
                    setShowTeamDropdown(true);
                  }
                }}
              >
                {/* Card Header */}
                <div className={`p-6 bg-${portal.color}-50 border-b border-${portal.color}-100`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-${portal.color}-600 rounded-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {portal.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {portal.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-sm text-gray-700 mb-4">
                    {portal.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Key Features
                    </p>
                    {portal.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${portal.color}-600`} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button or Dropdown */}
                  {isActionTeam ? (
                    <div className="space-y-2">
                      {showTeamDropdown && isSelected ? (
                        <select
                          className="w-full py-3 px-4 rounded-lg border-2 border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={selectedTeam}
                          onChange={(e) => {
                            setSelectedTeam(e.target.value);
                            if (e.target.value) {
                              handleTeamSelection(e.target.value);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Select Your Team</option>
                          {actionTeams.map((team) => (
                            <option key={team.id} value={team.route}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTeamDropdown(true);
                            setSelectedPortal('action-team');
                          }}
                        >
                          Select Team
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`
                        w-full py-3 px-4 rounded-lg font-semibold text-white
                        bg-${portal.color}-600 hover:bg-${portal.color}-700
                        transition-colors duration-200
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        const authType = portal.id === 'citizen' ? 'citizen' : 'team';
                        openAuthModal(authType, portal.href);
                      }}
                    >
                      Enter Portal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Multi-Stakeholder Coordination
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2">For Authorities</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• NDRF: Full command & control</li>
                  <li>• District Collectors: Real-time monitoring</li>
                  <li>• Seamless inter-agency coordination</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Citizens & Volunteers</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Citizens: Emergency SOS & reporting</li>
                  <li>• Volunteers: Skill-based deployment</li>
                  <li>• NGOs: Resource contribution tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              &copy; 2026 Survive.exe - Maharashtra Disaster Management Platform
            </p>
            <p className="mt-1 text-xs">
              In collaboration with NDMA, NDRF, State Disaster Management Authority
            </p>
          </div>
        </div>
      </footer>
      
      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {authMode === 'citizen' ? 'Citizen Login' : 'Team / Admin Login'}
              </h2>
              <button
                onClick={closeAuthModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              {authMode === 'citizen' ? (
                <>
                  {authStep === 'phone' ? (
                    <form onSubmit={handleCheckPhone} className="space-y-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91-9876543210"
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Enter your Indian mobile number
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          'Continue'
                        )}
                      </button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            🚀 Demo: Skip OTP & Login Instantly
                          </>
                        )}
                      </button>
                      
                      <p className="text-center text-xs text-gray-500">
                        Demo mode bypasses OTP verification for quick testing
                      </p>
                    </form>
                  ) : authStep === 'register' ? (
                    <form onSubmit={handleRegisterAndSendOTP} className="space-y-4">
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>New user detected!</strong> Please complete your registration.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email (Optional)
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p><strong>Phone:</strong> {phone}</p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          'Register & Send OTP'
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('phone');
                          setUserName('');
                          setEmail('');
                        }}
                        className="w-full text-gray-600 hover:text-gray-800 text-sm"
                      >
                        ← Change phone number
                      </button>
                      
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Quick Access</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
                      >
                        🚀 Skip & Login with Demo Mode
                      </button>
                    </form>
                  ) : authStep === 'otp' ? (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      {userName && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            Welcome, <strong>{userName}</strong>!
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                            Enter OTP
                          </label>
                          <span className="text-sm text-gray-500">
                            {otpExpiresIn > 0 ? `${formatTime(otpExpiresIn)}` : 'Expired'}
                          </span>
                        </div>
                        <input
                          id="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center text-2xl tracking-widest"
                          required
                          disabled={isLoading}
                          maxLength={6}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          OTP sent to {phone}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Demo Mode: Use OTP <code className="bg-gray-100 px-2 py-1 rounded">123456</code>
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Login'
                        )}
                      </button>
                      
                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthStep('phone');
                            setOtpSent(false);
                            setOtp('');
                            setUserName('');
                            setUserExists(null);
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ← Change number
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={resendCooldown > 0 || isLoading}
                          className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                      </div>
                      
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Having trouble?</span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
                      >
                        🚀 Skip OTP - Use Demo Login
                      </button>
                    </form>
                  ) : null}
                </>
              ) : (
                <form onSubmit={handleTeamLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@survive.exe"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Quick Access</span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
                  >
                    🚀 Skip Login - Use Demo Mode
                  </button>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Demo Account:</strong> admin@survive.exe / SuperAdmin@2026!
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
