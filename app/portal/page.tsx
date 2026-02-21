'use client';

import { useState } from 'react';
import { Shield, Building2, AlertCircle, Users, Package, Radio } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UserPortal = 'ndrf' | 'collector' | 'citizen' | 'volunteer' | 'ngo' | 'action-team';

export default function PortalSelectionPage() {
  const router = useRouter();
  const [selectedPortal, setSelectedPortal] = useState<UserPortal | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const actionTeams = [
    { id: 'ndrf-team', name: 'NDRF Field Team', route: '/team/ndrf' },
    { id: 'sdrf-team', name: 'SDRF Field Team', route: '/team/sdrf' },
    { id: 'fire-team', name: 'Fire Services', route: '/team/fire' },
    { id: 'police-team', name: 'Police Team', route: '/team/police' },
    { id: 'medical-team', name: 'Medical Emergency Team', route: '/team/medical' },
    { id: 'civil-defense', name: 'Civil Defense Team', route: '/team/civil-defense' },
    { id: 'relief-camp', name: 'Relief Camp Incharge', route: '/team/relief-camp' },
  ];

  const handleTeamSelection = (teamRoute: string) => {
    router.push(teamRoute);
  };

  const portals = [
    {
      id: 'ndrf' as UserPortal,
      title: 'NDRF Admin',
      subtitle: 'Disaster Response Command Center',
      description: 'Full coordination dashboard for NDRF officials to manage all disaster response operations',
      icon: Shield,
      color: 'blue',
      href: '/dashboard',
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
                    <Link href={portal.href}>
                      <button
                        className={`
                          w-full py-3 px-4 rounded-lg font-semibold text-white
                          bg-${portal.color}-600 hover:bg-${portal.color}-700
                          transition-colors duration-200
                        `}
                      >
                        Enter Portal
                      </button>
                    </Link>
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
    </div>
  );
}
