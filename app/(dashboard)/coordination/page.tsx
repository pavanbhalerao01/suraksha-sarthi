'use client'

import { useState } from 'react'
import {
    ClipboardList, Zap, CheckCircle, XCircle, AlertTriangle, MapPin,
    Users, Star, ChevronDown, ChevronUp, Clock, Brain, ShieldCheck, Info
} from 'lucide-react'
import { cn, getDisasterIcon, getSeverityColor } from '@/lib/utils'

const DISASTERS = [
    {
        id: 'dis-001', type: 'cyclone', severity: 'CRITICAL', state: 'Maharashtra', district: 'Raigad',
        date: '2026-02-23', status: 'PREDICTED', affectedPeople: '85,000', lat: 18.17, lon: 73.03,
    },
    {
        id: 'dis-002', type: 'flood', severity: 'HIGH', state: 'Maharashtra', district: 'Kolhapur',
        date: '2026-02-24', status: 'ACTIVE', affectedPeople: '65,000', lat: 16.69, lon: 74.23,
    },
    {
        id: 'dis-003', type: 'earthquake', severity: 'MEDIUM', state: 'Maharashtra', district: 'Latur',
        date: '2026-02-25', status: 'PREDICTED', affectedPeople: '45,000', lat: 18.40, lon: 76.58,
    },
]

const TEAMS = [
    {
        id: 'team-alpha', name: 'Alpha Force — Mumbai NDRF', state: 'Maharashtra', district: 'Mumbai',
        status: 'AVAILABLE', memberCount: 25,
        expertise: ['flood', 'cyclone', 'landslide'],
        proficiency: { flood: 95, cyclone: 88, landslide: 72, earthquake: 60, fire: 55 },
        lat: 19.07, lon: 72.87, distanceKm: 45,
    },
    {
        id: 'team-bravo', name: 'Bravo Squad — Pune SDRF', state: 'Maharashtra', district: 'Pune',
        status: 'AVAILABLE', memberCount: 20,
        expertise: ['earthquake', 'landslide', 'fire'],
        proficiency: { earthquake: 92, landslide: 85, fire: 90, flood: 65, cyclone: 55 },
        lat: 18.52, lon: 73.85, distanceKm: 120,
    },
    {
        id: 'team-charlie', name: 'Charlie Unit — Nagpur Fire', state: 'Maharashtra', district: 'Nagpur',
        status: 'DEPLOYED', memberCount: 18,
        expertise: ['fire', 'earthquake', 'flood'],
        proficiency: { fire: 88, earthquake: 80, flood: 75, cyclone: 60, landslide: 50 },
        lat: 21.15, lon: 79.09, distanceKm: 280,
    },
    {
        id: 'team-delta', name: 'Delta Team — Kolhapur SDRF', state: 'Maharashtra', district: 'Kolhapur',
        status: 'AVAILABLE', memberCount: 22,
        expertise: ['flood', 'landslide', 'cyclone'],
        proficiency: { flood: 92, landslide: 88, cyclone: 82, earthquake: 58, fire: 60 },
        lat: 16.69, lon: 74.23, distanceKm: 15,
    },
]

function getAIRecommendation(disaster: typeof DISASTERS[0], teams: typeof TEAMS) {
    const available = teams.filter(t => t.status === 'AVAILABLE')
    if (!available.length) return null
    const scored = available.map(t => {
        const expMatch = t.expertise.includes(disaster.type) ? 1 : 0
        const profScore = (t.proficiency as Record<string, number>)[disaster.type] ?? 30
        const distancePenalty = Math.max(0, 100 - t.distanceKm / 5)
        const total = expMatch * 40 + profScore * 0.4 + distancePenalty * 0.2
        return { team: t, score: Math.round(total), expMatch, profScore, distancePenalty: Math.round(distancePenalty) }
    })
    scored.sort((a, b) => b.score - a.score)
    return scored[0]
}

export default function CoordinationPage() {
    const [selectedDisaster, setSelectedDisaster] = useState(DISASTERS[0])
    const [taskStatuses, setTaskStatuses] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({})
    const [showReasoning, setShowReasoning] = useState(false)

    const recommendation = getAIRecommendation(selectedDisaster, TEAMS)
    const recTeam = recommendation?.team

    const handleApprove = () => {
        setTaskStatuses(prev => ({ ...prev, [selectedDisaster.id]: 'approved' }))
        alert(`✅ Task approved! ${recTeam?.name} dispatched to ${selectedDisaster.district}, ${selectedDisaster.state}`)
    }

    const handleReject = () => {
        setTaskStatuses(prev => ({ ...prev, [selectedDisaster.id]: 'rejected' }))
        alert('❌ Task rejected. Please manually allocate a team.')
    }

    const status = taskStatuses[selectedDisaster.id]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Brain className="w-6 h-6 text-purple-600" />
                    AI-Powered Team Coordination
                </h1>
                <p className="text-gray-600 text-sm mt-1">Intelligent team allocation with human approval workflow</p>
            </div>

            {/* How it works banner */}
            <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-700 leading-relaxed">
                    <strong className="text-purple-600">How it works:</strong> The AI engine scores each available rescue team based on <em>expertise match</em>, <em>proficiency score</em>, and <em>proximity</em> to the disaster site. The top recommendation requires <strong>Admin approval</strong> before the team is officially dispatched.
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Disaster selector */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Select Active Disaster</h2>
                    <div className="space-y-3">
                        {DISASTERS.map(d => (
                            <button
                                key={d.id}
                                onClick={() => setSelectedDisaster(d)}
                                className={cn(
                                    'w-full p-4 rounded-lg border-2 text-left transition-all',
                                    selectedDisaster.id === d.id
                                        ? 'bg-purple-50 border-purple-300'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{getDisasterIcon(d.type)}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-gray-900 capitalize text-sm">{d.type}</span>
                                            <span className={cn(
                                                'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                                                d.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                d.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            )}>
                                                {d.severity}
                                            </span>
                                            {taskStatuses[d.id] === 'approved' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-green-100 text-green-700">
                                                    DISPATCHED
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />{d.district}, {d.state}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">{d.affectedPeople} at risk</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Recommendation */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">AI Recommendation</h2>
                                <p className="text-xs text-gray-600">Best team for {selectedDisaster.type} in {selectedDisaster.district}</p>
                            </div>
                            <div className="ml-auto">
                                {recommendation && (
                                    <div className="flex items-center gap-1.5 bg-purple-100 rounded-full px-3 py-1">
                                        <Star className="w-3 h-3 text-purple-600" />
                                        <span className="text-xs text-purple-600 font-bold">Score: {recommendation.score}/100</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {recTeam ? (
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{recTeam.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                                            <MapPin className="w-3 h-3" />{recTeam.district}, {recTeam.state}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <div className="text-xs bg-green-100 text-green-700 rounded-lg px-2.5 py-1 font-medium">
                                                ✓ Status: {recTeam.status}
                                            </div>
                                            <div className="text-xs bg-blue-100 text-blue-700 rounded-lg px-2.5 py-1 font-medium">
                                                👥 {recTeam.memberCount} members
                                            </div>
                                            <div className="text-xs bg-orange-100 text-orange-700 rounded-lg px-2.5 py-1 font-medium">
                                                📍 ~{recTeam.distanceKm} km away
                                            </div>
                                        </div>

                                        {/* Expertise tags */}
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {recTeam.expertise.map(e => (
                                                <span
                                                    key={e}
                                                    className={cn(
                                                        'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                                                        e === selectedDisaster.type
                                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    )}
                                                >
                                                    {e === selectedDisaster.type && '★ '}
                                                    {getDisasterIcon(e)} {e}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Proficiency bar */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                <span>Proficiency: <span className="capitalize font-medium">{selectedDisaster.type}</span></span>
                                                <span className="font-bold text-green-600">
                                                    {(recTeam.proficiency as Record<string, number>)[selectedDisaster.type] ?? 30}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700"
                                                    style={{ width: `${(recTeam.proficiency as Record<string, number>)[selectedDisaster.type] ?? 30}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Reasoning toggle */}
                                <button
                                    onClick={() => setShowReasoning(!showReasoning)}
                                    className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-700 mt-4 ml-16 transition-colors font-medium"
                                >
                                    {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    {showReasoning ? 'Hide' : 'Show'} AI reasoning
                                </button>

                                {showReasoning && (
                                    <div className="mt-3 ml-16 bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-700 space-y-1.5 font-mono">
                                        <div className="flex justify-between">
                                            <span>Expertise match ({selectedDisaster.type}):</span>
                                            <span className="text-green-600 font-bold">+{recommendation?.expMatch ? 40 : 0} pts</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Proficiency score ({(recTeam.proficiency as Record<string, number>)[selectedDisaster.type] ?? 30}%):</span>
                                            <span className="text-blue-600 font-bold">+{Math.round(((recTeam.proficiency as Record<string, number>)[selectedDisaster.type] ?? 30) * 0.4)} pts</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Proximity bonus (~{recTeam.distanceKm} km):</span>
                                            <span className="text-orange-600 font-bold">+{recommendation?.distancePenalty} pts</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-1 flex justify-between">
                                            <span className="text-gray-900 font-semibold">Total Score:</span>
                                            <span className="text-purple-600 font-bold">{recommendation?.score}/100</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No available teams for this disaster type</p>
                            </div>
                        )}
                    </div>

                    {/* Human approval gate */}
                    <div className={cn(
                        'rounded-lg shadow p-5 border-2 transition-all',
                        status === 'approved' ? 'bg-green-50 border-green-300' :
                            status === 'rejected' ? 'bg-red-50 border-red-300' :
                                'bg-yellow-50 border-yellow-300'
                    )}>
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className={cn('w-5 h-5', status === 'approved' ? 'text-green-600' : status === 'rejected' ? 'text-red-600' : 'text-yellow-600')} />
                            <h2 className="font-bold text-gray-900">Human Approval Required</h2>
                            <span className={cn(
                                'ml-auto px-3 py-1 rounded-full text-xs font-semibold uppercase',
                                status === 'approved' ? 'bg-green-100 text-green-700' :
                                    status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                            )}>
                                {status === 'approved' ? '✓ Approved' : status === 'rejected' ? '✗ Rejected' : '⏳ Awaiting Review'}
                            </span>
                        </div>

                        {!status ? (
                            <>
                                <p className="text-sm text-gray-700 mb-4">
                                    Review the AI recommendation above. Click <strong className="text-gray-900">Approve</strong> to officially dispatch{' '}
                                    <span className="text-purple-600 font-medium">{recTeam?.name}</span> to{' '}
                                    <span className="text-orange-600 font-medium">{selectedDisaster.district}, {selectedDisaster.state}</span>.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleApprove}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve & Dispatch
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        Manual Assign
                                    </button>
                                </div>
                            </>
                        ) : status === 'approved' ? (
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Task successfully dispatched!
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">
                                        {recTeam?.name} has been notified and is en route to {selectedDisaster.district}.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">
                                        Task rejected. Please manually allocate an alternative team.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* All teams overview */}
                    <div className="bg-white rounded-lg shadow p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">All Teams</h3>
                        <div className="space-y-3">
                            {TEAMS.map(team => (
                                <div key={team.id} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{team.name}</h4>
                                            <p className="text-xs text-gray-600">{team.district}, {team.state}</p>
                                        </div>
                                        <span className={cn(
                                            'px-2 py-1 rounded text-xs font-semibold',
                                            team.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-600'
                                        )}>
                                            {team.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                        {team.expertise.map(e => (
                                            <span key={e} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                                                {e}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
