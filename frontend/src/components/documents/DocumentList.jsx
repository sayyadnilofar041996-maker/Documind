import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DocumentItem from './DocumentItem'
import { Files } from 'lucide-react'

const DocumentList = ({ documents = [], loading }) => {
  if (loading && (documents || []).length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 text-center bg-card/30 border border-dashed border-white/10 rounded-3xl"
      >
        <div className="p-4 bg-primary/10 rounded-2xl mb-4 animate-float">
          <Files className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No documents yet</h3>
        <p className="text-gray-400 max-w-sm">
          Upload your first PDF or DOCX file to start analyzing with DocuMind AI.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <AnimatePresence mode="popLayout">
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <DocumentItem document={doc} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default DocumentList
