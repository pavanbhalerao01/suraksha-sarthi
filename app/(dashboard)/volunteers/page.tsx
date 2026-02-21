'use client'

import { useState } from 'react'
import {
    Users, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, Star,
    Shield, Filter, Search, User, Award, Calendar
} from 'lucide-react'
import { cn, getRelativeTime } from '@/lib/utils'

type Volunteer = {
    id: string
    name: string
    phone: string
    email: string
    district: string
    state: string
    skills: string[]
    status: 'PENDING' | 'VERIFIED' | 'DEPLOYED' | 'REJECTED'
    rating: number
    experience: string
    availability: string
    registeredAt: string
}

const INITIAL_VOLUNTEERS: Volunteer[] = [
    {
        id: 'vol-001',
        name: 'Amit Sharma',
        phone: '+91-9876543210',
        email: 'amit.sharma@email.com',
        district: 'Mumbai',
        state: 'Maharashtra',
        skills: ['First Aid', 'Search & Rescue', 'Communication'],
        status: 'PENDING',
        rating: 0,
        experience: '5 years',
        availability: 'Weekends',
        registeredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: 'vol-002',
        name: 'Priya Patel',
        phone: '+91-9876543211',
        email: 'priya.patel@email.com',
        district: 'Pune',
        state: 'Maharashtra',
        skills: ['Medical Support', 'Counseling', 'Food Distribution'],
        status: 'VERIFIED',
        rating: 4.8,
        experience: '3 years',
        availability: 'Anytime',
        registeredAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    },
    {
        id: 'vol-003',
        name: 'Rajesh Kumar',
        phone: '+91-9876543212',
        email: 'rajesh.kumar@email.com',
        district: 'Nagpur',
        state: 'Maharashtra',
        skills: ['Logistics', 'Transportation', 'Warehouse Management'],
        status: 'DEPLOYED',
        rating: 4.9,
        experience: '7 years',
        availability: 'Anytime',
        registeredAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    },
    {
        id: 'vol-004',
        name: 'Sunita Reddy',
        phone: '+91-9876543213',
        email: 'sunita.reddy@email.com',
        district: 'Thane',
        state: 'Maharashtra',
        skills: ['Communication', 'Data Entry', 'Social Media'],
        status: 'VERIFIED',
        rating: 4.6,
        experience: '2 years',
        availability: 'Weekdays',
        registeredAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
    },
    {
        id: 'vol-005',
        name: 'Test User',
        phone: '+91-0000000000',
        email: 'test@test.com',
        district: 'Mumbai',
        state: 'Maharashtra',
        skills: ['Testing'],
        status: 'REJECTED',
        rating: 0,
        experience: 'None',
        availability: 'Never',
        registeredAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    },
]

export default function VolunteersPage() {
    const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS)
    const [selected, setSelected] = useState<Volunteer | null>(volunteers[0])
    const [filter, setFilter] = useState('ALL')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredVolunteers = volunteers.filter(v => {
        const matchesFilter = filter === 'ALL' || v.status === filter
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              v.district.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const updateStatus = (id: string, newStatus: Volunteer['status']) => {
        setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v))
        setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev)
    }

    const handleApprove = (id: string) => {
        updateStatus(id, 'VERIFIED')
        alert('✅ Volunteer verified and added to active roster!')
    }

    const handleReject = (id: string) => {
        updateStatus(id, 'REJECTED')
        alert('❌ Volunteer application rejected.')
    }

    const handleDeploy = (id: string) => {
        updateStatus(id, 'DEPLOYED')
        alert('🚁 Volunteer deployed to active disaster site!')
    }

    const STATUS_FILTERS: Array<'ALL' | Volunteer['status']> = ['ALL', 'PENDING', 'VERIFIED', 'DEPLOYED', 'REJECTED']

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="w-6 h-6 text-purple-600" />
                            Volunteer Management
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">Verify and manage disaster response volunteers</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">{volunteers.filter(v => v.status === 'VERIFIED' || v.status === 'DEPLOYED').length} Active Volunteers</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Volunteers</div>
                    <div className="text-2xl font-bold text-purple-600">{volunteers.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Pending Review</div>
                    <div className="text-2xl font-bold text-orange-600">{volunteers.filter(v => v.status === 'PENDING').length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Verified</div>
                    <div className="text-2xl font-bold text-green-600">{volunteers.filter(v => v.status === 'VERIFIED').length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Currently Deployed</div>
                    <div className="text-2xl font-bold text-blue-600">{volunteers.filter(v => v.status === 'DEPLOYED').length}</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-500" />
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                                filter === f
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                        >
                            {f} {f !== 'ALL' && `(${volunteers.filter(v => v.status === f).length})`}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or district..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Volunteers list */}
                <div className="lg:col-span-2 space-y-3">
                    {filteredVolunteers.map(volunteer => (
                        <button
                            key={volunteer.id}
                            onClick={() => setSelected(volunteer)}
                            className={cn(
                                'w-full bg-white rounded-lg shadow p-4 text-left transition-all border-2',
                                selected?.id === volunteer.id ? 'border-purple-400' : 'border-transparent hover:border-gray-200'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                    {volunteer.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-900 text-sm">{volunteer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className={cn(
                                            'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                                            volunteer.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                            volunteer.status === 'DEPLOYED' ? 'bg-blue-100 text-blue-700' :
                                            volunteer.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700'
                                        )}>
                                            {volunteer.status}
                                        </span>
                                        {volunteer.rating > 0 && (
                                            <span className="flex items-center gap-1 text-xs text-yellow-600">
                                                <Star className="w-3 h-3 fill-current" />
                                                {volunteer.rating}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1.5">
                                        <MapPin className="w-3 h-3" />
                                        {volunteer.district}, {volunteer.state}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {getRelativeTime(volunteer.registeredAt)}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                    {filteredVolunteers.length === 0 && (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p>No volunteers found</p>
                        </div>
                    )}
                </div>

                {/* Detail pane */}
                {selected && (
                    <div className="lg:col-span-3 space-y-4">
                        {/* Info card */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl">
                                    {selected.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-xs font-semibold uppercase',
                                            selected.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                            selected.status === 'DEPLOYED' ? 'bg-blue-100 text-blue-700' :
                                            selected.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700'
                                        )}>
                                            {selected.status}
                                        </span>
                                        {selected.rating > 0 && (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                <Star className="w-3 h-3 fill-current" />
                                                {selected.rating} Rating
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[
                                    { icon: Phone, label: 'Phone', value: selected.phone },
                                    { icon: Mail, label: 'Email', value: selected.email },
                                    { icon: MapPin, label: 'Location', value: `${selected.district}, ${selected.state}` },
                                    { icon: Calendar, label: 'Registered', value: getRelativeTime(selected.registeredAt) },
                                    { icon: Award, label: 'Experience', value: selected.experience },
                                    { icon: Clock, label: 'Availability', value: selected.availability },
                                ].map(item => (
                                    <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                            <item.icon className="w-3 h-3" />{item.label}
                                        </div>
                                        <div className="text-sm text-gray-900 font-medium truncate">{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Skills */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wider">Skills & Expertise</p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions card */}
                        <div className="bg-white rounded-lg shadow p-5">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" />
                                Actions
                            </h3>

                            {selected.status === 'PENDING' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-700">
                                        Review volunteer application and verify credentials before approval.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(selected.id)}
                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve & Verify
                                        </button>
                                        <button
                                            onClick={() => handleReject(selected.id)}
                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selected.status === 'VERIFIED' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Verified volunteer - Ready for deployment</span>
                                    </div>
                                    <p className="text-sm text-gray-700">This volunteer is verified and can be deployed to active disaster sites.</p>
                                    <button
                                        onClick={() => handleDeploy(selected.id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                                    >
                                        <Users className="w-4 h-4" />
                                        Deploy to Active Site
                                    </button>
                                </div>
                            )}

                            {selected.status === 'DEPLOYED' && (
                                <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-lg">
                                    <Users className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Currently deployed</div>
                                        <div className="text-xs text-blue-600 mt-0.5">Volunteer is active at disaster site</div>
                                    </div>
                                </div>
                            )}

                            {selected.status === 'REJECTED' && (
                                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
                                    <XCircle className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Application rejected</div>
                                        <div className="text-xs text-red-600 mt-0.5">This volunteer did not meet verification criteria</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
