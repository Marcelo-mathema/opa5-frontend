// src/pages/Precos.jsx — com integração Stripe
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import {
  Check, X, Sparkles, BookOpen, Users, Building2,
  ArrowRight, Star, Shield, Zap, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'

const PLANOS = [
  {
    id: 'free',
    nome: 'Gratuito',
    preco_mensal: 0,
    preco_anual: 0,
    descricao: 'Para experimentar e conhecer a plataforma',
    destaque: false,
    cta: 'Começar grátis',
    recursos: [
      { texto: '3 planos de aula por mês', incluso: true },
      { texto: 'Integração BNCC completa', incluso: true },
      { texto: 'Geração de PDF', incluso: true },
      { texto: 'Logo da escola no PDF', incluso: false },
      { texto: 'Geração com IA', incluso: false },
      { texto: 'Relatório SAA (inclusão)', incluso: false },
      { texto: 'Planos ilimitados', incluso: false },
      { texto: 'Suporte prioritário', incluso: false },
    ],
  },
  {
    id: 'professor',
    nome: 'Professor',
    preco_mensal: 27.90,
    preco_anual: 18.60,
    descricao: 'Para o professor que quer produtividade máxima',
    destaque: true,
    badge: 'Mais popular',
    cta: 'Assinar agora',
    recursos: [
      { texto: 'Planos ilimitados', incluso: true },
      { texto: 'Integração BNCC completa', incluso: true },
      { texto: 'Geração de PDF profissional', incluso: true },
      { texto: 'Logo da escola no PDF', incluso: true },
      { texto: 'Geração com IA (GPT-4o)', incluso: true },
      { texto: 'Relatório SAA (inclusão)', incluso: true },
      { texto: 'Histórico completo de planos', incluso: true },
      { texto: 'Suporte por e-mail', incluso: true },
    ],
  },
  {
    id: 'escola',
    nome: 'Escola',
    preco_mensal: 129,
    preco_anual: 107,
    descricao: 'Para gestores e coordenações pedagógicas',
    destaque: false,
    cta: 'Falar com equipe',
    recursos: [
      { texto: 'Tudo do plano Professor', incluso: true },
      { texto: 'Até 20 professores', incluso: true },
      { texto: 'Painel administrativo', incluso: true },
      { texto: 'Logo personalizada por turma', incluso: true },
      { texto: 'Relatórios de uso', incluso: true },
      { texto: 'Onboarding dedicado', incluso: true },
      { texto: 'Suporte prioritário', incluso: true },
      { texto: 'Personalização de marca', incluso: true },
    ],
  },
]

const FAQS = [
  { q: 'Posso cancelar a qualquer momento?', r: 'Sim. Sem fidelidade. Cancele com um clique e mantenha o acesso até o final do período pago.' },
  { q: 'O plano gratuito tem limite de tempo?', r: 'Não. É permanente, com limite de 3 planos por mês. Use indefinidamente.' },
  { q: 'Como funciona o plano anual?', r: 'Você paga adiantado 12 meses com ~33% de desconto. O valor é cobrado uma única vez.' },
  { q: 'Quais formas de pagamento são aceitas?', r: 'Cartão de crédito (Visa, Master, Elo, Amex) e PIX. O pagamento é processado pelo Stripe com segurança máxima.' },
  { q: 'A plataforma funciona para todas as disciplinas?', r: 'Sim. BNCC completa para todas as disciplinas do EF e EM. A IA é treinada para o contexto educacional brasileiro.' },
]

function RecursoItem({ texto, incluso }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className="flex-shrink-0 mt-0.5">
        {incluso
          ? <Check size={15} className="text-green-500" />
          : <X size={15} style={{ color: 'var(--border)' }} />}
      </span>
      <span style={{ color: incluso ? 'inherit' : 'var(--muted)', opacity: incluso ? 1 : 0.5 }}>
        {texto}
      </span>
    </li>
  )
}

function FaqItem({ q, r }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="font-medium text-sm" style={{ color: 'var(--navy)' }}>{q}</span>
        {open
          ? <ChevronUp size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />}
      </button>
      {open && (
        <p className="text-sm pb-4 leading-relaxed fade-in" style={{ color: 'var(--muted)' }}>{r}</p>
      )}
    </div>
  )
}

function CardPlano({ plano, anual, onSelect, planAtual, loading }) {
  const preco = anual ? plano.preco_anual : plano.preco_mensal
  const isDestaque = plano.destaque
  const isCurrent = planAtual === plano.id
  const isLoading = loading === plano.id

  const formatPreco = (v) => v.toFixed(2).replace('.', ',')

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${
        isDestaque ? 'shadow-2xl scale-105 z-10' : 'shadow-sm hover:shadow-lg hover:-translate-y-1'
      }`}
      style={{
        background: isDestaque ? 'var(--navy)' : 'white',
        borderColor: isDestaque ? 'var(--blue)' : 'var(--border)',
        borderWidth: isDestaque ? '2px' : '1px',
      }}>

      {plano.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 px-4 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: 'var(--teal)' }}>
            <Star size={10} fill="currentColor" />
            {plano.badge}
          </span>
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        <div className="mb-6">
          <h3 className="font-display text-xl mb-1"
            style={{ color: isDestaque ? 'white' : 'var(--navy)' }}>
            {plano.nome}
          </h3>
          <p className="text-xs leading-relaxed"
            style={{ color: isDestaque ? 'rgba(255,255,255,0.6)' : 'var(--muted)' }}>
            {plano.descricao}
          </p>
        </div>

        <div className="mb-6">
          {preco === 0 ? (
            <span className="font-display text-4xl" style={{ color: isDestaque ? 'white' : 'var(--navy)' }}>
              Grátis
            </span>
          ) : (
            <div>
              <div className="flex items-end gap-1">
                <span className="text-sm font-medium"
                  style={{ color: isDestaque ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>R$</span>
                <span className="font-display text-4xl leading-none"
                  style={{ color: isDestaque ? 'white' : 'var(--navy)' }}>
                  {formatPreco(preco)}
                </span>
                <span className="text-sm mb-1"
                  style={{ color: isDestaque ? 'rgba(255,255,255,0.6)' : 'var(--muted)' }}>/mês</span>
              </div>
              {anual && (
                <p className="text-xs mt-1"
                  style={{ color: isDestaque ? 'rgba(255,255,255,0.5)' : 'var(--muted)' }}>
                  Cobrado R$ {formatPreco(preco * 12)}/ano · Economize 33%
                </p>
              )}
            </div>
          )}
        </div>

        <ul className="flex flex-col gap-2.5 mb-8 flex-1">
          {plano.recursos.map((r, i) => (
            <RecursoItem key={i} texto={r.texto} incluso={r.incluso} />
          ))}
        </ul>

        <button
          onClick={() => onSelect(plano)}
          disabled={isCurrent || isLoading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          style={
            isCurrent
              ? { background: 'var(--border)', color: 'var(--muted)', cursor: 'default' }
              : isDestaque
                ? { background: 'var(--teal)', color: 'white' }
                : plano.id === 'free'
                  ? { background: 'var(--slate)', color: 'var(--navy)', border: '1px solid var(--border)' }
                  : { background: 'var(--navy)', color: 'white' }
          }>
          {isCurrent ? 'Plano atual' : isLoading ? (
            <><Loader2 size={14} className="animate-spin" /> Redirecionando…</>
          ) : (
            <>{plano.cta} <ArrowRight size={14} /></>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Precos() {
  const [anual, setAnual]     = useState(false)
  const [loading, setLoading] = useState(null)
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const planAtual = user?.plan_type || 'free'

  const handleSelect = async (plano) => {
    if (plano.id === 'free') {
      navigate(user ? '/dashboard' : '/register')
      return
    }
    if (plano.id === 'escola') {
      window.open('mailto:contato@opa5.com.br?subject=Plano Escola OPA5', '_blank')
      return
    }

    // Plano professor — inicia checkout Stripe
    if (!user) {
      navigate('/register')
      return
    }

    setLoading(plano.id)
    try {
      const { checkout_url } = await api.post('/api/stripe/checkout', {
        ciclo: anual ? 'anual' : 'mensal',
      }).then(r => r.data)

      // Redireciona para o checkout do Stripe
      window.location.href = checkout_url
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao iniciar pagamento. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--slate)' }}>

      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => navigate(user ? '/dashboard' : '/')}
          className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--navy)' }}>
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-display text-lg" style={{ color: 'var(--navy)' }}>OPA5</span>
        </button>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-outline text-sm py-2">
              Meu painel
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Entrar</button>
              <button onClick={() => navigate('/register')} className="btn-primary text-sm py-2">
                Começar grátis
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-12 fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'var(--sage)', color: 'var(--teal)' }}>
            <Sparkles size={12} />
            Planos para professores brasileiros
          </div>
          <h1 className="font-display text-5xl mb-4" style={{ color: 'var(--navy)' }}>
            Invista no seu<br />
            <em className="not-italic" style={{ color: 'var(--blue)' }}>planejamento pedagógico</em>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            Menos de R$1 por dia para economizar horas toda semana.
          </p>
        </div>

        {/* Toggle mensal/anual */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="text-sm font-medium" style={{ color: anual ? 'var(--muted)' : 'var(--navy)' }}>
            Mensal
          </span>
          <button onClick={() => setAnual(!anual)}
            className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center"
            style={{ background: anual ? 'var(--teal)' : 'var(--border)' }}>
            <span className="absolute w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
              style={{ left: anual ? '28px' : '4px' }} />
          </button>
          <span className="text-sm font-medium" style={{ color: anual ? 'var(--navy)' : 'var(--muted)' }}>
            Anual
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'var(--sage)', color: 'var(--teal)' }}>-33%</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-20 px-4">
          {PLANOS.map(plano => (
            <CardPlano key={plano.id} plano={plano} anual={anual}
              onSelect={handleSelect} planAtual={planAtual} loading={loading} />
          ))}
        </div>

        {/* Selos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Shield, titulo: 'Pagamento 100% seguro', desc: 'Processado pelo Stripe. Aceitamos cartão e PIX.' },
            { icon: Zap,    titulo: 'Ativação imediata', desc: 'Acesso liberado em segundos após confirmação.' },
            { icon: Users,  titulo: 'Suporte em português', desc: 'Resposta em até 24h em dias úteis.' },
          ].map(({ icon: Icon, titulo, desc }) => (
            <div key={titulo} className="card p-6 flex items-start gap-4 fade-in">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--sage)' }}>
                <Icon size={18} style={{ color: 'var(--teal)' }} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--navy)' }}>{titulo}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bloco escolas */}
        <div className="card p-8 mb-20 fade-in" style={{ background: 'var(--navy)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={18} style={{ color: 'var(--teal-light)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--teal-light)' }}>Para gestores</span>
              </div>
              <h3 className="font-display text-2xl text-white mb-2">Plano Escola ou Rede?</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Escolas, coordenações e secretarias têm condições especiais. Fale conosco.
              </p>
            </div>
            <button
              onClick={() => window.open('mailto:contato@opa5.com.br?subject=Plano Escola OPA5', '_blank')}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'var(--teal)', color: 'white' }}>
              Falar com a equipe <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-2xl text-center mb-8" style={{ color: 'var(--navy)' }}>
            Perguntas frequentes
          </h2>
          <div className="card px-6 fade-in">
            {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} r={faq.r} />)}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center fade-in">
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Ainda com dúvidas? Experimente grátis — sem cartão de crédito.
          </p>
          <button onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="btn-primary gap-2 px-8 py-3 text-base">
            <Sparkles size={16} />
            {user ? 'Voltar ao painel' : 'Criar conta gratuita'}
          </button>
        </div>
      </div>

      <footer className="border-t mt-8 py-8 text-center text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        © {new Date().getFullYear()} OPA5 SaaS · Plataforma de Planejamento Educacional
        <span className="mx-2">·</span>
        <a href="mailto:contato@opa5.com.br" style={{ color: 'var(--blue)' }}>contato@opa5.com.br</a>
      </footer>
    </div>
  )
}
