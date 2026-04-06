import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, Clock, CheckCircle, Loader2, AlertCircle, FileText, FileType, FileCode } from 'lucide-react'
import useDocumentStore from '../../store/documentStore'
import client from '../../api/client'
import toast from 'react-hot-toast'

const DocumentItem = ({ document }) => {
  const { deleteDocument } = useDocumentStore()

  const getFileIcon = (filename = '') => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return { icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' }
      case 'docx':
      case 'doc':
        return { icon: FileType, color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'txt':
        return { icon: FileCode, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10 dark:bg-slate-400/10' }
      default:
        return { icon: FileText, color: 'text-primary', bg: 'bg-primary/10' }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            Ready
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            Pending
          </span>
        )
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const handleOpen = async () => {
    try {
      const toastId = toast.loading('Opening document...')
      const response = await client.get(`/documents/${document.id}/file`, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(response.data)
      window.open(blobUrl, '_blank')
      toast.dismiss(toastId)
    } catch (err) {
      toast.error('Failed to open document')
      console.error(err)
    }
  }

  const filename = document.original_filename || document.filename || document.name || 'Untitled'
  const { icon: FileIcon, color, bg } = getFileIcon(filename)

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={handleOpen}
      className="group bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 shadow-sm hover:shadow-lg cursor-pointer"
    >
      {/* File Icon */}
      <div className={`shrink-0 p-3 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-200`}>
        <FileIcon className={`w-5 h-5 ${color}`} />
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[260px] group-hover:text-primary transition-colors">
          {filename}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3" />
            {formatDate(document.created_at)}
          </span>
          <span className="text-xs text-slate-300 dark:text-slate-700">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formatSize(document.size)}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        {getStatusBadge(document.status)}
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); deleteDocument(document.id); }}
        className="shrink-0 p-2 rounded-xl text-slate-400 dark:text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        title="Delete document"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default DocumentItem
