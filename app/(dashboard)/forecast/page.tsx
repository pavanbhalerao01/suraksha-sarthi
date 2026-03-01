'use client'

import { useState } from 'react'
import { MapPin, Activity, TrendingUp, AlertTriangle, Info, Cloud, Droplets, Wind, Thermometer } from 'lucide-react'
import { cn, getDisasterIcon, getSeverityColor } from '@/lib/utils'

const DISASTER_MODELS = [
    { id: 'cyclone', label: 'Cyclone', icon: Cloud, endpoint: '/api/prediction?model=cyclone' },
    { id: 'flood', label: 'Flood', icon: Droplets, endpoint: '/api/prediction?model=flood' },
    { id: 'earthquake', label: 'Earthquake', icon: AlertTriangle, endpoint: '/api/prediction?model=earthquake' },
    { id: 'landslide', label: 'Landslide', icon: AlertTriangle, endpoint: '/api/prediction?model=landslide' },
    { id: 'heatwave', label: 'Heatwave', icon: Thermometer, endpoint: '/api/prediction?model=heatwave' },
    { id: 'drought', label: 'Drought', icon: Wind, endpoint: '/api/prediction?model=drought' },
    { id: 'fire', label: 'Forest Fire', icon: Activity, endpoint: '/api/prediction?model=fire' },
]

const PREDICTIONS = [
    {
        id: 1, type: 'cyclone', state: 'Maharashtra', district: 'Raigad', severity: 'CRITICAL',
        confidence: 87.5, date: '2026-02-23', model: 'cyclone_predictor_v3',
        lat: 18.17, lon: 73.03, affectedArea: '1,500 km²', affectedPeople: '85,000',
        description: 'Deep depression in Arabian Sea likely to intensify into a severe cyclonic storm before hitting Maharashtra coast.'
    },
    {
        id: 2, type: 'flood', state: 'Maharashtra', district: 'Kolhapur', severity: 'HIGH',
        confidence: 79.3, date: '2026-02-24', model: 'flood_predictor_v2',
        lat: 16.69, lon: 74.23, affectedArea: '1,200 km²', affectedPeople: '65,000',
        description: 'Panchganga river levels rising due to heavy upstream rainfall. Flooding predicted to affect low-lying areas.'
    },
    {
        id: 3, type: 'earthquake', state: 'Maharashtra', district: 'Latur', severity: 'MEDIUM',
        confidence: 65.2, date: '2026-02-25', model: 'seismic_predictor_v1',
        lat: 18.40, lon: 76.58, affectedArea: '800 km²', affectedPeople: '45,000',
        description: 'Seismic activity detected in Latur region. Moderate earthquake (M4.5-5.5) possible.'
    },
    {
        id: 4, type: 'landslide', state: 'Maharashtra', district: 'Pune', severity: 'MEDIUM',
        confidence: 72.0, date: '2026-02-26', model: 'landslide_predictor_v2',
        lat: 18.52, lon: 73.85, affectedArea: '250 km²', affectedPeople: '15,000',
        description: 'Unstable slopes in Western Ghats due to recent rainfall. Risk of debris flow on mountain roads.'
    },
    {
        id: 5, type: 'heatwave', state: 'Maharashtra', district: 'Chandrapur', severity: 'MEDIUM',
        confidence: 81.0, date: '2026-02-27', model: 'heatwave_predictor_v1',
        lat: 19.95, lon: 79.30, affectedArea: '3,000 km²', affectedPeople: '1.2 Lakh',
        description: 'Temperature forecast to exceed 42°C. Severe heatwave conditions expected in Vidarbha region.'
    },
]

const DAYS = [
    { label: 'Today', date: '21 Feb', day: 0 },
    { label: 'Tomorrow', date: '22 Feb', day: 1 },
    { label: '23 Feb', date: '23 Feb', day: 2 },
    { label: '24 Feb', date: '24 Feb', day: 3 },
    { label: '25 Feb', date: '25 Feb', day: 4 },
    { label: '26 Feb', date: '26 Feb', day: 5 },
    { label: '27 Feb', date: '27 Feb', day: 6 },
]

export default function ForecastPage() {
    const [activeModel, setActiveModel] = useState('all')
    const [selectedDay, setSelectedDay] = useState(0)
    const [selectedPrediction, setSelectedPrediction] = useState<typeof PREDICTIONS[0] | null>(null)

    const filtered = activeModel === 'all' ? PREDICTIONS : PREDICTIONS.filter(p => p.type === activeModel)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">7-Day Disaster Forecast</h1>
                        <p className="text-gray-600 text-sm mt-1">AI-powered disaster predictions for Maharashtra districts</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
                        <Activity className="w-3 h-3" />
                        <span className="font-medium">ML Models Active</span>
                    </div>
                </div>
            </div>

            {/* ML Model selector */}
            <div className="bg-white rounded-lg shadow p-5">
                <p className="text-xs text-gray-600 font-medium mb-3 flex items-center gap-1.5">
                    <Info className="w-3 h-3" />
                    Select disaster type / ML model endpoint
                </p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveModel('all')}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            activeModel === 'all'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                    >
                        All Models
                    </button>
                    {DISASTER_MODELS.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setActiveModel(m.id)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                                activeModel === m.id
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                        >
                            <m.icon className="w-4 h-4" />
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 7-day timeline */}
            <div className="bg-white rounded-lg shadow p-5">
                <p className="text-xs text-gray-600 font-medium mb-3">7-Day Forecast Timeline</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {DAYS.map((d) => {
                        const hasEvent = filtered.some(p => p.date.includes(d.date.split(' ')[0]))
                        return (
                            <button
                                key={d.day}
                                onClick={() => setSelectedDay(d.day)}
                                className={cn(
                                    'flex flex-col items-center px-4 py-2.5 rounded-lg border min-w-[80px] transition-all duration-200',
                                    selectedDay === d.day
                                        ? 'bg-purple-50 border-purple-300 text-purple-600'
                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                )}
                            >
                                <span className="text-xs font-medium">{d.label}</span>
                                <span className="text-[10px] text-gray-500 mt-0.5">{d.date}</span>
                                {hasEvent && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Predictions</div>
                    <div className="text-2xl font-bold text-purple-600">{filtered.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Critical Alerts</div>
                    <div className="text-2xl font-bold text-red-600">{filtered.filter(p => p.severity === 'CRITICAL').length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">High Risk</div>
                    <div className="text-2xl font-bold text-orange-600">{filtered.filter(p => p.severity === 'HIGH').length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600 mb-1">Avg Confidence</div>
                    <div className="text-2xl font-bold text-green-600">
                        {filtered.length > 0 ? Math.round(filtered.reduce((a, b) => a + b.confidence, 0) / filtered.length) : 0}%
                    </div>
                </div>
            </div>

            {/* Prediction Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedPrediction(p)}
                        className={cn(
                            'bg-white rounded-lg shadow p-5 text-left transition-all hover:shadow-lg border-2',
                            selectedPrediction?.id === p.id ? 'border-purple-400' : 'border-transparent'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-3xl">{getDisasterIcon(p.type)}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-semibold text-gray-900 capitalize">{p.type}</span>
                                    <span className={cn(
                                        'px-2 py-0.5 rounded text-[10px] font-semibold uppercase',
                                        p.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                        p.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    )}>
                                        {p.severity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                    <MapPin className="w-3 h-3" />
                                    {p.district}, {p.state}
                                </div>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs text-gray-500">📅 {p.date}</div>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                        <span className="text-xs font-bold text-green-600">{p.confidence}%</span>
                                    </div>
                                </div>
                                {/* Confidence bar */}
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                                        style={{ width: `${p.confidence}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1 font-mono">model: {p.model}</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Detail panel */}
            {selectedPrediction && (
                <div className={cn(
                    'bg-white rounded-lg shadow-lg p-6 border-l-4',
                    selectedPrediction.severity === 'CRITICAL' ? 'border-red-500' :
                    selectedPrediction.severity === 'HIGH' ? 'border-orange-500' :
                    'border-yellow-500'
                )}>
                    <div className="flex items-start gap-4">
                        <span className="text-5xl">{getDisasterIcon(selectedPrediction.type)}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                                <h3 className="text-xl font-bold text-gray-900 capitalize">
                                    {selectedPrediction.type} — {selectedPrediction.district}, {selectedPrediction.state}
                                </h3>
                                <span className={cn(
                                    'px-3 py-1 rounded-full text-xs font-semibold uppercase',
                                    selectedPrediction.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                    selectedPrediction.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                    'bg-yellow-100 text-yellow-700'
                                )}>
                                    {selectedPrediction.severity}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-4">{selectedPrediction.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Confidence', value: `${selectedPrediction.confidence}%`, color: 'purple' },
                                    { label: 'Predicted Date', value: selectedPrediction.date, color: 'blue' },
                                    { label: 'Affected Area', value: selectedPrediction.affectedArea, color: 'orange' },
                                    { label: 'People at Risk', value: selectedPrediction.affectedPeople, color: 'red' },
                                ].map(item => (
                                    <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                                        <div className="text-sm font-bold text-gray-900">{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedPrediction(null)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >✕</button>
                    </div>
                </div>
            )}
        </div>
    )
}
