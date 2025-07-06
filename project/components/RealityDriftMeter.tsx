'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface RealityDriftMeterProps {
  driftLevel: number; // 0-100
  className?: string;
  onLevelChange?: (level: number) => void;
}

export default function RealityDriftMeter({ 
  driftLevel, 
  className = '',
  onLevelChange 
}: RealityDriftMeterProps) {
  const [animatedLevel, setAnimatedLevel] = useState(driftLevel);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [previousLevel, setPreviousLevel] = useState(driftLevel);

  // Animate level changes
  useEffect(() => {
    const duration = 1000; // 1 second animation
    const steps = 60;
    const stepDuration = duration / steps;
    const levelDiff = driftLevel - animatedLevel;
    const stepSize = levelDiff / steps;

    if (Math.abs(levelDiff) > 0.5) {
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setAnimatedLevel(prev => {
          const newLevel = prev + stepSize;
          if (currentStep >= steps) {
            clearInterval(interval);
            return driftLevel;
          }
          return newLevel;
        });
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [driftLevel, animatedLevel]);

  // Track trend
  useEffect(() => {
    const diff = driftLevel - previousLevel;
    if (Math.abs(diff) > 2) {
      setTrend(diff > 0 ? 'up' : 'down');
      setPreviousLevel(driftLevel);
      
      // Reset trend after 3 seconds
      const timeout = setTimeout(() => setTrend('stable'), 3000);
      return () => clearTimeout(timeout);
    }
  }, [driftLevel, previousLevel]);

  const getStatusInfo = (level: number) => {
    if (level <= 20) {
      return {
        status: 'Authentiek',
        color: 'from-green-400 to-emerald-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        icon: CheckCircle,
        description: 'Gesprek verloopt natuurlijk en eerlijk'
      };
    } else if (level <= 40) {
      return {
        status: 'Licht Gefilterd',
        color: 'from-blue-400 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        icon: Activity,
        description: 'Kleine aanpassingen in presentatie'
      };
    } else if (level <= 60) {
      return {
        status: 'Gemaskerd',
        color: 'from-yellow-400 to-orange-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        icon: AlertTriangle,
        description: 'Duidelijke persona wordt gebruikt'
      };
    } else if (level <= 80) {
      return {
        status: 'Sterk Gefilterd',
        color: 'from-orange-400 to-red-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-800',
        icon: Zap,
        description: 'Aanzienlijke afwijking van echte zelf'
      };
    } else {
      return {
        status: 'Volledig Kunstmatig',
        color: 'from-red-500 to-pink-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        icon: Zap,
        description: 'Extreme persona of kunstmatige presentatie'
      };
    }
  };

  const statusInfo = getStatusInfo(animatedLevel);
  const StatusIcon = statusInfo.icon;

  const simulateRandomChange = () => {
    const randomLevel = Math.floor(Math.random() * 100);
    onLevelChange?.(randomLevel);
  };

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${statusInfo.bgColor}`}>
            <StatusIcon className={`w-5 h-5 ${statusInfo.textColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reality Drift Meter</h3>
            <p className="text-sm text-gray-600">Authenticiteit niveau</p>
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="flex items-center space-x-2">
          {trend === 'up' && (
            <div className="flex items-center text-red-500 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Stijgend</span>
            </div>
          )}
          {trend === 'down' && (
            <div className="flex items-center text-green-500 text-sm">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>Dalend</span>
            </div>
          )}
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(animatedLevel)}%
          </span>
        </div>
      </div>

      {/* Meter Bar */}
      <div className="mb-6">
        <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Background gradient zones */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-gradient-to-r from-green-200 to-green-300" />
            <div className="flex-1 bg-gradient-to-r from-blue-200 to-blue-300" />
            <div className="flex-1 bg-gradient-to-r from-yellow-200 to-yellow-300" />
            <div className="flex-1 bg-gradient-to-r from-orange-200 to-orange-300" />
            <div className="flex-1 bg-gradient-to-r from-red-200 to-red-300" />
          </div>
          
          {/* Active level bar */}
          <div 
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${statusInfo.color} transition-all duration-1000 ease-out`}
            style={{ width: `${animatedLevel}%` }}
          />
          
          {/* Animated pulse effect */}
          <div 
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${statusInfo.color} opacity-30 animate-pulse`}
            style={{ width: `${animatedLevel}%` }}
          />
          
          {/* Level indicator */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white shadow-lg rounded-full transition-all duration-1000 ease-out"
            style={{ left: `${animatedLevel}%` }}
          />
        </div>
        
        {/* Scale markers */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status Information */}
      <div className={`p-4 rounded-2xl ${statusInfo.bgColor} mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-semibold ${statusInfo.textColor}`}>
            {statusInfo.status}
          </span>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < Math.ceil(animatedLevel / 20) 
                    ? statusInfo.textColor.replace('text-', 'bg-')
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <p className={`text-sm ${statusInfo.textColor} opacity-80`}>
          {statusInfo.description}
        </p>
      </div>

      {/* Demo Controls */}
      <div className="flex space-x-3">
        <button
          onClick={simulateRandomChange}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Simuleer Verandering
        </button>
        <button
          onClick={() => onLevelChange?.(0)}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-center">
            <div className="w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded mb-1" />
            <span className="text-gray-600">Authentiek</span>
          </div>
          <div className="text-center">
            <div className="w-full h-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded mb-1" />
            <span className="text-gray-600">Licht</span>
          </div>
          <div className="text-center">
            <div className="w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded mb-1" />
            <span className="text-gray-600">Gemaskerd</span>
          </div>
          <div className="text-center">
            <div className="w-full h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded mb-1" />
            <span className="text-gray-600">Sterk</span>
          </div>
          <div className="text-center">
            <div className="w-full h-2 bg-gradient-to-r from-red-500 to-pink-600 rounded mb-1" />
            <span className="text-gray-600">Kunstmatig</span>
          </div>
        </div>
      </div>
    </div>
  );
}