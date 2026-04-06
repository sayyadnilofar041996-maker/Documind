import React, { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import useDocumentStore from '../store/documentStore'
import useChatStore from '../store/chatStore'
import StatsCard from '../components/dashboard/StatsCard'
import RecentDocuments from '../components/dashboard/RecentDocuments'
import RecentChats from '../components/dashboard/RecentChats'
import QuickActions from '../components/dashboard/QuickActions'
import { Files, CheckCircle, MessageSquare } from 'lucide-react'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { documents, fetchDocuments } = useDocumentStore()
  const { sessions } = useChatStore()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Stats calculation
  const totalDocs = documents.length
  const processedDocs = documents.filter(d => d.status === 'ready').length
  const totalChats = sessions.length

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Welcome back, <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">{user?.username || 'User'}</span> <span className="inline-block animate-bounce-short">👋</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg font-medium">
          Here's your intelligence overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700 delay-100">
        <StatsCard 
          title="Total Documents"
          value={totalDocs}
          icon={Files}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          title="Processed"
          value={processedDocs}
          icon={CheckCircle}
        />
        <StatsCard 
          title="Total Chats"
          value={totalChats}
          icon={MessageSquare}
        />
      </div>

      {/* Main Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <RecentDocuments documents={documents} />
        <RecentChats sessions={sessions} />
      </div>

      {/* Quick Actions */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <QuickActions />
      </div>
    </div>
  )
}

export default DashboardPage
