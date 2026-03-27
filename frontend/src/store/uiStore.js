import { create } from 'zustand'

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  darkMode: localStorage.getItem('theme') !== 'light',

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { darkMode: newDarkMode }
  }),

  initDarkMode: () => {
    const darkMode = localStorage.getItem('theme') !== 'light'
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ darkMode })
  }
}))

export default useUIStore
