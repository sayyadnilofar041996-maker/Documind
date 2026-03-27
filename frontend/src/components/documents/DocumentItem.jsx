import React from 'react'
import { FileText, Trash2, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import useDocumentStore from '../../store/documentStore'

const DocumentItem = ({ document }) => {
  const { deleteDocument } = useDocumentStore()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="group bg-card hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-4 rounded-xl transition-all duration-200 flex items-center justify-between">
      <div className="flex items-center space-x-4 min-w-0">
        <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-medium truncate group-hover:text-primary transition-colors">
            {document.filename || document.name}
          </h3>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(document.created_at)}
            </span>
            <span className="text-xs text-gray-500">
              {formatSize(document.size)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-background/50 px-3 py-1.5 rounded-lg border border-white/5">
          {getStatusIcon(document.status)}
          <span className="text-xs font-medium text-gray-300 capitalize">
            {document.status}
          </span>
        </div>

        <button
          onClick={() => deleteDocument(document.id)}
          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default DocumentItem
