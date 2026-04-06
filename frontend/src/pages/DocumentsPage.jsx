import React, { useEffect } from 'react'
import UploadBox from '../components/documents/UploadBox'
import DocumentList from '../components/documents/DocumentList'
import useDocumentStore from '../store/documentStore'
import { Files, AlertCircle } from 'lucide-react'

const DocumentsPage = () => {
  const { documents, loading, error, fetchDocuments } = useDocumentStore()

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight">
            <Files className="w-8 h-8 mr-3 text-primary" />
            Document Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Upload and manage your documents for AI context analysis.
          </p>
        </div>
        
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 flex items-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
          <span className="text-sm font-medium text-primary">System Ready</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-500 text-sm">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
              Upload Files
            </h3>
            <UploadBox />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hidden lg:block shadow-sm">
            <h4 className="text-slate-900 dark:text-white font-medium mb-3">Usage Tips</h4>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Upload PDFs for best extraction results.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Large files may take a minute to process.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0" />
                Once "Ready", you can chat with them.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
            Library
          </h3>
          <DocumentList documents={documents} loading={loading} />
        </div>
      </div>
    </div>
  )
}

export default DocumentsPage
