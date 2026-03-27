import React from 'react'

const StatsCard = ({ title, value, icon: Icon, trend, description }) => {
  return (
    <div className="group bg-card border border-white/5 p-6 rounded-3xl hover:border-primary/50 transition-all duration-300 shadow-xl backdrop-blur-sm flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export default StatsCard
