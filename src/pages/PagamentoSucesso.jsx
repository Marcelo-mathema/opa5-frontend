// src/pages/PagamentoSucesso.jsx
// Página exibida após pagamento confirmado pelo Stripe

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function PagamentoSucesso() {
  const [params] = useSearchParams()
  const navigate  = useNavigate()
  const { user, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Aguarda 2s para o webhook processar e então atualiza os dados do usuário
    const timer = setTimeout(async () => {
      try {
        const me = await api.get('/api/auth/me').then(r => r.data)
        // Atualiza o store com o novo plan_type
        const token = localStorage.getItem('opa5_token')
        if (token) {
          setAuth({ ...user, plan_type: me.plan_type || 'professor' }, token)
        }
      } catch { /* silencia */ }
      finally { setLoading(false) }
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--slate)' }}>
      <div className="max-w-md w-full text-center fade-in">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--navy)' }}>
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-display text-xl" style={{ color: 'var(--navy)' }}>OPA5</span>
        </div>

        {/* Ícone de sucesso */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--sage)' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--teal)' }} />
        </div>

        <h1 className="font-display text-3xl mb-3" style={{ color: 'var(--navy)' }}>
          Pagamento confirmado!
        </h1>
        <p className="text-base mb-2" style={{ color: 'var(--muted)' }}>
          Bem-vindo ao plano <strong style={{ color: 'var(--teal)' }}>Professor</strong>!
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
          Seu acesso foi ativado. Agora você pode criar planos de aula ilimitados com IA.
        </p>

        {/* Destaques do plano */}
        <div className="card p-6 text-left mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide mb-4"
            style={{ color: 'var(--muted)' }}>
            O que você ganhou acesso:
          </p>
          {[
            'Planos de aula ilimitados',
            'Geração com IA (GPT-4o)',
            'Relatório SAA para inclusão',
            'PDF com logo da escola',
            'Integração BNCC completa',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5 mb-2.5">
              <Sparkles size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
              <span className="text-sm" style={{ color: 'var(--ink)' }}>{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/plano/novo')}
          disabled={loading}
          className="btn-primary w-full py-3 gap-2 text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                  strokeDasharray="40" strokeDashoffset="10" />
              </svg>
              Ativando sua conta…
            </span>
          ) : (
            <>
              Criar meu primeiro plano
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-ghost w-full mt-3 text-sm">
          Ir para o dashboard
        </button>
      </div>
    </div>
  )
}
