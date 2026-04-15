// src/components/layout/Layout.jsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Plus, Settings,
  LogOut, Menu, X, Shield
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative slide-in">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--navy)' }}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'var(--navy)' }}>
              <BookOpen size={12} className="text-white" />
            </div>
            <span className="font-display text-base" style={{ color: 'var(--navy)' }}>OPA5</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-slate-opa">
          {children}
        </main>
      </div>
    </div>
  )
}

function Sidebar({ mobile, onClose }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  // Nome de exibição: nome_completo tem prioridade
  const nomeExibicao = user?.nome_completo || user?.username || ''
  // Inicial para o avatar
  const inicial = nomeExibicao[0]?.toUpperCase() || '?'

  const NAV = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/plano/novo', icon: Plus, label: 'Novo Plano' },
    { to: '/configuracoes', icon: Settings, label: 'Configurações' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  const handleLogout = () => {
    logout()
    toast.success('Até logo!')
    navigate('/login')
  }

  return (
    <aside className="flex flex-col h-full w-64" style={{ background: 'var(--navy)' }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--teal)' }}>
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-display text-lg text-white tracking-wide">OPA5</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-blue-300 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`
            }
            style={({ isActive }) => isActive ? { background: 'var(--blue)' } : {}}>
            <Icon size={17} />
            {label}
            {label === 'Novo Plano' && (
              <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--teal)' }}>+</span>
            )}
            {label === 'Admin' && (
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>ADM</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Usuário — exibe nome_completo */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ background: 'var(--teal)' }}>
            {inicial}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{nomeExibicao}</p>
            <p className="text-blue-300 text-xs">{isAdmin ? 'Administrador' : 'Professor'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-all">
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
