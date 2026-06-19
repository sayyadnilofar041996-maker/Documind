import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, Loader2, Info, Sparkles, AlertCircle } from 'lucide-react'
import useDocumentStore from '../../store/documentStore'
import toast from 'react-hot-toast'

const UploadBox = () => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const { uploadDocument, uploading } = useDocumentStore()

  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/x-python',
      'text/javascript',
      'text/typescript',
      'text/markdown',
      'text/css',
      'text/html',
      'text/x-java-source',
      'text/x-java',
      'text/x-c',
      'text/x-chdr',
      'text/x-c++src',
      'text/x-c++hdr',
    ]
    const maxSize = 20 * 1024 * 1024 // 20MB
    const codeExtPattern = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|py|js|jsx|ts|tsx|md|css|html|java|c|cpp|h|hpp|rb|go|rs|php|swift|kt|sh|json|sql)$/i

    if (!allowedTypes.includes(file.type) && !file.name.match(codeExtPattern)) {
      toast.error('Invalid file type. Project supports PDF, Office, and all major code files.')
      return false
    }

    if (file.size > maxSize) {
      toast.error('File size exceeds 20MB limit.')
      return false
    }

    return true
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const onButtonClick = () => {
    fileInputRef.current.click()
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    const success = await uploadDocument(selectedFile)
    if (success) {
      setSelectedFile(null)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#0f1117] p-4 rounded-[10px] border border-[rgba(255,255,255,0.07)] shadow-sm"
    >
      <div
        className={`relative border-2 border-dashed rounded-[10px] p-6 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer overflow-hidden ${ 
          dragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-[#4fa3f7]/10 dark:border-[#4fa3f7] shadow-lg dark:shadow-[0_0_15px_rgba(79,163,247,0.1)]'
            : 'border-zinc-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-[#4fa3f7]/50 hover:bg-zinc-50 dark:hover:bg-[#4fa3f7]/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!selectedFile ? onButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.py,.js,.jsx,.ts,.tsx,.md,.css,.html,.java,.c,.cpp,.h,.hpp,.rb,.go,.rs,.php,.swift,.kt,.sh,.json,.sql"
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center space-y-6 relative z-10"
            >
              <div className={`p-4 rounded-lg bg-white dark:bg-[#0a0a0f] border border-zinc-200 dark:border-white/10 shadow-sm transition-all duration-300 ${dragActive ? 'scale-110 border-indigo-500 dark:border-[#4fa3f7]' : ''}`}>
                <Upload className={`w-6 h-6 text-zinc-400 dark:text-zinc-600 transition-colors ${dragActive ? 'text-indigo-500 dark:text-[#4fa3f7]' : ''}`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-[#fff] tracking-tight">
                  {dragActive ? 'Release to Upload' : 'Upload Documents'}
                </h3>
                <p className="text-[12px] text-zinc-500 dark:text-white/45 font-medium max-w-[450px] leading-relaxed">
                  Support for <span className="text-indigo-600 dark:text-[#4fa3f7] font-semibold">PDF, Word, Excel, PPT, CSV,</span> and over 20+ <span className="text-indigo-600 dark:text-[#4fa3f7] font-semibold">Source Code</span> formats including PY, JS, TS, C++, and SQL.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full space-y-8 relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-zinc-50 dark:bg-[#0a0a0f] border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] p-6 rounded-[10px] flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4 overflow-hidden text-left">      
                  <div className="p-3 bg-white dark:bg-[#0f1117] rounded-lg border border-zinc-200 dark:border-white/10 shadow-sm">
                    <File className="w-6 h-6 text-indigo-500 dark:text-[#4fa3f7]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-[#fff] truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-white/45 font-medium uppercase tracking-wider">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Binary Stream
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 btn-primary space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Vectorizing...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Process Document</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default UploadBox

