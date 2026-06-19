import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, ArrowUpRight, Activity } from 'lucide-react'

const AnalyticsPanel = () => {
  // Mock data for visualization
  const activities = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 72 },
    { day: 'Wed', value: 58 },
    { day: 'Thu', value: 85 },
    { day: 'Fri', value: 65 },
    { day: 'Sat', value: 40 },
    { day: 'Sun', value: 55 },
  ]

  const maxVal = Math.max(...activities.map(a => a.value))

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Intelligence Activity</h3>
            <p className="text-xs text-slate-500 font-medium">Daily processing volume</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
          <ArrowUpRight className="w-3 h-3" />
          <span className="text-[10px] font-bold tracking-wider uppercase">+24%</span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="flex items-end justify-between h-48 px-2 space-x-2">
        {activities.map((item, index) => (
          <div key={item.day} className="flex flex-col items-center flex-1 space-y-3 group">
            <div className="w-full relative flex flex-col items-center justify-end h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxVal) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                className={`w-full max-w-[32px] rounded-t-xl relative group-hover:brightness-125 transition-all duration-300 ${
                  index === 3 ? 'bg-primary shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/10'
                }`}
              >
                {/* Tooltip on Hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap z-20">
                  {item.value} units
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.day}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg. Response</span>
          <p className="text-lg font-bold text-white">1.2s</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Efficiency</span>
          <p className="text-lg font-bold text-indigo-400">98.4%</p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPanel
