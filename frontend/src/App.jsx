import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DocumentsPage from './pages/DocumentsPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'
import useAuthStore from './store/authStore'
import useUIStore from './store/uiStore'

function App() {
  const { loadUser, token } = useAuthStore()
  const { initDarkMode } = useUIStore()

  useEffect(() => {
    initDarkMode()
    if (token) {
      loadUser()
    }
  }, [token, loadUser, initDarkMode])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans transition-colors duration-500 selection:bg-indigo-500/20">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#09090b',
              color: '#fafafa',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.025em',
              padding: '12px 20px',
            },
            success: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes wrapped in MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
