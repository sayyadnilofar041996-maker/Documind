import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Clock,
  ChevronLeft,
  History
} from 'lucide-react'
import useChatStore from '../../store/chatStore'

const ChatHistory = () => {
  const { 
    sessions, 
    activeSessionId, 
    newSession, 
    switchSession, 
    deleteSession, 
    renameSession,
    historyOpen,
    toggleHistory,
  } = useChatStore()

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const handleNewChat = () => {
    newSession()
  }

  const handleSwitch = (id) => {
    switchSession(id)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    deleteSession(id)
  }

  const startRename = (e, session) => {
    e.stopPropagation()
    setEditingId(session.id)
    setEditTitle(session.title)
  }

  const confirmRename = (e) => {
    e.stopPropagation()
    if (editTitle.trim()) {
      renameSession(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  const cancelRename = (e) => {
    e.stopPropagation()
    setEditingId(null)
  }

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

  // Group sessions by time
  const groupSessions = () => {
    const groups = { today: [], yesterday: [], older: [] }
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart - 86400000)

    sessions.forEach(session => {
      const date = new Date(session.updatedAt || session.createdAt)
      if (date >= todayStart) groups.today.push(session)
      else if (date >= yesterdayStart) groups.yesterday.push(session)
      else groups.older.push(session)
    })

    return groups
  }

  const grouped = groupSessions()

  const renderGroup = (label, items) => {
    if (items.length === 0) return null
    return (
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 px-4 mb-3">
          {label}
        </p>
        <div className="space-y-1">
          {items.map(session => (
            <motion.button
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => handleSwitch(session.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group relative flex items-start space-x-3 ${
                session.id === activeSessionId
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-transparent'
              }`}
            >
              <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                session.id === activeSessionId ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'
              }`} />
              
              <div className="flex-1 min-w-0 pr-6">
                {editingId === session.id ? (
                  <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename(e)
                        if (e.key === 'Escape') cancelRename(e)
                      }}
                      className="flex-1 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1 focus:outline-none focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                      autoFocus
                    />
                    <button onClick={confirmRename} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={cancelRename} className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`text-xs font-bold truncate leading-tight ${
                      session.id === activeSessionId ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {session.title || 'Untitled Session'}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1 flex items-center space-x-2 font-medium">
                      <Clock size={10} />
                      <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                      <span className="opacity-30">·</span>
                      <span>{session.messages.length} messages</span>
                    </p>
                  </>
                )}
              </div>

              {/* Actions (visible on hover) */}
              {editingId !== session.id && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100">
                  <button
                    onClick={(e) => startRename(e, session)}
                    className="p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg shadow-sm transition-all text-zinc-400 hover:text-indigo-500"
                    title="Rename Session"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg shadow-sm transition-all text-zinc-400 hover:text-red-500"
                    title="Delete Session"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Sidebar Command Hub Toggle */}
      {!historyOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleHistory}
          className="absolute left-6 top-6 z-20 p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-xl group"
          title="Session Activity"
        >
          <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </motion.button>
      )}

      {/* Evolution Panel */}
      <AnimatePresence mode="wait">
        {historyOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden shrink-0 relative z-30 shadow-2xl"
          >
            {/* Header Area */}
            <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">Logs</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Archives</p>
                </div>
              </div>
              <button
                onClick={toggleHistory}
                className="p-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-all active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Neural Dispatch Button */}
            <div className="p-6 pb-2 shrink-0">
              <button
                onClick={handleNewChat}
                className="btn-primary w-full flex items-center justify-center space-x-2 text-xs"
              >
                <Plus size={16} />
                <span>Initialize Session</span>
              </button>
            </div>

            {/* Matrix Data Feed */}
            <div className="flex-1 overflow-y-auto px-4 pb-10 mt-4">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 mb-4 items-center justify-center flex">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Repository Empty</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium leading-relaxed italic">Begin an analysis session to record activity logs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {renderGroup('Recent Activity', grouped.today)}
                  {renderGroup('Previous Sessions', grouped.yesterday)}
                  {renderGroup('Archive Data', grouped.older)}
                </div>
              )}
            </div>
            
            {/* Sidebar Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/30">
               <div className="flex items-center justify-between px-2">
                 <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Online</span>
                 </div>
                 <span className="text-[10px] font-bold text-zinc-300 dark:text-zinc-800 uppercase tracking-widest">v5.3.2</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatHistory
