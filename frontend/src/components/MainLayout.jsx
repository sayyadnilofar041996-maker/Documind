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
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#0a0a0f] text-zinc-900 dark:text-white transition-colors duration-500 selection:bg-indigo-500/20">
      <Sidebar />
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[280px]'
        }`}
      >
        <Navbar />
        
        <main className={`flex-1 overflow-x-hidden ${location.pathname === '/chat' ? '' : 'p-4 md:p-8 lg:p-10'}`}>
          <div className={`h-full ${location.pathname === '/chat' ? 'w-full' : 'max-w-[1400px] mx-auto'}`}>
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
