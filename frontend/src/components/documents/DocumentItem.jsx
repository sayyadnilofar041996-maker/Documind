import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, Clock, CheckCircle, Loader2, AlertCircle, FileText, FileType, FileCode, Presentation, FileSpreadsheet, ExternalLink } from 'lucide-react'
import useDocumentStore from '../../store/documentStore'
import client from '../../api/client'
import toast from 'react-hot-toast'

const DocumentItem = ({ document }) => {
  const { deleteDocument } = useDocumentStore()

  const getFileIcon = (filename = '') => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return { icon: FileText, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' }
      case 'docx':
      case 'doc':
        return { icon: FileType, color: 'text-[#4fa3f7]', bg: 'bg-indigo-50 dark:bg-[#4fa3f7]/10' }
      case 'pptx':
      case 'ppt':
        return { icon: Presentation, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' }
      case 'xlsx':
      case 'xls':
      case 'csv':
        return { icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
      default:
        return { icon: FileCode, color: 'text-[#4fa3f7]', bg: 'bg-indigo-50 dark:bg-[#4fa3f7]/10' }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Ready
          </div>
        )
      case 'processing':
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded animate-pulse text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Processing</span>
          </div>
        )
      case 'failed':
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Error
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-2 px-3 py-1 bg-zinc-50 dark:bg-zinc-500/10 border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] rounded text-[10px] font-bold text-zinc-500 dark:text-white/45 uppercase tracking-wider">
            Queued
          </div>
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

  const handleOpen = async (e) => {
    e.stopPropagation()
    try {
      const toastId = toast.loading('Initializing preview...')
      const response = await client.get(`/documents/${document.id}/file`, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(response.data)
      window.open(blobUrl, '_blank')
      toast.dismiss(toastId)
    } catch (err) {
      toast.error('Failed to initialize preview')
      console.error(err)
    }
  }

  const filename = document.original_filename || document.filename || document.name || 'Data_Stream'
  const { icon: FileIcon, color, bg } = getFileIcon(filename)

  return (
    <div className="group relative">
      <div 
        className="relative bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] p-4 rounded-[10px] transition-all duration-300 flex items-center gap-6 cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/[0.02] shadow-sm"
        onClick={handleOpen}
      >
        {/* File Icon */}
        <div className={`shrink-0 p-3 rounded-lg ${bg} border border-transparent group-hover:scale-105 transition-transform duration-300`}>
          <FileIcon className={`w-6 h-6 ${color}`} />
        </div>

        {/* File Info */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-[#fff] truncate transition-colors">
            {filename}
          </h4>
          <div className="flex items-center space-x-3 mt-1 underline-offset-4">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-white/45 flex items-center uppercase tracking-widest">
              {formatDate(document.created_at)}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-[#4fa3f7] uppercase tracking-widest">{formatSize(document.size)}</span>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-4">
          <div className="shrink-0">
            {getStatusBadge(document.status)}
          </div>

          <div className="flex items-center">
             <button
              onClick={(e) => { e.stopPropagation(); deleteDocument(document.id); }}
              className="p-2 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all active:scale-95"
              title="Remove Item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentItem

