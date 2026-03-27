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
  const { messages } = useChatStore()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Stats calculation
  const totalDocs = documents.length
  const processedDocs = documents.filter(d => d.status === 'ready').length
  const totalChats = Math.floor(messages.length / 2) // Approximate sessions

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back, <span className="text-primary">{user?.username || 'User'}</span> 👋
        </h1>
        <p className="text-gray-400 mt-2">
          Here’s what’s happening with your documents today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700 delay-100">
        <StatsCard 
          title="Total Documents"
          value={totalDocs}
          icon={Files}
          description="Uploaded files in your library"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard 
          title="Processed"
          value={processedDocs}
          icon={CheckCircle}
          description="Vectorized and ready for chat"
        />
        <StatsCard 
          title="Total Chats"
          value={totalChats}
          icon={MessageSquare}
          description="Messages exchanged with AI"
        />
      </div>

      {/* Main Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <RecentDocuments documents={documents} />
        <RecentChats messages={messages} />
      </div>

      {/* Quick Actions */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <QuickActions />
      </div>
    </div>
  )
}

export default DashboardPage
