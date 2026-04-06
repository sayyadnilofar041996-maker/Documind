import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useUIStore from '../store/uiStore'
import Transition from './Transition'

const MainLayout = () => {
  const { sidebarCollapsed, initDarkMode } = useUIStore()
  const location = useLocation()

  useEffect(() => {
    initDarkMode()
  }, [initDarkMode])

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-300 selection:bg-primary/30">
      <Sidebar />
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Navbar />
        
        <main className={`flex-1 overflow-x-hidden ${location.pathname === '/chat' ? '' : 'p-6 pt-6'}`}>
          <div className={`h-full ${location.pathname === '/chat' ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            <AnimatePresence mode="wait">
              <Transition key={location.pathname}>
                <Outlet />
              </Transition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
