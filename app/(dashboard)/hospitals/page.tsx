'use client'

import { useState } from 'react'
import { MapPin, Phone, Bed, Search, Filter, Building2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const HOSPITALS = [
    {
        id: 'hosp-001', name: 'KEM Hospital Mumbai', lat: 19.01, lon: 72.84,
        address: 'Acharya Donde Marg, Parel, Mumbai', phone: '022-24107000',
        state: 'Maharashtra', district: 'Mumbai', capacity: 600, available: 120,
        specialties: ['Trauma', 'Burns', 'Orthopedic', 'Neurology', 'Cardiac'], type: 'GOVERNMENT',
        distanceKm: 8,
    },
    {
        id: 'hosp-002', name: 'Sassoon Hospital Pune', lat: 18.52, lon: 73.86,
        address: 'Near PMC, Pune', phone: '020-26053301',
        state: 'Maharashtra', district: 'Pune', capacity: 550, available: 95,
        specialties: ['Trauma', 'Burns', 'Pediatric', 'Orthopedic'], type: 'GOVERNMENT',
        distanceKm: 15,
    },
    {
        id: 'hosp-003', name: 'Ruby Hall Clinic', lat: 18.52, lon: 73.85,
        address: '40, Sassoon Road, Pune', phone: '020-66450000',
        state: 'Maharashtra', district: 'Pune', capacity: 400, available: 78,
        specialties: ['Cardiac', 'Trauma', 'Neurology', 'Orthopedic'], type: 'PRIVATE',
        distanceKm: 12,
    },
    {
        id: 'hosp-004', name: 'District Hospital Kolhapur', lat: 16.69, lon: 74.23,
        address: 'Civil Hospital Road, Kolhapur', phone: '0231-2651234',
        state: 'Maharashtra', district: 'Kolhapur', capacity: 300, available: 52,
        specialties: ['Trauma', 'General'], type: 'GOVERNMENT',
        distanceKm: 25,
    },
    {
        id: 'hosp-005', name: 'Jupiter Hospital Thane', lat: 19.21, lon: 72.97,
        address: 'Eastern Express Highway, Thane', phone: '022-68461800',
        state: 'Maharashtra', district: 'Thane', capacity: 500, available: 145,
        specialties: ['Trauma', 'Burns', 'General', 'ICU'], type: 'PRIVATE',
        distanceKm: 18,
    },
    {
        id: 'hosp-006', name: 'GMCH Nagpur', lat: 21.15, lon: 79.09,
        address: 'Medical College Square, Nagpur', phone: '0712-2742251',
        state: 'Maharashtra', district: 'Nagpur', capacity: 700, available: 168,
        specialties: ['Trauma', 'Burns', 'Pediatric', 'Cardiac', 'ICU'], type: 'GOVERNMENT',
        distanceKm: 32,
    },
]

export default function HospitalsPage() {
    const [selected, setSelected] = useState(HOSPITALS[0])
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('ALL')

    const filtered = HOSPITALS.filter(h => {
        const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.district.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'ALL' || h.type === filter
        return matchSearch && matchFilter
    }).sort((a, b) => a.distanceKm - b.distanceKm)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-purple-600" />
                            Nearby Hospitals & Medical Facilities
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">Emergency medical facilities sorted by proximity</p>
                    </div>
                    <div className="text-xs text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full font-medium">
                        {filtered.length} facilities available
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Hospitals</div>
                    <div className="text-2xl font-bold text-purple-600">{HOSPITALS.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Capacity</div>
                    <div className="text-2xl font-bold text-blue-600">{HOSPITALS.reduce((a, b) => a + b.capacity, 0)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Available Beds</div>
                    <div className="text-2xl font-bold text-green-600">{HOSPITALS.reduce((a, b) => a + b.available, 0)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Avg Distance</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {Math.round(HOSPITALS.reduce((a, b) => a + b.distanceKm, 0) / HOSPITALS.length)} km
                    </div>
                </div>
            </div>

            {/* Search & filter */}
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Search hospitals..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        {['ALL', 'GOVERNMENT', 'PRIVATE', 'NGO'].map(f => (
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
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-1 space-y-3">
                    {filtered.map(h => (
                        <button
                            key={h.id}
                            onClick={() => setSelected(h)}
                            className={cn(
                                'w-full bg-white rounded-lg shadow p-4 text-left transition-all border-2',
                                selected.id === h.id ? 'border-purple-400' : 'border-transparent hover:border-gray-200'
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-900 truncate">{h.name}</div>
                                    <div className={cn(
                                        'text-[10px] font-medium mt-0.5 uppercase',
                                        h.type === 'GOVERNMENT' ? 'text-green-600' : h.type === 'PRIVATE' ? 'text-blue-600' : 'text-purple-600'
                                    )}>{h.type}</div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                        <MapPin className="w-3 h-3" />{h.district}
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                            <Bed className="w-3 h-3" />
                                            <span className="font-semibold">{h.available}</span>
                                            <span className="text-gray-500">/ {h.capacity}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-orange-600">
                                            <MapPin className="w-3 h-3" />
                                            <span>{h.distanceKm} km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Capacity bar */}
                            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-500',
                                        (h.available / h.capacity) < 0.2 ? 'bg-red-500' : (h.available / h.capacity) < 0.4 ? 'bg-orange-500' : 'bg-green-500'
                                    )}
                                    style={{ width: `${(h.available / h.capacity) * 100}%` }}
                                ></div>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">
                                {Math.round((h.available / h.capacity) * 100)}% capacity available
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail */}
                <div className="lg:col-span-2">
                    {selected && (
                        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-3xl">🏥</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-xs font-semibold uppercase',
                                            selected.type === 'GOVERNMENT' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        )}>{selected.type}</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        {[
                                            { label: 'Distance', value: `${selected.distanceKm} km`, icon: MapPin },
                                            { label: 'Available Beds', value: `${selected.available} / ${selected.capacity}`, icon: Bed },
                                            { label: 'Phone', value: selected.phone, icon: Phone },
                                            { label: 'Occupancy', value: `${Math.round((1 - selected.available / selected.capacity) * 100)}%`, icon: Activity },
                                        ].map(item => (
                                            <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                                    <item.icon className="w-3 h-3" />
                                                    {item.label}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Full Address */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wider">Full Address</p>
                                        <p className="text-sm text-gray-700">{selected.address}, {selected.district}, {selected.state}</p>
                                    </div>

                                    {/* Specialties */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wider">Specialties Available</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selected.specialties.map(s => (
                                                <span key={s} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                                                    ⚕️ {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Capacity Status */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Bed Availability</span>
                                            <span className={cn(
                                                'text-sm font-bold',
                                                (selected.available / selected.capacity) > 0.4 ? 'text-green-600' :
                                                (selected.available / selected.capacity) > 0.2 ? 'text-orange-600' :
                                                'text-red-600'
                                            )}>
                                                {Math.round((selected.available / selected.capacity) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full transition-all duration-700',
                                                    (selected.available / selected.capacity) > 0.4 ? 'bg-green-500' :
                                                    (selected.available / selected.capacity) > 0.2 ? 'bg-orange-500' :
                                                    'bg-red-500'
                                                )}
                                                style={{ width: `${(selected.available / selected.capacity) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            {selected.available} beds available out of {selected.capacity} total capacity
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-4">
                                        <a
                                            href={`tel:${selected.phone}`}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-sm font-medium"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call Hospital
                                        </a>
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Get Directions
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
