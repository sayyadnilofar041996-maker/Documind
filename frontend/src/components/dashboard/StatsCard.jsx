import React from 'react'

const StatsCard = ({ title, value, icon: Icon, trend, description }) => {
  return (
    <div className="group bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/50 p-6 rounded-3xl hover:border-transparent hover:shadow-[0_0_2rem_-0.5rem_#3b82f640] transition-all duration-500 shadow-xl backdrop-blur-xl flex flex-col justify-between h-full relative overflow-hidden flex-1 before:absolute before:inset-0 before:p-[1px] before:rounded-3xl before:bg-gradient-to-b before:from-primary/50 before:to-transparent before:-z-10 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity">
      {/* Premium Glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl group-hover:scale-110 shadow-inner border border-primary/10 transition-transform duration-500">
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
        
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export default StatsCard
