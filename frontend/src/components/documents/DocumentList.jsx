import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DocumentItem from './DocumentItem'
import { Files, Compass, Layers } from 'lucide-react'

const FILTERS = ['All', 'Ready', 'Processing']

const DocumentList = ({ documents = [], loading }) => {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = documents.filter(doc => {
    if (activeFilter === 'All') return true
    return doc.status?.toLowerCase() === activeFilter.toLowerCase()
  })

  if (loading && documents.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-[1.5rem] animate-pulse border border-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Integrated Filter Bar */}
      {documents.length > 0 && (
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center space-x-1 p-1 bg-zinc-100/50 dark:bg-[#0a0a0f] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] rounded-lg">
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 relative group ${
                  activeFilter === filter
                    ? 'text-zinc-900 dark:text-[#fff]'
                    : 'text-zinc-500 hover:text-indigo-600 dark:hover:text-[#fff]'
                }`}
              >
                {activeFilter === filter && (
                  <motion.div 
                    layoutId="activeFilterBg"
                    className="absolute inset-0 bg-white dark:bg-[#0f1117] rounded-md border border-transparent dark:border-white/5 shadow-sm"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{filter}</span>
              </button>
            ))}
          </div>

          <div className="text-[10px] font-bold text-zinc-500 dark:text-white/30 uppercase tracking-[0.2em]">
            {filtered.length} Objects
          </div>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-[#0f1117] rounded-[10px] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)]"
        >
          <div className="relative mb-6">
            <div className="p-6 bg-white dark:bg-[#0a0a0f] rounded-[10px] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] text-zinc-300 dark:text-zinc-700">
              <Layers className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-[#fff] tracking-tight mb-2">
            Repository Empty
          </h3>
          <p className="text-zinc-500 dark:text-white/45 text-sm max-w-sm mx-auto leading-relaxed font-medium px-8">
            {documents.length === 0
              ? "No data streams have been initialized for this workspace. Start by uploading a dataset."
              : `No documentation currently matches the "${activeFilter}" filter criteria.`
            }
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4 pb-10">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((doc, index) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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

