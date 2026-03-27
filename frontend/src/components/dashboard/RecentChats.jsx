import React from 'react'
import { MessageSquare, ChevronRight, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RecentChats = ({ messages = [] }) => {
  const navigate = useNavigate()

  // Filter only user messages for the list
  const userMessages = messages.filter(m => m.role === 'user').reverse()

  if (userMessages.length === 0) {
    return (
      <div className="bg-card/50 border border-white/5 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-white/5 rounded-full">
          <MessageCircle className="w-8 h-8 text-gray-500" />
        </div>
        <div>
          <h3 className="text-white font-semibold">No chats yet</h3>
          <p className="text-sm text-gray-400 mt-1">Start a conversation with AI Assistant</p>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="px-6 py-2 bg-white/5 text-white rounded-xl hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium"
        >
          New Chat
        </button>
      </div>
    )
  }

  return (
    <div className="bg-card/30 border border-white/5 rounded-3xl overflow-hidden shadow-xl backdrop-blur-sm h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        <button 
          onClick={() => navigate('/chat')}
          className="text-primary text-sm font-medium hover:underline"
        >
          Go to Chat
        </button>
      </div>
      <div className="flex-1 overflow-auto divide-y divide-white/5">
        {userMessages.slice(0, 5).map((msg, idx) => (
          <div 
            key={idx}
            className="p-4 hover:bg-white/[0.02] flex items-center justify-between group cursor-pointer transition-colors"
            onClick={() => navigate('/chat')}
          >
            <div className="flex items-center space-x-4 min-w-0">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{msg.content}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Prompt sent to AI</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentChats
