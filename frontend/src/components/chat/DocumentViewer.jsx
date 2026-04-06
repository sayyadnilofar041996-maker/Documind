import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useChatStore from '../../store/chatStore'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const DocumentViewer = () => {
  const { activeCitation, clearActiveCitation } = useChatStore()
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (activeCitation?.page_number) {
      setPageNumber(activeCitation.page_number)
    }
  }, [activeCitation])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const onDocumentLoadError = (err) => {
    console.error('PDF Load Error:', err)
    setError('Failed to load document. It may have been deleted or moved.')
    setIsLoading(false)
  }

  if (!activeCitation) return null

  const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/documents/${activeCitation.document_id}/file`
  const token = localStorage.getItem('documind-auth-token')

  // Text highlighting logic for react-pdf
  const makeTextRenderer = (searchText) => (textItem) => {
    if (!searchText) return textItem.str
    
    // Simple case-insensitive match
    const parts = textItem.str.split(new RegExp(`(${searchText})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === searchText.toLowerCase() ? (
        <mark key={index} className="bg-yellow-300/60 dark:bg-yellow-500/40 rounded-sm px-0.5 text-inherit">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-screen w-full lg:w-[45%] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-[60] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">
              {activeCitation.document_name}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              Source Citation • Page {pageNumber} of {numPages || '...'}
            </p>
          </div>
        </div>
        <button
          onClick={clearActiveCitation}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-6 text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(prev => prev - 1)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold min-w-[60px] text-center uppercase tracking-tighter">
             {pageNumber} / {numPages || '--'}
          </span>
          <button 
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(prev => prev + 1)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(prev => Math.min(2.5, prev + 0.2))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 lg:p-8 flex justify-center scrollbar-thin">
        <div className="relative shadow-2xl origin-top transition-transform duration-300">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 rounded-lg">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Loading Source...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Oops!</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">{error}</p>
            </div>
          )}

          <Document
            file={{
              url: fileUrl,
              httpHeaders: { 'Authorization': `Bearer ${token}` }
            }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              customTextRenderer={makeTextRenderer(activeCitation.text)}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              className="shadow-inner"
            />
          </Document>
        </div>
      </div>
      
      {/* Context Banner */}
      <div className="p-4 bg-primary/5 dark:bg-primary/10 border-t border-primary/20">
        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1.5 opacity-80 flex items-center space-x-1.5">
          <ChevronRight className="w-3 h-3" />
          <span>Cited Excerpt</span>
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed line-clamp-3">
          "{activeCitation.text}"
        </p>
      </div>
    </motion.div>
  )
}

export default DocumentViewer
