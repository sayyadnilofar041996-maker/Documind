import React from 'react';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { 
  User, 
  Moon, 
  Sun, 
  Shield, 
  Cpu, 
  Info, 
  Database,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out? Your session statistics will be saved.')) {
      logout();
    }
  };

  const SettingSection = ({ title, children, icon: Icon, idx }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 dark:bg-[#4fa3f7]/10 rounded-lg border border-indigo-100 dark:border-transparent shadow-sm">
          {Icon && <Icon className="w-4 h-4 text-indigo-600 dark:text-[#4fa3f7]" />}
        </div>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-[#4fa3f7]">{title}</h2>
      </div>
      <div className="bg-white dark:bg-[#0f1117] rounded-[10px] overflow-hidden border border-zinc-200 dark:border-[rgba(255,255,255,0.07)] shadow-sm">
        {children}
      </div>
    </motion.div>
  );

  const SettingItem = ({ label, description, children, icon: Icon }) => (
    <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-[rgba(255,255,255,0.07)] last:border-0 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all duration-300 group">
      <div className="flex items-center gap-5">
        {Icon && (
          <div className="w-12 h-12 rounded-[10px] bg-zinc-50 dark:bg-[#0a0a0f] border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-[#4fa3f7] transition-all shadow-sm">
            <Icon size={20} />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-[#fff] tracking-tight group-hover:text-indigo-600 dark:group-hover:text-[#4fa3f7] transition-colors uppercase">{label}</h3>
          {description && <p className="text-[11px] text-zinc-500 dark:text-white/45 mt-1 font-medium leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <div className="pt-2 pb-6 px-2 md:px-4 max-w-6xl mx-auto min-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
        {/* Left Column */}
        <div>
          <SettingSection title="Member Profile" icon={User} idx={0}>
            <SettingItem 
              label="User Identity" 
              description="Primary account identifier credentials"
              icon={User}
            >
              <div className="text-right">
                <div className="text-sm font-bold text-zinc-900 dark:text-[#fff] capitalize">{user?.username || 'Analyst'}</div>
                <div className="text-[10px] text-indigo-600 dark:text-[#4fa3f7] font-bold uppercase tracking-widest mt-0.5">{user?.email || 'user@documind.ai'}</div>
              </div>
            </SettingItem>
            <SettingItem 
              label="Account Protection" 
              description="Enhanced verification and security"
              icon={Shield}
            >
              <div className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                Identity Verified
              </div>
            </SettingItem>
          </SettingSection>

          <SettingSection title="Interface Mode" icon={Sun} idx={1}>
            <SettingItem 
              label="Platform Mode" 
              description="Toggle between system themes"
              icon={darkMode ? Moon : Sun}
            >
              <button 
                onClick={toggleDarkMode}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none border border-zinc-200 dark:border-white/10 ${
                  darkMode ? 'bg-[#7c5cfc]' : 'bg-zinc-100'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                    darkMode ? 'translate-x-[24px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </SettingItem>
          </SettingSection>
        </div>

        {/* Right Column */}
        <div>
          <SettingSection title="Compute Engine" icon={Cpu} idx={2}>
            <SettingItem 
              label="Neural Core" 
              description="Primary processing infrastructure"
              icon={Cpu}
            >
              <div className="flex flex-col items-end">
                <div className="bg-indigo-50 dark:bg-[#7c5cfc]/10 text-indigo-600 dark:text-[#7c5cfc] text-[9px] font-bold px-3 py-1 rounded-[5px] border border-indigo-100 dark:border-[#7c5cfc]/20">Groq Native</div>
                <span className="text-[8px] text-zinc-400 dark:text-white/45 font-bold mt-1 uppercase tracking-widest opacity-70">Latency: 0.1ms</span>
              </div>
            </SettingItem>
            <SettingItem 
              label="Intelligence Model" 
              description="Large Language Model configuration"
              icon={Database}
            >
              <div className="text-[10px] font-bold text-zinc-500 dark:text-white/45 uppercase tracking-widest">Llama3-8B-Turbo</div>
            </SettingItem>
            <SettingItem 
              label="Vector Pipeline" 
              description="Data ingestion and search patterns"
              icon={Info}
            >
              <div className="text-[10px] font-bold text-zinc-500 dark:text-white/45 uppercase tracking-widest">Semantic Grid</div>
            </SettingItem>
          </SettingSection>

          <SettingSection title="System Overview" icon={Info} idx={3}>
            <SettingItem label="Release Build" description="Current stable environment">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-white/45 uppercase tracking-widest">v5.3.0 Enterprise</span>
            </SettingItem>
            <SettingItem label="Environment" description="Global cluster status">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Operational
              </span>
            </SettingItem>
            <SettingItem label="Authentication" description="End current secure session">
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-6 py-2 bg-[#0f1117] hover:bg-rose-500/10 text-white/45 hover:text-rose-400 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:border-rose-500/30 group/logout"
              >
                <LogOut size={14} className="group-hover/logout:-translate-x-1 transition-transform" />
                <span>Disconnect</span>
              </button>
            </SettingItem>
          </SettingSection>
        </div>
      </div>

      <div className="text-center mt-20 pb-12">
        <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-[0.4em]">DocuMind • Technical Intelligence Platform</p>
      </div>
    </div>
  );
};

export default SettingsPage;
