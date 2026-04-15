// src/components/AssinaturaCard.jsx
// Card de gerenciamento de assinatura para o dashboard/configurações

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, CreditCard, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function AssinaturaCard() {
  const [status, setStatus]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/stripe/status')
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ plan_type: 'free', is_paid: false }))
      .finally(() => setLoading(false))
  }, [])

  const abrirPortal = async () => {
    setPortalLoading(true)
    try {
      const { portal_url } = await api.post('/api/stripe/portal', {
        return_url: window.location.href,
      }).then(r => r.data)
      window.location.href = portal_url
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao abrir portal.')
      setPortalLoading(false)
    }
  }

  if (loading) return (
    <div className="card p-6 flex items-center justify-center">
      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--muted)' }} />
    </div>
  )

  const isFree = !status?.is_paid

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--navy)' }}>
            Minha assinatura
          </h3>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Gerencie seu plano e pagamentos
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isFree ? 'badge-amber' : 'badge-teal'
        }`}>
          {isFree
            ? <><AlertCircle size={11} /> Gratuito</>
            : <><CheckCircle2 size={11} /> Professor</>
          }
        </div>
      </div>

      {isFree ? (
        <div>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Você está no plano gratuito com limite de <strong>3 planos/mês</strong>.
            Faça upgrade para planos ilimitados com IA.
          </p>
          <button
            onClick={() => navigate('/precos')}
            className="btn-primary w-full gap-2 text-sm py-2.5">
            <Zap size={14} />
            Ver planos e fazer upgrade
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-2 mb-4 text-sm">
            {status?.current_period_end && (
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--muted)' }}>Próxima cobrança</span>
                <span className="font-medium" style={{ color: 'var(--ink)' }}>
                  {status.current_period_end}
                </span>
              </div>
            )}
            {status?.cancel_at_period_end && (
              <div className="flex items-center gap-2 p-2 rounded-lg text-xs"
                style={{ background: '#fef3c7', color: '#92400e' }}>
                <AlertCircle size={13} />
                Cancelamento agendado para o fim do período
              </div>
            )}
          </div>
          <button
            onClick={abrirPortal}
            disabled={portalLoading}
            className="btn-outline w-full gap-2 text-sm py-2.5">
            {portalLoading
              ? <><Loader2 size={14} className="animate-spin" /> Abrindo…</>
              : <><CreditCard size={14} /> Gerenciar assinatura <ExternalLink size={12} /></>
            }
          </button>
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted)' }}>
            Cancele, atualize cartão ou veja faturas
          </p>
        </div>
      )}
    </div>
  )
}
