// src/pages/Dashboard.jsx — corrigido: useNavigate no componente pai
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Sparkles, Trash2, Edit3,
  Download, BookOpen, Users, Clock, AlertCircle, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { planosAPI, api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import Layout from '../components/layout/Layout'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4 fade-in">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '18' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-display" style={{ color: 'var(--navy)' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
      </div>
    </div>
  )
}

// ── Barra de uso do plano — sem useNavigate interno ───────────────────────────
function PlanUsageBar({ usage, onUpgradeClick }) {
  if (!usage || usage.plan_type !== 'free') return null

  const { planos_este_mes, limite_mensal, percentual, atingiu_limite } = usage

  return (
    <div
      className="card p-4 mb-6 fade-in"
      style={atingiu_limite
        ? { borderColor: '#f59e0b', background: '#fffbeb' }
        : {}
      }
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {atingiu_limite
            ? <AlertCircle size={15} style={{ color: '#d97706' }} />
            : <Zap size={15} style={{ color: 'var(--teal)' }} />
          }
          <span className="text-sm font-semibold"
            style={{ color: atingiu_limite ? '#92400e' : 'var(--navy)' }}>
            {atingiu_limite ? 'Limite atingido!' : 'Plano Gratuito'}
          </span>
        </div>
        <button
          onClick={onUpgradeClick}
          className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
          style={{ background: 'var(--blue)', color: 'white' }}>
          Fazer upgrade
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentual}%`,
              background: atingiu_limite ? '#f59e0b' : 'var(--teal)',
            }}
          />
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>
          {planos_este_mes}/{limite_mensal} este mês
        </span>
      </div>

      {atingiu_limite && (
        <p className="text-xs mt-2" style={{ color: '#92400e' }}>
          Limite de {limite_mensal} planos/mês atingido.
          Faça upgrade para criar planos ilimitados.
        </p>
      )}
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export default function Dashboard() {
  const [planos, setPlanos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [usage, setUsage]     = useState(null)
  const navigate  = useNavigate()      // ← useNavigate SOMENTE aqui
  const user      = useAuthStore((s) => s.user)
  const nomeExibicao = user?.nome_completo || user?.username || ''

  const fetchData = async () => {
    try {
      const [data, usageData] = await Promise.all([
        planosAPI.list(),
        api.get('/api/planos/me/usage').then(r => r.data).catch(() => null),
      ])
      setPlanos(data)
      setUsage(usageData)
    } catch {
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Excluir este plano?')) return
    await planosAPI.delete(id)
    setPlanos(p => p.filter(x => x.id !== id))
    toast.success('Plano excluído.')
    fetchData()
  }

  const handleDownloadPDF = async (plano, e) => {
    e.stopPropagation()
    toast.loading('Gerando PDF…', { id: 'pdf' })
    try {
      await planosAPI.downloadPDF({ plano_id: plano.id })
      toast.success('PDF baixado!', { id: 'pdf' })
    } catch {
      toast.error('Erro ao gerar PDF.', { id: 'pdf' })
    }
  }

  const handleNovoPlano = () => {
    if (usage?.atingiu_limite) {
      toast.error('Limite atingido. Faça upgrade para continuar.')
      navigate('/precos')
      return
    }
    navigate('/plano/novo')
  }

  const thisMonth    = planos.filter(p => {
    const d = new Date(p.created_at), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const withInclusion = planos.filter(p => p.inclusion_data?.paee).length

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl" style={{ color: 'var(--navy)' }}>
              Olá, {nomeExibicao} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {user?.disciplina && `${user.disciplina} · `}
              {user?.escola || 'Seus planos de aula'}
            </p>
          </div>
          <button onClick={handleNovoPlano} className="btn-primary gap-2 py-3 px-6">
            <Plus size={18} /> Novo Plano de Aula
          </button>
        </div>

        {/* Barra de uso — navigate passado como prop */}
        <PlanUsageBar
          usage={usage}
          onUpgradeClick={() => navigate('/precos')}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Total de planos"   value={planos.length}  color="var(--blue)"  />
          <StatCard icon={Clock}    label="Este mês"          value={thisMonth}      color="var(--teal)"  />
          <StatCard icon={Sparkles} label="Com IA"            value={withInclusion}  color="#7c3aed"      />
          <StatCard icon={Users}    label="Com inclusão/AEE"  value={withInclusion}  color="var(--navy)"  />
        </div>

        {/* Lista de planos */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--navy)' }}>Meus Planos</h2>
            <span className="badge badge-blue">{planos.length} planos</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin w-8 h-8" style={{ color: 'var(--blue)' }}
                viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor"
                  strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
            </div>
          ) : planos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--sage)' }}>
                <BookOpen size={28} style={{ color: 'var(--teal)' }} />
              </div>
              <p className="font-display text-xl" style={{ color: 'var(--navy)' }}>
                Nenhum plano ainda
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Crie seu primeiro plano de aula com IA
              </p>
              <button onClick={handleNovoPlano} className="btn-primary mt-2">
                <Plus size={16} /> Criar primeiro plano
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {planos.map((plano, i) => (
                <div
                  key={plano.id}
                  onClick={() => navigate(`/plano/${plano.id}`)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group fade-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--slate)' }}>
                        <FileText size={16} style={{ color: 'var(--blue)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate"
                          style={{ color: 'var(--navy)' }}>
                          {plano.tema || 'Sem tema'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {plano.disciplina && (
                            <span className="badge badge-blue text-xs">{plano.disciplina}</span>
                          )}
                          {plano.serie && (
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>
                              {plano.serie}
                            </span>
                          )}
                          {plano.inclusion_data?.paee && (
                            <span className="badge badge-teal text-xs">Inclusão/AEE</span>
                          )}
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                          {plano.data_aula
                            ? plano.data_aula.includes('-')
                              ? new Date(plano.data_aula + 'T12:00:00').toLocaleDateString('pt-BR')
                              : plano.data_aula
                            : new Date(plano.created_at).toLocaleDateString('pt-BR')}
                          {plano.turma && ` · Turma ${plano.turma}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={e => handleDownloadPDF(plano, e)}
                        className="btn-ghost p-2 rounded-lg" title="Baixar PDF">
                        <Download size={15} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/plano/${plano.id}`) }}
                        className="btn-ghost p-2 rounded-lg" title="Editar">
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={e => handleDelete(plano.id, e)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50 hover:text-red-500"
                        style={{ color: 'var(--muted)' }} title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
