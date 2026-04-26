// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'

const DISCIPLINAS = [
  'Matemática','Português','História','Geografia','Ciências',
  'Biologia','Física','Química','Arte','Educação Física',
  'Inglês','Filosofia','Sociologia','Ensino Religioso','Outra',
]

// Gera username sem acentos/espaços a partir do nome completo
const gerarUsername = (nome) =>
  nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')

export default function Register() {
  const [showPw, setShowPw]   = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [usernameGerado, setUsernameGerado] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const senha    = watch('password')
  const nomeWatch = watch('nome_completo') || ''
  const previewUsername = gerarUsername(nomeWatch)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const username = gerarUsername(data.nome_completo)
      if (username.length < 3) {
        toast.error('Nome muito curto para gerar um usuário válido.')
        setLoading(false)
        return
      }
      // Envia nome_completo separado — salvo com acentos e espaços no banco
      await api.post('/api/auth/register', {
        username,
        nome_completo: data.nome_completo.trim(),
        password: data.password,
        disciplina: data.disciplina || '',
        escola: data.escola || '',
        masp: data.masp || '',
      })
      setUsernameGerado(username)
      setDone(true)
      toast.success(`Conta criada! Usuário: ${username}`)
      setTimeout(() => navigate('/login'), 3500)
    } catch (e) {
      const msg = e.response?.data?.detail
      toast.error(msg === 'Usuário já existe.'
        ? 'Nome já em uso. Tente adicionar uma inicial ou número.'
        : msg || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--navy)' }}>
      {/* ═══════════════════════════════════════════
          PAINEL ESQUERDO — visível apenas em desktop
          ─ CORRIGIDO: usa a logo real igual ao Login
      ════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full border-2 border-white translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full border border-white -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Logo — idêntica à do Login */}
        <div className="relative">
          <img
            src="/logo_opa_login.png"
            alt="OPA — Otimização do Plano de Aula"
            className="h-16 w-auto object-contain"
          />
        </div>

        <div className="relative">
          <h1 className="text-white font-display text-5xl leading-tight mb-6">
            Comece grátis.<br />
            <em className="not-italic" style={{ color: 'var(--teal-light)' }}>Sem cartão</em><br />
            necessário.
          </h1>
          <div className="flex flex-col gap-4">
            {[
              { titulo: 'Plano gratuito', desc: '3 planos de aula por mês sem custo' },
              { titulo: 'BNCC integrada', desc: 'Competências preenchidas automaticamente' },
              { titulo: 'IA para inclusão', desc: 'Relatórios SAA gerados em segundos' },
              { titulo: 'PDF profissional', desc: 'Com logo da sua escola incluída' },
            ].map(b => (
              <div key={b.titulo} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--teal)' }}>
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{b.titulo}</p>
                  <p className="text-blue-300 text-xs">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-blue-300 text-xs">© {new Date().getFullYear()} OPA – MPA Produtos. Todos os direitos reservados.</p>
      </div>

      {/* ═══════════════════════════════════════════
          PAINEL DIREITO — Formulário
      ════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white lg:rounded-l-3xl overflow-y-auto">
        <div className="w-full max-w-md fade-in py-4">

          {/* Logo mobile — visível só em telas pequenas
              CORRIGIDO: usa a logo real igual ao Login */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <img
              src="/logo_opa_login.png"
              alt="OPA — Otimização do Plano de Aula"
              className="h-8 w-auto object-contain"
            />
          </div>

          {done ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center fade-in">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--sage)' }}>
                <CheckCircle2 size={40} style={{ color: 'var(--teal)' }} />
              </div>
              <h2 className="font-display text-2xl" style={{ color: 'var(--navy)' }}>Conta criada!</h2>
              <div className="p-4 rounded-xl w-full" style={{ background: 'var(--slate)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Seu usuário para login:</p>
                <p className="font-mono font-bold text-lg" style={{ color: 'var(--navy)' }}>{usernameGerado}</p>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Redirecionando para o login…</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl mb-1" style={{ color: 'var(--navy)' }}>Criar conta grátis</h2>
              <p className="text-sm mb-7" style={{ color: 'var(--muted)' }}>Preencha seus dados para começar.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                {/* Nome completo */}
                <div>
                  <label className="label">Nome completo <span className="text-red-400">*</span></label>
                  <input
                    className={`input ${errors.nome_completo ? 'border-red-400' : ''}`}
                    placeholder="Ex: Marcelo Pereira Antônio"
                    {...register('nome_completo', {
                      required: 'Informe seu nome completo',
                      minLength: { value: 4, message: 'Mínimo 4 caracteres' },
                    })}
                  />
                  {errors.nome_completo
                    ? <p className="text-red-500 text-xs mt-1">{errors.nome_completo.message}</p>
                    : previewUsername.length >= 3
                      ? <p className="text-xs mt-1" style={{ color: 'var(--teal)' }}>
                          ✓ Usuário gerado automaticamente: <strong>{previewUsername}</strong>
                        </p>
                      : <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                          Use seu nome completo com acentos normalmente
                        </p>
                  }
                </div>

                {/* Senha */}
                <div>
                  <label className="label">Senha <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                      type={showPw ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                      {...register('password', { required: 'Informe uma senha', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="label">Confirmar senha <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input className={`input pr-10 ${errors.confirm ? 'border-red-400' : ''}`}
                      type={showPw2 ? 'text' : 'password'} placeholder="Repita a senha"
                      {...register('confirm', { required: 'Confirme a senha', validate: v => v === senha || 'As senhas não coincidem' })} />
                    <button type="button" onClick={() => setShowPw2(!showPw2)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
                </div>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Dados profissionais (opcional)</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                <div>
                  <label className="label">Disciplina</label>
                  <select className="select" {...register('disciplina')}>
                    <option value="">Selecione…</option>
                    {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Escola</label>
                    <input className="input" placeholder="Nome da escola" {...register('escola')} />
                  </div>
                  <div>
                    <label className="label">MASP / Matrícula</label>
                    <input className="input" placeholder="000000" {...register('masp')} />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn w-full py-3 text-base mt-2 text-white" style={{ background: 'var(--navy)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                      </svg>
                      Criando conta…
                    </span>
                  ) : 'Criar conta grátis'}
                </button>
              </form>

              <p className="text-center text-sm mt-5" style={{ color: 'var(--muted)' }}>
                Já tem conta?{' '}
                <Link to="/login" className="font-semibold" style={{ color: 'var(--blue)' }}>
                  Fazer login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
