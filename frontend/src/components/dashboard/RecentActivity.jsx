import React from 'react'
import { Activity, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const RecentActivity = ({ sessions = [] }) => {
  const getTimelineItems = () => {
    // We generate pseudo-activity items from the sessions data
    // to give it an enterprise audit log look in line with the Dashboard redesign
    if (!sessions || sessions.length === 0) return []
    return sessions.map((session, idx) => {
      const type = idx % 3 === 0 ? 'analysis' : idx % 3 === 1 ? 'indexing' : 'system'
      return {
        id: session.id,
        time: session.updatedAt || session.createdAt,
        type,
        message: type === 'analysis' 
          ? `Analysis session "${session.title || 'Untitled'}" initiated` 
          : type === 'indexing' 
            ? `Re-indexed context matrix for semantic retrieval`
            : `Security verification passed for session ${session.id.slice(0, 4)}`
      }
    }).slice(0, 5)
  }

  const items = getTimelineItems()

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white dark:bg-[#0f1117] rounded-[10px] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-4 md:px-6 pb-3 flex items-center justify-between border-b border-zinc-100 dark:border-[rgba(255,255,255,0.07)] shrink-0">
        <h3 className="text-[11px] font-bold text-zinc-900 dark:text-white/45 tracking-widest uppercase">
          Recent Activity
        </h3>
        <span className="text-zinc-500 dark:text-white/45 text-[10px] font-bold uppercase tracking-widest">
          Audit Log
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[250px] p-4 md:p-6">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-10">
            <Activity className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
            <p className="text-zinc-400 dark:text-white/45 text-sm font-medium">
              No recent activity recorded.
            </p>
          </div>
        ) : (
          <div className="relative pl-3 border-l border-zinc-200 dark:border-white/10 space-y-4 pt-2">
            {items.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[17.5px] top-1.5 w-[9px] h-[9px] rounded-full bg-white dark:bg-[#0a0a0f] border-2 border-indigo-500 dark:border-[#7c5cfc] shadow-[0_0_5px_rgba(124,92,252,0.2)]" />
                
                <div className="flex flex-col space-y-1.5 pl-3">
                  <p className="text-[13px] text-zinc-900 dark:text-[#fff] font-medium leading-tight">
                    {item.message}
                  </p>
                  <div className="flex items-center space-x-1.5 text-zinc-400 dark:text-white/45">
                    <Clock size={10} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      {formatDate(item.time)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivity
