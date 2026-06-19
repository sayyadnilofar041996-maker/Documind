import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useChatStore from '../../store/chatStore'

// Set up PDF.js worker natively using Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const DocumentViewer = () => {
  const { activeCitation, clearActiveCitation } = useChatStore()
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pdfData, setPdfData] = useState(null)
  const [textContent, setTextContent] = useState(null)
  const [isPdf, setIsPdf] = useState(true)
  const [isExtracted, setIsExtracted] = useState(false)

  useEffect(() => {
    if (activeCitation?.page_number) {
      setPageNumber(activeCitation.page_number)
    }
  }, [activeCitation])

  useEffect(() => {
    if (!activeCitation?.document_id) return;
    let isMounted = true;
    let objectUrl = null;
    setIsLoading(true);
    setError(null);
    setTextContent(null);
    setPdfData(null);

    const fileName = activeCitation.document_name || '';
    const extension = fileName.split('.').pop().toLowerCase();
    const isPdfFile = extension === 'pdf';
    const isOffice = ['doc', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension);
    
    setIsPdf(isPdfFile);
    setIsExtracted(isOffice);

    const endpoint = isOffice ? 'content' : 'file';
    const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/documents/${activeCitation.document_id}/${endpoint}`
    const token = localStorage.getItem('token')
    
    fetch(fileUrl, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `Server error (${res.status})`);
        }
        if (isPdfFile) return res.blob();
        return isOffice ? res.json() : res.text();
      })
      .then(data => {
        if (isMounted) {
          if (isPdfFile) {
            objectUrl = URL.createObjectURL(data);
            setPdfData({ url: objectUrl });
          } else {
            const text = isOffice ? data.content : data;
            setTextContent(text);
            setIsLoading(false);
          }
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load document.');
          setIsLoading(false);
        }
      });
      
    return () => { 
      isMounted = false; 
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeCitation?.document_id]);

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

  const makeTextRenderer = (searchText) => (textItem) => {
    if (!searchText) return textItem.str
    const parts = textItem.str.split(new RegExp(`(${searchText})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === searchText.toLowerCase() ? (
        <mark key={index} className="bg-primary/30 rounded-sm text-inherit border-b border-primary/50">
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
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      className="fixed top-0 right-0 h-screen w-full lg:w-[45%] bg-white dark:bg-zinc-950 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 z-[60] flex flex-col pt-20"
    >
      {/* Header Area */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4 overflow-hidden">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate leading-tight">
              {activeCitation.document_name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-zinc-400">
                 {isExtracted ? 'OCR Analysis' : 'Native View'}
              </span>
              <span className="text-zinc-200 dark:text-zinc-800">•</span>
              <span className="text-indigo-600 dark:text-indigo-400">Page {pageNumber} of {numPages || '...'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearActiveCitation}
          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      {/* Control Matrix */}
      <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 bg-white dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(prev => prev - 1)}
            className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 rounded-md disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[11px] font-bold min-w-[50px] text-center text-zinc-900 dark:text-white tracking-widest">
             {pageNumber} / {numPages || '--'}
          </span>
          <button 
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(prev => prev + 1)}
            className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 rounded-md disabled:opacity-20 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-3 bg-white dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <button 
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
            className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 rounded-md transition-all"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[11px] font-bold min-w-[40px] text-center text-zinc-900 dark:text-white">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(prev => Math.min(2.5, prev + 0.2))}
            className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 rounded-md transition-all"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Main Core Area */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900 flex justify-center scrollbar-none">
        <div className="relative p-6 lg:p-10 w-full flex justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 transition-opacity">
              <div className="p-5 bg-white dark:bg-zinc-950 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 mb-4 flex items-center justify-center">
                <Loader2 size={32} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Decoding data stream...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-10">
              <div className="w-16 h-16 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-500/20 shadow-sm">
                <AlertCircle size={32} className="text-rose-600 dark:text-rose-400" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Interface Error</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest max-w-[280px] leading-relaxed">{error}</p>
            </div>
          )}

          {pdfData && isPdf && (
            <div className="bg-white dark:bg-zinc-100 shadow-2xl border border-zinc-200 rounded-sm">
              <Document
                file={pdfData}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  customTextRenderer={(textItem) => {
                    const searchText = activeCitation.text;
                    if (!searchText) return textItem.str;
                    const parts = textItem.str.split(new RegExp(`(${searchText})`, 'gi'));
                    return parts.map((part, index) => 
                      part.toLowerCase() === searchText.toLowerCase() ? (
                        <mark key={index} className="bg-indigo-500/30 rounded-sm text-inherit border-b-2 border-indigo-600">
                          {part}
                        </mark>
                      ) : part
                    );
                  }}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                />
              </Document>
            </div>
          )}

          {textContent && !isPdf && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl p-10 lg:p-14 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-4xl">
               <pre className="whitespace-pre-wrap font-medium text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 break-words">
                 {(() => {
                   const searchText = activeCitation.text;
                   if (!searchText) return textContent;
                   const parts = textContent.split(new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                   return parts.map((part, i) => 
                     part.toLowerCase() === searchText.toLowerCase() ? (
                       <mark key={i} className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md px-1 py-0.5 border-b-2 border-indigo-600">
                         {part}
                       </mark>
                     ) : part
                   );
                 })()}
               </pre>
            </div>
          )}
        </div>
      </div>
      
      {/* Context Banner */}
      <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 relative overflow-hidden shrink-0">
        <div className="relative z-10">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-4 flex items-center space-x-2">
            <Maximize2 size={12} />
            <span>Context Persistence</span>
          </p>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 italic leading-relaxed font-medium">
              "{activeCitation.text}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default DocumentViewer
