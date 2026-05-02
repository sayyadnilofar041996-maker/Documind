import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Files, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  BrainCircuit
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useUIStore from '../store/uiStore'

const SidebarItem = ({ icon: Icon, label, path, collapsed }) => {
  const location = useLocation()
  const isActive = location.pathname === path

  return (
    <Link
      to={path}
      className={`relative flex items-center space-x-3 px-3 py-2.5 rounded-[10px] transition-all duration-300 group ${
        isActive 
          ? 'bg-zinc-100 dark:bg-[#7c5cfc]/10 text-zinc-900 dark:text-[#7c5cfc]' 
          : 'text-zinc-500 dark:text-white/45 hover:text-zinc-900 dark:hover:text-[#7c5cfc] hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} strokeWidth={isActive ? 2.5 : 2} />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            className="font-bold whitespace-nowrap text-[13px] tracking-wide"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      
      {isActive && (
        <motion.div 
          layoutId="sidebar-active-indicator"
          className="absolute left-0 w-[3px] h-5 bg-[#7c5cfc] rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  )
}

const Sidebar = () => {
  const { logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Files, label: 'Documents', path: '/documents' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <motion.aside 
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-[#0a0a0f] border-r border-zinc-200 dark:border-[rgba(255,255,255,0.07)] z-50 flex flex-col transition-colors duration-300"
    >
      {/* Professional Header */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-200 dark:border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="relative shrink-0">
            <div className="w-10 h-10 bg-zinc-900 dark:bg-[#0f1117] rounded-[10px] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-[#7c5cfc]" />
            </div>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-[#fff] whitespace-nowrap">
                  DocuMind
                </span>
                <span className="text-[9px] text-indigo-600 dark:text-[#7c5cfc] font-bold uppercase tracking-[0.2em] -mt-1">
                  Neural Portal
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Matrix */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <SidebarItem 
            key={item.path} 
            {...item} 
            collapsed={sidebarCollapsed} 
          />
        ))}
      </nav>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] rounded-full text-zinc-400 hover:text-[#7c5cfc] transition-all shadow-sm z-50 md:flex hidden items-center justify-center hover:scale-110"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User Session */}
      <div className="p-4 border-t border-zinc-200 dark:border-[rgba(255,255,255,0.07)]">
        {!sidebarCollapsed && (
          <div className="px-3 py-4 mb-2 flex items-center space-x-3 group cursor-pointer transition-colors hover:bg-white/5 rounded-[10px]">
            <div className="w-9 h-9 rounded-[10px] bg-zinc-100 dark:bg-[#0f1117] border border-zinc-200 dark:border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-[#7c5cfc]">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-[#fff] truncate">Systems Admin</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">L3 Engineer</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-[10px] text-zinc-500 dark:text-white/45 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group font-bold text-[11px] uppercase tracking-widest ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>End Session</span>}
        </button>
      </div>
    </motion.aside>
  )
}


export default Sidebar
