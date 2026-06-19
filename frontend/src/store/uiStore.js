import { create } from 'zustand'

const applyTheme = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  darkMode: false, // Will be initialized by initDarkMode

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    applyTheme(newDarkMode)
    return { darkMode: newDarkMode }
  }),

  initDarkMode: () => {
    const storedTheme = localStorage.getItem('theme')
    let isDark = false
    
    if (storedTheme) {
      isDark = storedTheme === 'dark'
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    applyTheme(isDark)
    set({ darkMode: isDark })
  }
}))

export default useUIStore
