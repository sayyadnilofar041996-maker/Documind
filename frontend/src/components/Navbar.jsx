import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Moon, Sun, User, ChevronDown, FileText, Eraser, Check, Search, Globe } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useUIStore from '../store/uiStore'
import useChatStore from '../store/chatStore'
import useDocumentStore from '../store/documentStore'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { darkMode, toggleDarkMode } = useUIStore()
  const { 
    selectedDocument, 
    selectedDocuments,
    toggleDocumentSelection,
    setSelectedDocuments,
    clearHistory
  } = useChatStore()
  const { documents } = useDocumentStore()

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1]
    if (!path) return 'Dashboard'
    if (path === 'chat') return 'AI Assistant'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredDocuments = documents.filter(doc => 
    (doc.original_filename || doc.filename).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isSelected = (docId) => selectedDocuments.some(d => d.id === docId)
  
  const getDropdownLabel = () => {
    if (selectedDocuments.length === 0) return `Global Context (${documents.length})`
    if (selectedDocuments.length === 1) return selectedDocuments[0].original_filename || selectedDocuments[0].filename
    return `${selectedDocuments.length} Documents Selected`
  }

  return (
    <nav className="h-20 bg-white dark:bg-[#0a0a0f] border-b border-zinc-200 dark:border-[rgba(255,255,255,0.07)] px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center space-x-6 shrink-0">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-[#fff] tracking-tight transition-colors uppercase">
          {getPageTitle()}
        </h2>
        {location.pathname === '/chat' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200 dark:border-emerald-500/20 hidden xs:flex">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest leading-none">Stream Active</span>
          </div>
        )}
      </div>

      {/* Chat Tools - Only visible on Chat route */}
      {location.pathname === '/chat' && (
        <div className="flex-1 flex items-center justify-center px-4 space-x-3 transition-all">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-zinc-50 dark:bg-[#0f1117] text-zinc-900 dark:text-[#fff] pl-10 pr-4 py-2 rounded-lg transition-all text-[11px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] focus:outline-none hover:border-[#7c5cfc]/30 min-w-[240px] text-left group"
            >
              <FileText className="absolute left-3.5 w-3.5 h-3.5 text-[#7c5cfc]" />
              <span className="truncate max-w-[180px]">{getDropdownLabel()}</span>
              <ChevronDown className={`ml-auto w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 w-[280px] bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  {/* Search / Filter Area */}
                  <div className="p-2 border-b border-zinc-100 dark:border-[rgba(255,255,255,0.07)]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                      <input 
                        type="text"
                        placeholder="Filter documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-[#0a0a0f] border border-zinc-200 dark:border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-[#fff] placeholder-zinc-500 focus:outline-none focus:border-[#7c5cfc]/30"
                      />
                    </div>
                  </div>

                  {/* List Area */}
                  <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                    {/* Reset Option */}
                    <button
                      onClick={() => {
                        setSelectedDocuments([])
                        setIsDropdownOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="w-4 h-4 rounded border border-zinc-300 dark:border-white/10 flex items-center justify-center bg-zinc-100 dark:bg-[#0a0a0f]">
                        {selectedDocuments.length === 0 && <Check className="w-3 h-3 text-[#7c5cfc]" />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-white/45 uppercase tracking-widest">Global Context</span>
                      </div>
                    </button>

                    <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />

                    {filteredDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => toggleDocumentSelection(doc)}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                          isSelected(doc.id) 
                            ? 'bg-[#7c5cfc] border-[#7c5cfc]' 
                            : 'border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-[#0a0a0f]'
                        }`}>
                          {isSelected(doc.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-tight truncate flex-1 ${
                          isSelected(doc.id) ? 'text-[#fff]' : 'text-zinc-600 dark:text-white/45'
                        }`}>
                          {doc.original_filename || doc.filename}
                        </span>
                      </button>
                    ))}

                    {filteredDocuments.length === 0 && (
                      <div className="px-4 py-8 text-center">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-white/20 uppercase tracking-widest">No matching files</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Stats */}
                  <div className="p-2 border-t border-zinc-100 dark:border-[rgba(255,255,255,0.07)] bg-zinc-50 dark:bg-white/[0.01] flex justify-between items-center px-3">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      {selectedDocuments.length} focused
                    </span>
                    <button 
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-[9px] font-bold text-[#7c5cfc] uppercase tracking-widest hover:underline"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={clearHistory}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-50 dark:bg-[#0f1117] text-zinc-500 dark:text-white/45 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] hover:border-rose-200 dark:hover:border-rose-500/20 group"
          >
            <Eraser className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Flush History</span>
          </button>
        </div>
      )}

      <div className="flex items-center space-x-6 shrink-0">
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 hover:bg-zinc-100 dark:hover:bg-white/[0.03] rounded-lg text-zinc-400 hover:text-[#7c5cfc] transition-all"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-[rgba(255,255,255,0.07)] hidden sm:block"></div>

        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-[11px] font-bold text-zinc-900 dark:text-[#fff] leading-none capitalize tracking-wide">{user?.username || 'Analyst'}</span>
            <span className="text-[9px] text-zinc-500 dark:text-[#7c5cfc] font-bold uppercase tracking-[0.2em] mt-1 opacity-80">Security Tier 1</span>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-zinc-50 dark:bg-[#0f1117] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] flex items-center justify-center text-[#7c5cfc] overflow-hidden transition-all group-hover:border-[#7c5cfc]/30 shadow-sm">
              <User className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
