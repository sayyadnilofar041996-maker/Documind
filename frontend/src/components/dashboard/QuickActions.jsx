import React from 'react'
import { Upload, MessageSquare, Files, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      title: 'Upload Document',
      description: 'Add new PDF or DOCX',
      icon: Upload,
      color: 'bg-blue-500',
      onClick: () => navigate('/documents')
    },
    {
      title: 'New Chat',
      description: 'Start AI conversation',
      icon: PlusCircle,
      color: 'bg-purple-500',
      onClick: () => navigate('/chat')
    },
    {
      title: 'Browse Library',
      description: 'View all documents',
      icon: Files,
      color: 'bg-emerald-500',
      onClick: () => navigate('/documents')
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all group text-left"
        >
          <div className={`p-3 rounded-xl ${action.color}/10 group-hover:scale-110 transition-transform`}>
            <action.icon className={`w-5 h-5 text-white opacity-90`} />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">{action.title}</h4>
            <p className="text-xs text-gray-500">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

export default QuickActions
