'use client'

import { useState } from 'react'
import {
    Tent, MapPin, Users, Package, Plus, ArrowRightLeft,
    CheckCircle, AlertTriangle, Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SUPPLY_STATUS = {
    SURPLUS: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Surplus', icon: '✅' },
    ADEQUATE: { color: 'bg-green-100 text-green-700 border-green-300', label: 'Adequate', icon: '🟢' },
    LOW: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Low', icon: '🟡' },
    CRITICAL: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Critical', icon: '🔴' },
}

const INITIAL_CAMPS = [
    {
        id: 'camp-001', name: 'Mumbai Relief Centre Alpha', lat: 19.07, lon: 72.87,
        address: 'BKC Ground, Bandra Kurla Complex, Mumbai', state: 'Maharashtra', district: 'Mumbai',
        capacity: 2000, currentOccupancy: 847, status: 'ACTIVE',
        food: 'ADEQUATE', water: 'ADEQUATE', medicine: 'LOW', shelter: 'ADEQUATE',
        adminContact: 'District Collector', adminPhone: '022-26478900',
    },
    {
        id: 'camp-002', name: 'Pune Flood Relief Camp', lat: 18.52, lon: 73.85,
        address: 'SP College Ground, Sadashiv Peth, Pune', state: 'Maharashtra', district: 'Pune',
        capacity: 1500, currentOccupancy: 1420, status: 'FULL',
        food: 'LOW', water: 'ADEQUATE', medicine: 'CRITICAL', shelter: 'ADEQUATE',
        adminContact: 'DM Pune', adminPhone: '020-26123456',
    },
    {
        id: 'camp-003', name: 'Kolhapur Relief Shelter', lat: 16.69, lon: 74.23,
        address: 'Govt. High School Ground, Kolhapur', state: 'Maharashtra', district: 'Kolhapur',
        capacity: 3000, currentOccupancy: 312, status: 'ACTIVE',
        food: 'SURPLUS', water: 'ADEQUATE', medicine: 'ADEQUATE', shelter: 'ADEQUATE',
        adminContact: 'Block Development Officer', adminPhone: '0231-2651234',
    },
    {
        id: 'camp-004', name: 'Nagpur Emergency Camp', lat: 21.15, lon: 79.09,
        address: 'Kasturchand Park, Sitabuldi, Nagpur', state: 'Maharashtra', district: 'Nagpur',
        capacity: 1800, currentOccupancy: 965, status: 'ACTIVE',
        food: 'ADEQUATE', water: 'LOW', medicine: 'ADEQUATE', shelter: 'LOW',
        adminContact: 'Collector Nagpur', adminPhone: '0712-2551234',
    },
]

export default function ReliefCampsPage() {
    const [camps, setCamps] = useState(INITIAL_CAMPS)
    const [selected, setSelected] = useState(INITIAL_CAMPS[0])
    const [showTransfer, setShowTransfer] = useState(false)
    const [fromCamp, setFromCamp] = useState(INITIAL_CAMPS[1].id)
    const [toCamp, setToCamp] = useState(INITIAL_CAMPS[2].id)
    const [transferItem, setTransferItem] = useState('medicine')

    const handleTransfer = () => {
        alert(`Transfer request: ${transferItem} from ${camps.find(c => c.id === fromCamp)?.name?.split(' ')[0]} → ${camps.find(c => c.id === toCamp)?.name?.split(' ')[0]}`)
        setShowTransfer(false)
    }

    const summary = {
        total: camps.length,
        active: camps.filter(c => c.status === 'ACTIVE').length,
        full: camps.filter(c => c.status === 'FULL').length,
        totalCap: camps.reduce((s, c) => s + c.capacity, 0),
        occupied: camps.reduce((s, c) => s + c.currentOccupancy, 0),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Tent className="w-6 h-6 text-purple-600" />
                            Relief Camp Coordination
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">Manage camps, track capacity, monitor supplies, coordinate transfers</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowTransfer(!showTransfer)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm font-medium"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            Transfer
                        </button>
                        <button
                            onClick={() => alert('Add camp form coming soon')}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Camp
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Total Camps', value: summary.total, color: 'text-purple-600' },
                    { label: 'Active', value: summary.active, color: 'text-green-600' },
                    { label: 'At Capacity', value: summary.full, color: 'text-red-600' },
                    { label: 'Total Capacity', value: summary.totalCap.toLocaleString(), color: 'text-blue-600' },
                    { label: 'Currently Housed', value: summary.occupied.toLocaleString(), color: 'text-orange-600' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-lg shadow p-4 text-center">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-600 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Transfer modal */}
            {showTransfer && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-orange-600" />
                        Inter-Camp Supply Transfer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block font-medium">From Camp</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={fromCamp} onChange={e => setFromCamp(e.target.value)}>
                                {camps.map(c => <option key={c.id} value={c.id}>{c.name.split(' ').slice(0, 2).join(' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block font-medium">To Camp</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={toCamp} onChange={e => setToCamp(e.target.value)}>
                                {camps.map(c => <option key={c.id} value={c.id}>{c.name.split(' ').slice(0, 2).join(' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block font-medium">Supply Type</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" value={transferItem} onChange={e => setTransferItem(e.target.value)}>
                                <option value="medicine">Medicine</option>
                                <option value="food">Food</option>
                                <option value="water">Water</option>
                                <option value="shelter">Shelter</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleTransfer} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium">Send Request</button>
                            <button onClick={() => setShowTransfer(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Camp grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {camps.map(camp => {
                        const pct = Math.round((camp.currentOccupancy / camp.capacity) * 100)
                        const isFull = pct >= 100
                        const isLow = pct >= 80
                        return (
                            <button
                                key={camp.id}
                                onClick={() => setSelected(camp)}
                                className={cn(
                                    'bg-white rounded-lg shadow p-5 text-left transition-all border-2',
                                    selected.id === camp.id ? 'border-purple-400' : 'border-transparent hover:border-gray-200'
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-semibold text-gray-900 text-sm">{camp.name}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                            <MapPin className="w-3 h-3" />{camp.district}, {camp.state}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                                        camp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    )}>{camp.status}</span>
                                </div>

                                {/* Occupancy */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-600 flex items-center gap-1"><Users className="w-3 h-3" />Occupancy</span>
                                        <span className={cn('font-bold', isFull ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-green-600')}>
                                            {camp.currentOccupancy}/{camp.capacity} ({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full transition-all duration-500', isFull ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-green-500')}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Supply status */}
                                <div className="grid grid-cols-4 gap-1">
                                    {[
                                        { label: '🍚 Food', key: camp.food },
                                        { label: '💧 Water', key: camp.water },
                                        { label: '💊 Meds', key: camp.medicine },
                                        { label: '⛺ Shelter', key: camp.shelter },
                                    ].map(supply => {
                                        const status = SUPPLY_STATUS[supply.key as keyof typeof SUPPLY_STATUS]
                                        return (
                                            <div key={supply.label} className={cn('rounded-lg p-1.5 text-center border text-[10px]', status.color)}>
                                                <div>{supply.label.split(' ')[0]}</div>
                                                <div className="font-semibold">{status.icon}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Detail pane */}
                <div>
                    {selected && (
                        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Tent className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selected.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                        <MapPin className="w-3 h-3" />{selected.address}
                                    </div>
                                </div>
                            </div>

                            {/* Capacity */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Current Occupancy</span>
                                    <span className="text-sm font-bold text-purple-600">
                                        {selected.currentOccupancy} / {selected.capacity}
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-700"
                                        style={{ width: `${Math.min((selected.currentOccupancy / selected.capacity) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    {Math.round((selected.currentOccupancy / selected.capacity) * 100)}% capacity utilized
                                </p>
                            </div>

                            {/* Supplies */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Supply Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Food', key: selected.food, icon: '🍚' },
                                        { label: 'Water', key: selected.water, icon: '💧' },
                                        { label: 'Medicine', key: selected.medicine, icon: '💊' },
                                        { label: 'Shelter', key: selected.shelter, icon: '⛺' },
                                    ].map(supply => {
                                        const status = SUPPLY_STATUS[supply.key as keyof typeof SUPPLY_STATUS]
                                        return (
                                            <div key={supply.label} className={cn('rounded-lg p-3 border', status.color)}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span>{supply.icon}</span>
                                                    <span className="text-xs font-medium">{supply.label}</span>
                                                </div>
                                                <div className="text-sm font-bold">{status.label}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
                                <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wider">Admin Contact</p>
                                <p className="text-sm font-medium text-gray-900">{selected.adminContact}</p>
                                <a href={`tel:${selected.adminPhone}`} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {selected.adminPhone}
                                </a>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <a
                                    href={`tel:${selected.adminPhone}`}
                                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Admin
                                </a>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <MapPin className="w-4 h-4" />
                                    Directions
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
