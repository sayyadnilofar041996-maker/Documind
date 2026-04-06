import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DocumentItem from './DocumentItem'
import { Files, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const FILTERS = ['All', 'Ready', 'Processing']

const DocumentList = ({ documents = [], loading }) => {
  const [activeFilter, setActiveFilter] = useState('All')
  const navigate = useNavigate()

  const filtered = documents.filter(doc => {
    if (activeFilter === 'All') return true
    return doc.status?.toLowerCase() === activeFilter.toLowerCase()
  })

  // Loading skeletons
  if (loading && documents.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800 shadow-sm" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      {documents.length > 0 && (
        <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-800 transition-all'
              }`}
            >
              {filter}
              {filter !== 'All' && (
                <span className="ml-2 opacity-60">
                  {documents.filter(d => d.status?.toLowerCase() === filter.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/30 dark:bg-slate-900/10"
        >
          <div className="p-5 bg-primary/10 rounded-2xl mb-4">
            {documents.length === 0
              ? <Upload className="w-10 h-10 text-primary" />
              : <Files className="w-10 h-10 text-primary" />
            }
          </div>
          <h3 className="text-slate-900 dark:text-white font-semibold text-lg tracking-tight">
            {documents.length === 0 ? 'No documents yet' : `No ${activeFilter.toLowerCase()} documents`}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs font-medium">
            {documents.length === 0
              ? 'Upload your first PDF, DOCX, or TXT file to get started.'
              : `Switch to "All" to see your other documents.`
            }
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              >
                <DocumentItem document={doc} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default DocumentList
