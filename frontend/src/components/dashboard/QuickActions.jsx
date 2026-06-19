import React from 'react'
import { Upload, PlusCircle, Search, Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      title: 'Analyze New File',
      description: 'Ingest & Index Neural Data',
      icon: Upload,
      color: 'text-primary',
      bg: 'bg-primary/20',
      onClick: () => navigate('/documents')
    },
    {
      title: 'Neural Dispatch',
      description: 'Start AI conversation',
      icon: PlusCircle,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/20',
      onClick: () => navigate('/chat')
    },
    {
      title: 'Global Search',
      description: 'Query across all indices',
      icon: Search,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/20',
      onClick: () => navigate('/documents')
    }
  ]

  return (
    <div className="glass-card rounded-[3rem] p-10 border border-white/5 h-full relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
      
      <div className="flex items-center space-x-4 mb-10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 blur-lg rounded-xl" />
          <div className="relative p-3 bg-slate-900 border border-white/10 rounded-xl">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight uppercase font-display leading-none">Quick Start</h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Intelligence Hub</p>
        </div>
      </div>

      <div className="space-y-5">
        {actions.map((action, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ x: 8 }}
            onClick={action.onClick}
            className="w-full flex items-center space-x-5 p-5 rounded-[2rem] bg-slate-950/40 hover:bg-primary/10 border border-white/5 hover:border-primary/20 transition-all duration-500 group text-left relative overflow-hidden"
          >
            <div className={`relative p-4 rounded-2xl ${action.bg} ${action.color} group-hover:scale-110 transition-all duration-500`}>
               <div className="absolute inset-0 bg-current blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
               <action.icon className="w-6 h-6 relative z-10" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-white tracking-tight group-hover:text-primary transition-colors leading-tight">{action.title}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-10 p-6 bg-gradient-to-br from-indigo-500/10 via-primary/10 to-transparent rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
        <div className="absolute -top-4 -right-4 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Rocket className="w-20 h-20 rotate-12" />
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Priority Access</h4>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
          Unlock the fully automated API lifecycle and batch processing in your control panel.
        </p>
      </div>
    </div>
  )
}


export default QuickActions

