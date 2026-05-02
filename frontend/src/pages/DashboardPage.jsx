import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useDocumentStore from '../store/documentStore'
import useChatStore from '../store/chatStore'
import StatsCard from '../components/dashboard/StatsCard'
import RecentDocuments from '../components/dashboard/RecentDocuments'
import RecentActivity from '../components/dashboard/RecentActivity'
import { Files, MessageSquare, Zap } from 'lucide-react'

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-6 max-w-[1400px] mx-auto pt-2 px-4 md:px-8"
    >

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatsCard 
          title="Document Repository"
          value={totalDocs}
          icon={Files}
          trend={{ value: 8.4, isPositive: true }}
          color="#4fa3f7"
        />
        <StatsCard 
          title="Semantic Processing"
          value={processedDocs}
          icon={Zap}
          trend={{ value: 12.1, isPositive: true }}
          color="#7c5cfc"
        />
        <StatsCard 
          title="Intelligence Sessions"
          value={totalChats}
          icon={MessageSquare}
          trend={{ value: 5.2, isPositive: false }}
          color="#10b981"
        />
      </div>

      {/* Workspace Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 min-h-[400px]">
        <RecentDocuments documents={documents} />
        <RecentActivity sessions={sessions} />
      </div>
    </motion.div>
  )
}

export default DashboardPage

