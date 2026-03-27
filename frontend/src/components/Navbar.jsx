import React from 'react'
import { useLocation } from 'react-router-dom'
import { Moon, Sun, User, Bell, Search } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useUIStore from '../store/uiStore'

const Navbar = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { darkMode, toggleDarkMode } = useUIStore()

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1]
    if (!path) return 'Dashboard'
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <nav className="h-16 bg-card border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-white">{getPageTitle()}</h2>
        
        <div className="hidden md:flex relative group ml-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search documents..."
            className="bg-background border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all w-64"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all transform hover:scale-105"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card shadow-lg shadow-primary/20"></span>
        </button>

        <div className="h-8 w-px bg-white/10 mx-2"></div>

        <div className="flex items-center space-x-3 pl-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-white">{user?.username || 'User'}</span>
            <span className="text-xs text-gray-400 capitalize">{user?.role || 'Member'}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group cursor-pointer hover:bg-primary/20 transition-all">
            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
