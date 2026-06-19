import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Loader2, BrainCircuit, ArrowRight, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { register, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await register(email, username, password)
    if (success) {
      toast.success('Registration Successful. Access established.')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f] relative overflow-hidden">
      {/* Subtle Aurora Depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#7c5cfc]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#4fa3f7]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-[#0f1117] rounded-[20px] p-10 md:p-12 border border-[rgba(255,255,255,0.07)] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center space-y-8 mb-12">
            <div className="relative group">
              <div className="relative w-20 h-20 bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-[10px] flex items-center justify-center shadow-sm transition-all group-hover:border-[#7c5cfc]/30">
                <BrainCircuit className="w-10 h-10 text-[#7c5cfc]" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold text-[#fff] tracking-tight leading-none uppercase">
                DocuMind
              </h1>
              <p className="text-[10px] font-bold text-[#7c5cfc] uppercase tracking-[0.4em] pt-1">
                Sign Up
              </p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center mb-8"
            >
              Provisioning Failed: {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/45 uppercase tracking-[0.2em] ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#7c5cfc] transition-colors" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="username"
                  className="w-full bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-[10px] py-4 pl-14 pr-6 text-[#fff] text-xs focus:outline-none focus:border-[#7c5cfc]/50 transition-all font-bold placeholder-white/20 tracking-wide"
                />
              </div>
              <p className="text-[9px] text-white/30 ml-1">Letters, digits, and underscores only. Spaces will be automatically removed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/45 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#7c5cfc] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-[10px] py-4 pl-14 pr-6 text-[#fff] text-xs focus:outline-none focus:border-[#7c5cfc]/50 transition-all font-bold placeholder-white/20 tracking-wide"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/45 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#7c5cfc] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] rounded-[10px] py-4 pl-14 pr-6 text-[#fff] text-xs focus:outline-none focus:border-[#7c5cfc]/50 transition-all font-bold placeholder-white/20 tracking-wide"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-3 py-4 text-[10px] tracking-[0.2em] transition-all mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center text-[10px] font-bold text-white/45 uppercase tracking-widest">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-[#7c5cfc] hover:text-[#4fa3f7] transition-all">
                Log In
              </Link>
            </p>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-6 pt-8 border-t border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center space-x-2 text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span>Vault Protected</span>
            </div>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Protocol v5.3.0</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
