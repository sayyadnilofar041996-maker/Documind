import React from 'react'
import { useLocation } from 'react-router-dom'
import { Moon, Sun, User, ChevronDown, FileText, Eraser } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useUIStore from '../store/uiStore'
import useChatStore from '../store/chatStore'
import useDocumentStore from '../store/documentStore'

const Navbar = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { darkMode, toggleDarkMode } = useUIStore()
  const { 
    selectedDocument, 
    setSelectedDocument, 
    clearHistory
  } = useChatStore()
  const { documents } = useDocumentStore()

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1]
    if (!path) return 'Dashboard'
    if (path === 'chat') return 'AI Assistant'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  const handleDocumentChange = (e) => {
    const docId = e.target.value
    if (!docId) {
      setSelectedDocument(null)
      return
    }
    const doc = documents.find(d => d.id === docId)
    setSelectedDocument(doc)
  }

  return (
    <nav className="h-16 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center space-x-3 shrink-0">
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
          {getPageTitle()}
        </h2>
        {location.pathname === '/chat' && (
          <div className="flex items-center space-x-2 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20 hidden xs:flex">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[8px] text-green-600 dark:text-green-400 font-bold uppercase tracking-widest">Live</span>
          </div>
        )}
      </div>

      {/* Chat Tools - Only visible on Chat route */}
      {location.pathname === '/chat' && (
        <div className="flex-1 flex items-center justify-center px-4 space-x-2 md:space-x-4 animate-in fade-in zoom-in-95 duration-500">
          


          {/* Context Selector */}
          <div className="relative group flex items-center">
            <div className="relative">
              <select
                value={selectedDocument?.id || ''}
                onChange={handleDocumentChange}
                className="appearance-none bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white pl-8 pr-9 py-1.5 rounded-xl transition-all text-[10px] border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-primary/50 cursor-pointer min-w-[140px] md:min-w-[180px]"
              >
                <option value="" className="bg-white dark:bg-slate-900">All Context ({documents.length})</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id} className="bg-white dark:bg-slate-900">
                    {doc.original_filename || doc.filename}
                  </option>
                ))}
              </select>
              <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary opacity-70" />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          <button 
            onClick={clearHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary rounded-xl transition-all text-[10px] border border-slate-200 dark:border-slate-800 group"
          >
            <Eraser className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-bold uppercase tracking-wider">Clear</span>
          </button>
        </div>
      )}

      <div className="flex items-center space-x-3 shrink-0">
        <button 
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary transition-all transform hover:scale-105"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>



        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="flex items-center space-x-2 pl-1">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-none capitalize">{user?.username || 'User'}</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{user?.role || 'Member'}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group cursor-pointer hover:bg-primary/20 transition-all">
            <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
