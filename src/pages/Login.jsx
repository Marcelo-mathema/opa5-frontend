// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ username, password }) => {
    setLoading(true)
    try {
      const data = await authAPI.login(username, password)
      setAuth({
        id: data.user_id,
        username: data.username,
        nome_completo: data.nome_completo || data.username,
        role: data.role,
        disciplina: data.disciplina,
        escola: data.escola,
        masp: data.masp,
      }, data.access_token)
      toast.success(`Bem-vindo, ${data.nome_completo || data.username}!`)
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Usuário ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--navy)' }}>
      {/* Painel esquerdo */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full border-2 border-white translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full border border-white -translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 border border-white rounded-lg rotate-45 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--teal)' }}>
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-white text-xl font-display tracking-wide">OPA5</span>
        </div>
        <div className="relative">
          <h1 className="text-white font-display text-5xl leading-tight mb-6">
            Planos de aula<br />
            <em className="not-italic" style={{ color: 'var(--teal-light)' }}>inteligentes</em><br />
            para professores.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Integrado à BNCC. Geração com IA. PDF profissional com a logo da sua escola.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {['Consulta automática à BNCC', 'IA para inclusão e superdotação', 'PDF com logo da escola em segundos'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-blue-100 text-sm">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--teal-light)' }} />
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-blue-300 text-xs">
          © {new Date().getFullYear()} OPA5 SaaS. Todos os direitos reservados.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-md fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--navy)' }}>
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display text-lg" style={{ color: 'var(--navy)' }}>OPA5</span>
          </div>

          <h2 className="font-display text-3xl mb-1" style={{ color: 'var(--navy)' }}>
            Entrar na plataforma
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Acesse sua conta para gerenciar seus planos de aula.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <label className="label">Usuário</label>
              <input
                className={`input ${errors.username ? 'border-red-400' : ''}`}
                placeholder="seu.usuario"
                {...register('username', { required: 'Informe o usuário' })}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Informe a senha' })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base mt-1"
              style={{ background: 'var(--navy)' }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Entrando…
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--blue)' }}>
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
