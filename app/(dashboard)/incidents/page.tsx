'use client'

import { useState } from 'react'
import {
    AlertTriangle, MapPin, Clock, CheckCircle2, XCircle, Shield,
    Phone, User, MessageSquare, Filter, Bell, Truck
} from 'lucide-react'
import { cn, getDisasterIcon, getSeverityColor, getStatusColor, getRelativeTime } from '@/lib/utils'

type SOS = {
    id: string; title: string; description: string; disasterType: string;
    severity: string; latitude: number; longitude: number; address: string;
    status: string; reporter: string; phone: string; wardMember: string;
    injuredCount: number; affectedFamilies: number; createdAt: string;
}

const INITIAL_SOS: SOS[] = [
    {
        id: 'sos-001', title: 'Flooding in residential colony', description: 'Water level rising rapidly in Sector 5. Multiple families trapped on rooftops. Need immediate rescue.',
        disasterType: 'flood', severity: 'CRITICAL', latitude: 19.076, longitude: 72.877,
        address: 'Sector 5, Near Water Tank, Mumbai', status: 'WARD_NOTIFIED',
        reporter: 'Priya Patel', phone: '+91-9812345678', wardMember: 'Rajesh Kumar',
        injuredCount: 3, affectedFamilies: 12, createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    },
    {
        id: 'sos-002', title: 'Building collapse after tremors', description: 'Old building collapsed at main bazaar. Estimated 8-10 people trapped under debris.',
        disasterType: 'earthquake', severity: 'HIGH', latitude: 18.52, longitude: 73.85,
        address: 'Main Bazaar Road, Pune', status: 'UNVERIFIED',
        reporter: 'Arun Singh', phone: '+91-9812345679', wardMember: 'Suresh Rao',
        injuredCount: 8, affectedFamilies: 4, createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    },
    {
        id: 'sos-003', title: 'Fire in slum area', description: 'Large fire spreading in the slum near railway station. Medical assistance needed urgently.',
        disasterType: 'fire', severity: 'HIGH', latitude: 21.15, longitude: 79.09,
        address: 'Slum Area, Railway Station Road, Nagpur', status: 'VERIFIED',
        reporter: 'Meena Devi', phone: '+91-9812345680', wardMember: 'Geeta Sharma',
        injuredCount: 5, affectedFamilies: 30, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: 'sos-004', title: 'Land slide blocks highway', description: 'Massive landslide has blocked main highway. Multiple vehicles stranded. No casualties reported yet.',
        disasterType: 'landslide', severity: 'MEDIUM', latitude: 18.40, longitude: 76.58,
        address: 'Highway NH-9, near Latur junction', status: 'DISPATCHED',
        reporter: 'Ravi Kumar', phone: '+91-9812345681', wardMember: 'Amit Patil',
        injuredCount: 0, affectedFamilies: 8, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
        id: 'sos-005', title: 'Test SOS — checking system', description: 'Testing the emergency reporting system.',
        disasterType: 'other', severity: 'LOW', latitude: 16.69, longitude: 74.23,
        address: 'Test Location, Kolhapur', status: 'UNVERIFIED',
        reporter: 'Unknown User', phone: '+91-0000000000', wardMember: 'Test Ward',
        injuredCount: 0, affectedFamilies: 0, createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
]

const STATUS_ORDER = ['UNVERIFIED', 'WARD_NOTIFIED', 'VERIFIED', 'DISPATCHED', 'RESOLVED', 'FAKE']

export default function IncidentsPage() {
    const [sosList, setSosList] = useState<SOS[]>(INITIAL_SOS)
    const [selected, setSelected] = useState<SOS | null>(sosList[0])
    const [filter, setFilter] = useState('ALL')

    const filtered = filter === 'ALL' ? sosList : sosList.filter(s => s.status === filter)

    const updateStatus = (id: string, newStatus: string) => {
        setSosList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
        setSelected(prev => prev?.id === id ? { ...prev, status: newStatus } : prev)
    }

    const handleWardConfirm = (id: string, confirmed: boolean) => {
        if (confirmed) {
            updateStatus(id, 'VERIFIED')
            alert('✅ SOS Verified by ward member — ready for dispatch')
        } else {
            updateStatus(id, 'FAKE')
            alert('⚠️ SOS marked as false alarm by ward member')
        }
    }

    const handleDispatch = (id: string) => {
        updateStatus(id, 'DISPATCHED')
        alert('🚨 Rescue team dispatched to this SOS location!')
    }

    const STATUS_FILTERS = ['ALL', 'UNVERIFIED', 'WARD_NOTIFIED', 'VERIFIED', 'DISPATCHED', 'RESOLVED']

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Bell className="w-6 h-6 text-purple-600" />
                            SOS Alerts & Incident Management
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">Emergency reports with ward member validation workflow</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">{sosList.filter(s => s.status === 'UNVERIFIED' || s.status === 'WARD_NOTIFIED').length} Pending Review</span>
                    </div>
                </div>
            </div>

            {/* Validation workflow banner */}
            <div className="bg-white rounded-lg shadow p-5">
                <p className="text-xs text-gray-600 font-medium mb-3 uppercase tracking-wider">SOS Validation Workflow</p>
                <div className="flex items-center gap-2 flex-wrap">
                    {['🆕 New SOS', '→', '📋 UNVERIFIED', '→', '📞 WARD_NOTIFIED', '→', '✅ VERIFIED', '→', '🚁 DISPATCHED', '→', '✔ RESOLVED'].map((step, i) => (
                        <span key={i} className={cn(
                            'text-xs font-medium',
                            step === '→' ? 'text-gray-400' : 'bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full text-gray-700'
                        )}>
                            {step}
                        </span>
                    ))}
                    <span className="text-xs text-gray-500 ml-2">| False alarm → ⛔ FAKE</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap bg-white rounded-lg shadow p-4">
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
                        {f} {f !== 'ALL' && `(${sosList.filter(s => s.status === f).length})`}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* SOS list */}
                <div className="lg:col-span-2 space-y-3">
                    {filtered.map(sos => (
                        <button
                            key={sos.id}
                            onClick={() => setSelected(sos)}
                            className={cn(
                                'w-full bg-white rounded-lg shadow p-4 text-left transition-all border-2',
                                selected?.id === sos.id ? 'border-purple-400' : 'border-transparent hover:border-gray-200'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{getDisasterIcon(sos.disasterType)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-900 text-sm truncate">{sos.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className={cn(
                                            'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                                            sos.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                            sos.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                            sos.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'
                                        )}>
                                            {sos.severity}
                                        </span>
                                        <span className={cn(
                                            'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                                            sos.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                            sos.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' :
                                            sos.status === 'FAKE' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-600'
                                        )}>
                                            {sos.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1.5">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{sos.address}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {getRelativeTime(sos.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Detail pane */}
                {selected && (
                    <div className="lg:col-span-3 space-y-4">
                        {/* Info card */}
                        <div className={cn(
                            'bg-white rounded-lg shadow-lg p-5 border-l-4',
                            selected.severity === 'CRITICAL' ? 'border-red-500' :
                            selected.severity === 'HIGH' ? 'border-orange-500' :
                            selected.severity === 'MEDIUM' ? 'border-yellow-500' :
                            'border-gray-300'
                        )}>
                            <div className="flex items-start gap-3 mb-4">
                                <span className="text-4xl">{getDisasterIcon(selected.disasterType)}</span>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-xs font-semibold uppercase',
                                            selected.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                            selected.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                            selected.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'
                                        )}>
                                            {selected.severity}
                                        </span>
                                        <span className={cn(
                                            'px-3 py-1 rounded-full text-xs font-semibold uppercase',
                                            selected.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                            selected.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' :
                                            selected.status === 'FAKE' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-600'
                                        )}>
                                            {selected.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-purple-100 text-purple-700">
                                            {selected.disasterType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-4">{selected.description}</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[
                                    { icon: MapPin, label: 'Location', value: selected.address },
                                    { icon: User, label: 'Reporter', value: selected.reporter },
                                    { icon: Phone, label: 'Phone', value: selected.phone },
                                    { icon: Clock, label: 'Reported', value: getRelativeTime(selected.createdAt) },
                                    { icon: AlertTriangle, label: 'Injured', value: `${selected.injuredCount} persons` },
                                    { icon: User, label: 'Families Affected', value: `${selected.affectedFamilies} families` },
                                ].map(item => (
                                    <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                            <item.icon className="w-3 h-3" />{item.label}
                                        </div>
                                        <div className="text-sm text-gray-900 font-medium truncate">{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Coordinates */}
                            <div className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                📍 Coordinates: {selected.latitude.toFixed(4)}°N, {selected.longitude.toFixed(4)}°E
                            </div>
                        </div>

                        {/* Action card */}
                        <div className="bg-white rounded-lg shadow p-5">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" />
                                Validation Actions
                            </h3>

                            {selected.status === 'UNVERIFIED' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-700">
                                        This SOS is <strong className="text-orange-600">unverified</strong>. Notify the nearest ward member{' '}
                                        <strong className="text-gray-900">{selected.wardMember}</strong> for on-ground confirmation.
                                    </p>
                                    <button
                                        onClick={() => {
                                            updateStatus(selected.id, 'WARD_NOTIFIED');
                                            alert('Ward member notified via SMS and app!');
                                        }}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Notify Ward Member
                                    </button>
                                </div>
                            )}

                            {selected.status === 'WARD_NOTIFIED' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-700">
                                        Ward member <strong className="text-gray-900">{selected.wardMember}</strong> has been notified.
                                        Awaiting on-ground confirmation.
                                    </p>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-900 font-medium mb-3 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-purple-600" />
                                            Simulate Ward Member Response:
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleWardConfirm(selected.id, true)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm font-semibold hover:bg-green-200 transition-all"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Yes, it's real
                                            </button>
                                            <button
                                                onClick={() => handleWardConfirm(selected.id, false)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-200 transition-all"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                False alarm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selected.status === 'VERIFIED' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Verified by ward member</span>
                                    </div>
                                    <p className="text-sm text-gray-700">This emergency has been confirmed. Dispatch a rescue team immediately.</p>
                                    <button
                                        onClick={() => handleDispatch(selected.id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Dispatch Rescue Team
                                    </button>
                                </div>
                            )}

                            {selected.status === 'DISPATCHED' && (
                                <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-lg">
                                    <Truck className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Rescue team dispatched</div>
                                        <div className="text-xs text-blue-600 mt-0.5">Team is en route to {selected.address}</div>
                                    </div>
                                </div>
                            )}

                            {selected.status === 'FAKE' && (
                                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
                                    <XCircle className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Marked as false alarm</div>
                                        <div className="text-xs text-red-600 mt-0.5">No further action required. Reporter has been flagged.</div>
                                    </div>
                                </div>
                            )}

                            {selected.status === 'RESOLVED' && (
                                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Incident resolved</div>
                                        <div className="text-xs text-green-600 mt-0.5">All affected individuals have been rescued and relocated to safety.</div>
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
