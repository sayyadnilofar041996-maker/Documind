import React from 'react'
import { MessageSquare, ChevronRight, MessageCircle, Clock, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useChatStore from '../../store/chatStore'

const RecentChats = ({ sessions = [] }) => {
  const navigate = useNavigate()
  const { switchSession } = useChatStore()

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const handleSessionClick = (sessionId) => {
    switchSession(sessionId)
    navigate('/chat')
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 pb-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Activity</h3>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1"
        >
          <span>See All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.slice(0, 5).map((session, index) => (
          <motion.div 
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 group cursor-pointer transition-all duration-300"
            onClick={() => handleSessionClick(session.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 min-w-0">
                <div className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg group-hover:border-indigo-500/50 transition-colors">
                  <MessageSquare className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500" />
                </div>
                <div className="min-w-0 space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {session.title || 'Untitled Session'}
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                      <Clock size={12} />
                      <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                    </div>
                    <span className="text-zinc-300 dark:text-zinc-800">•</span>
                    <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium">{session.messages?.length || 0} messages</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}

        {sessions.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-full text-zinc-300 dark:text-zinc-700">
              <MessageCircle size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No active sessions</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-[240px] text-sm font-medium leading-relaxed">
                Start an intelligent conversation regarding your documentation.
              </p>
            </div>
            <button 
              onClick={() => navigate('/chat')}
              className="btn-primary"
            >
              <span>New Analysis Session</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentChats

