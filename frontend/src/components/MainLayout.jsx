import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import useUIStore from '../store/uiStore'
import Transition from './Transition'

const MainLayout = () => {
  const { sidebarCollapsed } = useUIStore()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background text-white selection:bg-primary/30">
      <Sidebar />
      
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Navbar />
        
        <main className="flex-1 p-6 overflow-x-hidden pt-20">
          <div className="max-w-7xl mx-auto h-full">
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
