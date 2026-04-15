// src/pages/PlanoForm.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Sparkles, Download, Save, ChevronDown, ChevronUp,
  UserCheck, AlertCircle, Loader2, ArrowLeft, Lock, Unlock, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { planosAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useBNCC } from '../hooks/useBNCC'
import Layout from '../components/layout/Layout'
import BNCCSelector from '../components/forms/BNCCSelector'

const DISCIPLINAS = [
  'Matemática', 'Português', 'História', 'Geografia', 'Ciências',
  'Biologia', 'Física', 'Química', 'Arte', 'Educação Física',
  'Inglês', 'Filosofia', 'Sociologia', 'Ensino Religioso', 'Outra',
]
const SERIES = [
  '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF',
  '1ª Série EM', '2ª Série EM', '3ª Série EM',
]
const NECESSIDADES_OPTS = [
  'Deficiência Visual', 'Deficiência Auditiva', 'Deficiência Intelectual',
  'TEA (Autismo)', 'TDAH', 'Deficiência Física', 'Superdotação/AH',
  'Dislexia', 'Discalculia', 'Outra',
]

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{title}</span>
        {open ? <ChevronUp size={16} style={{ color: 'var(--muted)' }} />
               : <ChevronDown size={16} style={{ color: 'var(--muted)' }} />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  )
}

function LockableTextarea({ label, fieldName, register, locked, onToggleLock }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label mb-0">{label}</label>
        <button
          type="button"
          onClick={onToggleLock}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
          style={{ color: locked ? 'var(--teal)' : 'var(--muted)', background: locked ? 'var(--sage)' : 'transparent' }}
        >
          {locked ? <Lock size={11} /> : <Unlock size={11} />}
          {locked ? 'Travado' : 'Livre'}
        </button>
      </div>
      <textarea
        className="textarea"
        disabled={locked}
        style={locked ? { background: 'var(--sage)', color: 'var(--ink)', cursor: 'default' } : {}}
        rows={5}
        {...register(fieldName)}
      />
    </div>
  )
}

// Campo somente leitura para dados do usuário
function ReadonlyField({ label, value, adminOnly }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="label mb-0">{label}</label>
        {adminOnly && (
          <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
            style={{ background: '#fef3c7', color: '#92400e' }}>
            <Lock size={9} />
            Admin
          </span>
        )}
      </div>
      <div
        className="input flex items-center"
        style={{ background: 'var(--slate)', color: value ? 'var(--ink)' : 'var(--muted)', cursor: 'default' }}
      >
        {value || '—'}
      </div>
    </div>
  )
}

export default function PlanoForm() {
  const { id } = useParams()
  const isEditing = !!id && id !== 'novo'
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { getCompetenciasPorSerie } = useBNCC()

  const [loadingIA, setLoadingIA]   = useState(false)
  const [loadingSAA, setLoadingSAA] = useState(false)
  const [loadingPDF, setLoadingPDF] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)

  const [temPAEE, setTemPAEE]     = useState(false)
  const [necessidades, setNecessidades] = useState([])
  const [recursos, setRecursos]   = useState('')

  const [locked, setLocked] = useState({
    objetivos: false, desenvolvimento: false, conclusao: false
  })

  const { register, handleSubmit, setValue, getValues, reset, watch } = useForm({
    defaultValues: {
      // Dados do professor pré-preenchidos e só-leitura
      professor: user?.username || '',
      disciplina: user?.disciplina || '',
      escola: user?.escola || '',
      masp: user?.masp || '',
    }
  })

  const disciplinaAtual = watch('disciplina')
  const serieAtual = watch('serie')

  // Auto-preenche competências quando série muda
  useEffect(() => {
    if (serieAtual && !isEditing) {
      const comp = getCompetenciasPorSerie(serieAtual)
      if (comp) setValue('competencias', comp)
    }
  }, [serieAtual])

  // Carrega plano existente ao editar
  useEffect(() => {
    if (isEditing) {
      planosAPI.get(id).then((p) => {
        reset({
          disciplina: p.disciplina, serie: p.serie, turma: p.turma,
          data_aula: p.data_aula, tema: p.tema, duracao: p.duracao,
          competencias: p.competencias, descricao: p.descricao,
          codigos: p.codigos, habilidades: p.habilidades,
          objetivos: p.objetivos, desenvolvimento: p.desenvolvimento,
          conclusao: p.conclusao, observacao: p.observacao,
          bibliografia: p.bibliografia, saa_text: p.saa_text || '',
          escola: user?.escola || '',
          professor: user?.username || '',
          masp: user?.masp || '',
        })
        if (p.inclusion_data?.paee) {
          setTemPAEE(true)
          setNecessidades(p.inclusion_data.necessidades || [])
          setRecursos((p.inclusion_data.recursos || []).join(', '))
        }
      }).catch(() => toast.error('Erro ao carregar plano.'))
    }
  }, [id])

  const handleGerarIA = async () => {
    const v = getValues()
    if (!v.tema) return toast.error('Informe o Tema antes de usar a IA.')
    setLoadingIA(true)
    try {
      const result = await planosAPI.gerarIA({
        disciplina: v.disciplina, serie: v.serie, tema: v.tema,
        duracao: v.duracao, competencias: v.competencias,
        codigos: v.codigos, habilidades: v.habilidades,
      })
      setValue('objetivos', result.objetivos)
      setValue('desenvolvimento', result.desenvolvimento)
      setValue('conclusao', result.conclusao)
      setValue('bibliografia', result.bibliografia)
      toast.success('Planejamento gerado com IA!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao usar IA.')
    } finally {
      setLoadingIA(false)
    }
  }

  const handleGerarSAA = async () => {
    const v = getValues()
    if (!v.tema) return toast.error('Informe o Tema antes de gerar o relatório.')
    setLoadingSAA(true)
    try {
      const result = await planosAPI.gerarSAA({
        disciplina: v.disciplina, serie: v.serie, tema: v.tema,
        necessidades, recursos: recursos ? [recursos] : [],
        observacao: v.observacao || '',
      })
      setValue('saa_text', result.saa_text)
      toast.success('Relatório de inclusão gerado!')
    } catch {
      toast.error('Erro ao gerar relatório de inclusão.')
    } finally {
      setLoadingSAA(false)
    }
  }

  const onSubmit = async (data) => {
    setLoadingSave(true)
    try {
      const payload = {
        ...data,
        inclusion_data: temPAEE ? {
          paee: true, necessidades,
          recursos: recursos ? recursos.split(',').map(s => s.trim()).filter(Boolean) : [],
          observacao: data.observacao || '',
        } : null,
        saa_text: data.saa_text || '',
      }
      if (isEditing) {
        await planosAPI.update(id, payload)
        toast.success('Plano atualizado!')
      } else {
        const criado = await planosAPI.create(payload)
        toast.success('Plano salvo!')
        navigate(`/plano/${criado.id}`)
      }
    } catch {
      toast.error('Erro ao salvar plano.')
    } finally {
      setLoadingSave(false)
    }
  }

  const handlePDF = async () => {
    if (!isEditing) {
      toast('Salve o plano antes de gerar o PDF.', { icon: '💡' })
      return
    }
    setLoadingPDF(true)
    try {
      await planosAPI.downloadPDF({
        plano_id: parseInt(id),
        escola: getValues('escola') || user?.escola || '',
        professor_nome: user?.username || '',
      })
      toast.success('PDF baixado!')
    } catch {
      toast.error('Erro ao gerar PDF.')
    } finally {
      setLoadingPDF(false)
    }
  }

  const toggleNecessidade = (n) => {
    setNecessidades(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
    )
  }

  const isAdmin = user?.role === 'admin'

  return (
    <Layout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost p-2 rounded-lg">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="font-display text-2xl" style={{ color: 'var(--navy)' }}>
                  {isEditing ? 'Editar Plano' : 'Novo Plano de Aula'}
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Integrado à BNCC · Geração com IA disponível
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={handleGerarIA} disabled={loadingIA}
                className="btn gap-2 text-white" style={{ background: '#6d28d9' }}>
                {loadingIA ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {loadingIA ? 'Gerando…' : 'Gerar com IA'}
              </button>
              <button type="button" onClick={handlePDF} disabled={loadingPDF} className="btn-outline gap-2">
                {loadingPDF ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                PDF
              </button>
              <button type="submit" disabled={loadingSave} className="btn-primary gap-2">
                {loadingSave ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Salvar
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">

            {/* 1. Identificação */}
            <Section title="1. Identificação">

              {/* Aviso campos bloqueados */}
              <div className="flex items-start gap-2 p-3 rounded-lg mb-5 text-xs"
                style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  Os campos <strong>Professor, Disciplina, Escola e MASP</strong> são preenchidos automaticamente
                  com os dados do seu cadastro. {isAdmin
                    ? 'Como administrador, você pode editar esses campos.'
                    : 'Para alterá-los, entre em contato com o administrador.'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Campos somente-leitura (dados do cadastro) */}
                {isAdmin ? (
                  <>
                    <div>
                      <label className="label">Escola</label>
                      <input className="input" {...register('escola')} />
                    </div>
                    <div>
                      <label className="label">Professor(a)</label>
                      <input className="input" {...register('professor')} />
                    </div>
                    <div>
                      <label className="label">MASP / Matrícula</label>
                      <input className="input" {...register('masp')} />
                    </div>
                  </>
                ) : (
                  <>
                    <ReadonlyField label="Escola"          value={user?.escola}      adminOnly />
                    <ReadonlyField label="Professor(a)"    value={user?.username}    adminOnly />
                    <ReadonlyField label="MASP / Matrícula" value={user?.masp}       adminOnly />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Disciplina — somente leitura se não for admin */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="label mb-0">Disciplina</label>
                    {!isAdmin && (
                      <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: '#fef3c7', color: '#92400e' }}>
                        <Lock size={9} /> Admin
                      </span>
                    )}
                  </div>
                  {isAdmin ? (
                    <select className="select" {...register('disciplina')}>
                      <option value="">Selecione…</option>
                      {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  ) : (
                    <div className="input" style={{ background: 'var(--slate)', cursor: 'default' }}>
                      {user?.disciplina || '—'}
                    </div>
                  )}
                </div>

                {/* Série — editável por todos */}
                <div>
                  <label className="label">Série / Ano</label>
                  <select className="select" {...register('serie')}>
                    <option value="">Selecione…</option>
                    {SERIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Turma</label>
                  <input className="input" placeholder="Ex: A, B, 301…" {...register('turma')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Data da Aula</label>
                  <input className="input" type="date" {...register('data_aula')} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Tema / Conteúdo</label>
                  <input className="input" placeholder="Ex: Frações e operações com frações" {...register('tema')} />
                </div>
              </div>

              <div className="mt-4">
                <label className="label">Duração</label>
                <input className="input" placeholder="Ex: 50 minutos / 2 aulas de 50 min" {...register('duracao')} />
              </div>
            </Section>

            {/* 2. BNCC */}
            <Section title="2. BNCC — Competências e Habilidades">

              {/* Competências — auto-preenchidas pela série */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="label mb-0">Competências</label>
                  {serieAtual && (
                    <span className="badge badge-teal text-xs">Auto-preenchido</span>
                  )}
                </div>
                <textarea className="textarea" rows={3}
                  placeholder="Selecione a Série acima para preencher automaticamente…"
                  {...register('competencias')} />
              </div>

              {/* Seletor BNCC */}
              <BNCCSelector
                disciplina={disciplinaAtual}
                serie={serieAtual}
                initialCodigos={isEditing ? getValues('codigos') : ''}
                onChange={({ codigos, habilidades }) => {
                  setValue('codigos', codigos)
                  setValue('habilidades', habilidades)
                }}
              />

              <div className="mt-4">
                <label className="label">Descrição complementar</label>
                <textarea className="textarea" rows={2}
                  placeholder="Informações adicionais sobre o conteúdo…"
                  {...register('descricao')} />
              </div>
            </Section>

            {/* 3. Planejamento */}
            <Section title="3. Planejamento da Aula">
              <div className="flex items-start gap-3 p-3 rounded-lg mb-5"
                style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                <Sparkles size={16} style={{ color: '#7c3aed', marginTop: 2, flexShrink: 0 }} />
                <p className="text-xs leading-relaxed" style={{ color: '#5b21b6' }}>
                  Use o botão <strong>"Gerar com IA"</strong> no topo para preencher automaticamente
                  os campos abaixo com base no tema e nas habilidades da BNCC selecionadas.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <LockableTextarea label="Objetivos" fieldName="objetivos" register={register}
                  locked={locked.objetivos} onToggleLock={() => setLocked(l => ({ ...l, objetivos: !l.objetivos }))} />
                <LockableTextarea label="Desenvolvimento" fieldName="desenvolvimento" register={register}
                  locked={locked.desenvolvimento} onToggleLock={() => setLocked(l => ({ ...l, desenvolvimento: !l.desenvolvimento }))} />
                <LockableTextarea label="Conclusão" fieldName="conclusao" register={register}
                  locked={locked.conclusao} onToggleLock={() => setLocked(l => ({ ...l, conclusao: !l.conclusao }))} />
                <div>
                  <label className="label">Observações</label>
                  <textarea className="textarea" rows={3} {...register('observacao')} />
                </div>
                <div>
                  <label className="label">Bibliografia</label>
                  <textarea className="textarea" rows={3} {...register('bibliografia')} />
                </div>
              </div>
            </Section>

            {/* 4. Inclusão / AEE */}
            <Section title="4. Inclusão, AEE e Superdotação" defaultOpen={false}>
              <div className="flex items-center gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setTemPAEE(!temPAEE)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all`}
                  style={temPAEE
                    ? { background: 'var(--teal)', borderColor: 'var(--teal)', color: 'white' }
                    : { background: 'white', borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  <UserCheck size={16} />
                  {temPAEE ? 'Turma com alunos PAEE/Superdotação' : 'Há alunos com necessidades na turma?'}
                </button>
              </div>

              {temPAEE && (
                <div className="fade-in">
                  <div className="p-4 rounded-lg mb-5"
                    style={{ background: 'var(--sage)', border: '1px solid #a7f3d0' }}>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} style={{ color: 'var(--teal)', marginTop: 2, flexShrink: 0 }} />
                      <p className="text-xs" style={{ color: 'var(--teal)' }}>
                        Selecione as necessidades e clique em <strong>"Gerar Relatório SAA"</strong> para que a IA
                        produza sugestões de atividades adaptadas.
                      </p>
                    </div>
                  </div>
                  <label className="label">Necessidades / Perfil</label>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {NECESSIDADES_OPTS.map(n => (
                      <button key={n} type="button" onClick={() => toggleNecessidade(n)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                        style={necessidades.includes(n)
                          ? { background: 'var(--teal)', borderColor: 'var(--teal)', color: 'white' }
                          : { background: 'white', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="mb-4">
                    <label className="label">Recursos / Apoios disponíveis</label>
                    <input className="input"
                      placeholder="Ex: sala de recursos, intérprete de Libras…"
                      value={recursos} onChange={e => setRecursos(e.target.value)} />
                  </div>
                  <button type="button" onClick={handleGerarSAA}
                    disabled={loadingSAA || necessidades.length === 0}
                    className="btn-teal gap-2 mb-5">
                    {loadingSAA ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    {loadingSAA ? 'Gerando relatório…' : 'Gerar Relatório SAA com IA'}
                  </button>
                  {watch('saa_text') && (
                    <div>
                      <label className="label">Sugestão de Atividade Adaptada (SAA)</label>
                      <textarea className="textarea" rows={8} {...register('saa_text')} />
                    </div>
                  )}
                </div>
              )}
            </Section>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={loadingSave} className="btn-primary gap-2 px-8">
              {loadingSave ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isEditing ? 'Salvar alterações' : 'Salvar plano'}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  )
}
