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
      className={`relative flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-primary transition-colors'}`} />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {isActive && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/20"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
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
      animate={{ width: sidebarCollapsed ? 80 : 256 }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-white/5 z-50 flex flex-col glass"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-xl tracking-tight text-white whitespace-nowrap"
              >
                DocuMind
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <SidebarItem 
            key={item.path} 
            {...item} 
            collapsed={sidebarCollapsed} 
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:bg-red-500/10 transition-all group ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!sidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar
