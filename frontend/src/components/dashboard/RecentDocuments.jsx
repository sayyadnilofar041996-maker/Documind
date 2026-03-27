import React from 'react'
import { FileText, Clock, ChevronRight, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RecentDocuments = ({ documents = [] }) => {
  const navigate = useNavigate()
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-400/10'
      case 'processing': return 'text-blue-400 bg-blue-400/10 animate-pulse'
      case 'failed': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (documents.length === 0) {
    return (
      <div className="bg-card/50 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-white/5 rounded-full">
          <Upload className="w-8 h-8 text-gray-500" />
        </div>
        <div>
          <h3 className="text-white font-semibold">No documents yet</h3>
          <p className="text-sm text-gray-400 mt-1">Upload your first file to get started</p>
        </div>
        <button 
          onClick={() => navigate('/documents')}
          className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          Upload Document
        </button>
      </div>
    )
  }

  return (
    <div className="bg-card/30 border border-white/5 rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Recent Documents</h3>
        <button 
          onClick={() => navigate('/documents')}
          className="text-primary text-sm font-medium hover:underline"
        >
          View All
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {documents.slice(0, 5).map((doc) => (
          <div 
            key={doc.id}
            className="p-4 hover:bg-white/[0.02] flex items-center justify-between group cursor-pointer transition-colors"
            onClick={() => navigate('/documents')}
          >
            <div className="flex items-center space-x-4 min-w-0">
              <div className="p-2.5 bg-white/5 rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{doc.original_filename || doc.filename}</p>
                <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-gray-500">
                  <span className={`px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                  <span>•</span>
                  <span>{formatDate(doc.created_at)}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentDocuments
