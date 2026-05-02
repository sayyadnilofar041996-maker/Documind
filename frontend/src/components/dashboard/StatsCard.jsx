import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ title, value, icon: Icon, trend, color = "#4fa3f7" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-zinc-50 dark:bg-[#0f1117] p-5 rounded-[10px] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] relative flex flex-col justify-between min-h-[130px] transition-all duration-300 shadow-sm overflow-hidden"
    >
      {/* Accent Border Strip */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[4px]" 
        style={{ backgroundColor: color }}
      />

      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 dark:text-white/45 pl-1">
          {title}
        </span>
        
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            trend.isPositive 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}>
            {trend.isPositive ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3 pl-1">
        <h3 className="text-4xl font-extrabold text-zinc-900 dark:text-[#fff] tabular-nums tracking-tight">
          {value}
        </h3>
        <Icon className="w-6 h-6 opacity-80" style={{ color }} />
      </div>
    </motion.div>
  )
}

export default StatsCard

