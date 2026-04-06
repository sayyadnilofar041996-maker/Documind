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
      <div className="mb-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-3 mb-2">
          {label}
        </p>
        <div className="space-y-0.5">
          {items.map(session => (
            <motion.button
              key={session.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => handleSwitch(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative flex items-start space-x-2.5 ${
                session.id === activeSessionId
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-transparent'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                session.id === activeSessionId ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
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
                      className="flex-1 text-xs bg-white dark:bg-slate-800 border border-primary/30 rounded-lg px-2 py-0.5 focus:outline-none focus:border-primary text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <button onClick={confirmRename} className="p-0.5 text-green-500 hover:bg-green-500/10 rounded">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={cancelRename} className="p-0.5 text-red-400 hover:bg-red-500/10 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`text-xs font-semibold truncate leading-tight ${
                      session.id === activeSessionId ? 'text-primary' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {session.title || 'New Chat'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                      <span>·</span>
                      <span>{session.messages.length} msgs</span>
                    </p>
                  </>
                )}
              </div>

              {/* Actions (visible on hover) */}
              {editingId !== session.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => startRename(e, session)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Rename"
                  >
                    <Edit3 className="w-3 h-3 text-slate-400" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
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
      {/* Toggle Button (when closed) */}
      {!historyOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleHistory}
          className="absolute left-3 top-3 z-20 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-lg group"
          title="Chat History"
        >
          <History className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
        </motion.button>
      )}

      {/* History Panel */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full glass border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shrink-0 shadow-premium"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight font-display">Chat History</h3>
              </div>
              <button
                onClick={toggleHistory}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3 shrink-0">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-none">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No conversations yet</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">Start a new chat to begin</p>
                </div>
              ) : (
                <>
                  {renderGroup('Today', grouped.today)}
                  {renderGroup('Yesterday', grouped.yesterday)}
                  {renderGroup('Older', grouped.older)}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatHistory
