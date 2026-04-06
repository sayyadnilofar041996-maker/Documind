import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, Loader2, Info } from 'lucide-react'
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/x-python',
      'text/javascript',
      'text/typescript',
      'text/markdown',
      'text/css',
      'text/html',
      'text/x-java-source',
      'text/x-c',
      'text/x-c++src',
    ]
    const maxSize = 20 * 1024 * 1024 // 20MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt|py|js|jsx|ts|tsx|md|css|html|java|c|cpp|h|hpp|rb|go|rs|php|swift|kt)$/i)) {
      toast.error('Invalid file type. Supported: PDF, DOCX, TXT & code files.')
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl transition-all duration-300"
    >
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer ${ 
          dragActive
            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]'
            : 'border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.docx,.txt,.py,.js,.jsx,.ts,.tsx,.md,.css,.html,.java,.c,.cpp,.h,.hpp,.rb,.go,.rs,.php,.swift,.kt"
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className={`p-5 rounded-2xl transition-all duration-300 ${dragActive ? 'bg-primary/20 scale-110' : 'bg-primary/10'}`}>
                <Upload className={`w-10 h-10 text-primary transition-transform ${dragActive ? 'scale-125' : ''}`} />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {dragActive ? '🎯 Drop your file here!' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  PDF, DOCX, TXT & Code files (.py, .js, .ts, .md, etc.) · Max 20MB
                </p>
              </div>
              <button
                onClick={onButtonClick}
                className="px-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 transition-all font-semibold active:scale-95 shadow-sm"
              >
                Browse Files
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full space-y-6"
            >
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden">
                <div className="flex items-center space-x-4 overflow-hidden">      
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <File className="w-6 h-6 text-primary flex-shrink-0" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="p-2 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <Info className="w-4 h-4 text-primary" />
                <span>By uploading, you agree to our processing terms.</span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    'Confirm Upload'
                  )}
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
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
