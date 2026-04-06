import React from 'react'
import { MessageSquare, ChevronRight, MessageCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

  if (sessions.length === 0) {
    return (
      <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
          <MessageCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">No chats yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start a conversation with AI Assistant</p>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 transition-colors text-sm font-medium"
        >
          New Chat
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
        <button 
          onClick={() => navigate('/chat')}
          className="text-primary text-sm font-medium hover:underline"
        >
          Go to Chat
        </button>
      </div>
      <div className="flex-1 overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
        {sessions.slice(0, 5).map((session) => (
          <div 
            key={session.id}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between group cursor-pointer transition-colors"
            onClick={() => handleSessionClick(session.id)}
          >
            <div className="flex items-center space-x-4 min-w-0">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.title || 'New Chat'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                  <span>·</span>
                  <span>{session.messages.length} messages</span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentChats
