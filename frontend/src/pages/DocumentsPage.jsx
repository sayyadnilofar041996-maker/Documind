import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import UploadBox from '../components/documents/UploadBox'
import DocumentList from '../components/documents/DocumentList'
import useDocumentStore from '../store/documentStore'
import { Files, AlertCircle, ShieldCheck, Zap } from 'lucide-react'

const DocumentsPage = () => {
  const { documents, loading, error, fetchDocuments } = useDocumentStore()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-6 px-2 md:px-4 max-w-[1600px] mx-auto space-y-6 pt-2"
    >

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-6 rounded-2xl flex items-center text-red-600 dark:text-red-400 text-sm font-bold"
        >
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 pt-0">
        <UploadBox />
        
        <div className="space-y-6">
          <DocumentList documents={documents} loading={loading} />
        </div>
      </div>
    </motion.div>
  )
}

export default DocumentsPage

