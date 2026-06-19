import React from 'react'
import { FileText, Clock, ChevronRight, Upload, Sparkles, Files } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const RecentDocuments = ({ documents = [] }) => {
  const navigate = useNavigate()
  
  const getStatusStyle = (status) => {
    switch (status) {
      case 'ready': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'processing': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
      case 'failed': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      default: return 'bg-zinc-50 dark:bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-[#0f1117] rounded-[10px] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-4 md:px-6 pb-3 flex items-center justify-between border-b border-zinc-100 dark:border-[rgba(255,255,255,0.07)] shrink-0">
        <h3 className="text-[11px] font-bold text-zinc-900 dark:text-white/45 tracking-widest uppercase">
          Recent Documents
        </h3>
        <button 
          onClick={() => navigate('/documents')}
          className="text-[#4fa3f7] hover:text-[#7c5cfc] text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[250px]">
        {documents.slice(0, 5).map((doc, index) => (
          <motion.div 
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between py-3 px-6 md:px-6 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
            onClick={() => navigate('/documents')}
          >
            <div className="flex items-center space-x-4 min-w-0">
              <FileText className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-indigo-600 dark:group-hover:text-[#4fa3f7] transition-colors" />
              <h4 className="text-sm font-medium text-zinc-900 dark:text-[#fff] truncate group-hover:text-indigo-600 dark:group-hover:text-[#4fa3f7] transition-colors">
                {doc.original_filename || doc.filename}
              </h4>
            </div>
            <div className="flex items-center space-x-4 shrink-0 ml-4">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getStatusStyle(doc.status)}`}>
                {doc.status}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-white/45 w-12 text-right">
                {formatDate(doc.created_at)}
              </span>
            </div>
          </motion.div>
        ))}

        {documents.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 h-full">
            <Upload className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
            <p className="text-zinc-400 dark:text-white/45 text-sm font-medium">
              No documents ingested yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentDocuments

