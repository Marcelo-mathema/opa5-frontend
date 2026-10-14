// src/components/GoogleSignIn.jsx
// "Entrar com Google" (Login) e "Cadastrar com Google" (Register).
//
// - Pergunta ao backend se o Google está ativado (GET /api/auth/google/config). Se não estiver,
//   o componente simplesmente não aparece (nada quebra, nada é mostrado).
// - O Google devolve um token; quem o VALIDA é o backend. Aqui só repassamos.
// - Três desfechos: entra direto; pede a senha UMA vez para vincular uma conta já existente;
//   ou pede escola/disciplina/MASP para criar a conta.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import SchoolCombobox from './forms/SchoolCombobox'

const GSI_SRC = 'https://accounts.google.com/gsi/client'

const DISCIPLINAS = [
  'Matemática', 'Português', 'História', 'Geografia', 'Ciências',
  'Biologia', 'Física', 'Química', 'Arte', 'Educação Física',
  'Inglês', 'Filosofia', 'Sociologia', 'Ensino Religioso', 'Outra',
]

// Cliente sem os interceptadores do app: um 401 aqui (ex.: senha errada ao vincular)
// não deve derrubar a sessão nem recarregar a página.
const http = axios.create({
  baseURL: api.defaults.baseURL,
  headers: { 'Content-Type': 'application/json' },
})

function carregarGSI() {
  return new Promise((resolve, reject) => {
    const pronto = () => window.google && window.google.accounts && window.google.accounts.id
    if (pronto()) return resolve(window.google)
    if (!document.querySelector(`script[src="${GSI_SRC}"]`)) {
      const s = document.createElement('script')
      s.src = GSI_SRC
      s.async = true
      s.defer = true
      s.onerror = () => reject(new Error('Falha ao carregar o Google'))
      document.head.appendChild(s)
    }
    let espera = 0
    const iv = setInterval(() => {
      if (pronto()) { clearInterval(iv); resolve(window.google) }
      else if ((espera += 100) > 8000) { clearInterval(iv); reject(new Error('Tempo esgotado')) }
    }, 100)
  })
}

const mensagemDeErro = (e, padrao) => {
  const d = e.response && e.response.data && e.response.data.detail
  if (typeof d === 'string') return d
  if (d && d.message) return d.message
  return padrao
}

export default function GoogleSignIn({ modo = 'login' }) {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const btnRef = useRef(null)

  const [cfg, setCfg] = useState(null)       // { enabled, client_id }
  const [passo, setPasso] = useState(null)   // null | { tipo: 'vincular' | 'cadastro', credential, email }
  const [enviando, setEnviando] = useState(false)
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [masp, setMasp] = useState('')
  const [escolaData, setEscolaData] = useState({ nome: '', school_id: null })

  const concluir = (data) => {
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
  }

  const aoReceberCredencial = async (resposta) => {
    const credential = resposta && resposta.credential
    if (!credential) return
    try {
      const { data } = await http.post('/api/auth/google', { credential })
      concluir(data)
    } catch (e) {
      const d = e.response && e.response.data && e.response.data.detail
      if (d && d.code === 'VINCULAR_CONTA') {
        setSenha('')
        setPasso({ tipo: 'vincular', credential, email: d.email })
      } else if (d && d.code === 'GOOGLE_NAO_CADASTRADO') {
        setNome(d.nome || '')
        setPasso({ tipo: 'cadastro', credential, email: d.email })
      } else {
        toast.error(mensagemDeErro(e, 'Não foi possível entrar com o Google.'))
      }
    }
  }

  const vincular = async () => {
    setEnviando(true)
    try {
      const { data } = await http.post('/api/auth/google/vincular', {
        credential: passo.credential, password: senha,
      })
      concluir(data)
    } catch (e) {
      toast.error(mensagemDeErro(e, 'Não foi possível vincular a conta.'))
    } finally {
      setEnviando(false)
    }
  }

  const cadastrar = async () => {
    setEnviando(true)
    try {
      const { data } = await http.post('/api/auth/google/cadastro', {
        credential: passo.credential,
        nome_completo: nome.trim(),
        disciplina,
        escola: escolaData.nome || '',
        school_id: escolaData.school_id || null,
        masp,
      })
      concluir(data)
    } catch (e) {
      const d = e.response && e.response.data && e.response.data.detail
      if (d && d.code === 'VINCULAR_CONTA') {
        setSenha('')
        setPasso({ tipo: 'vincular', credential: passo.credential, email: d.email })
      } else {
        toast.error(mensagemDeErro(e, 'Não foi possível criar a conta.'))
      }
    } finally {
      setEnviando(false)
    }
  }

  // 1) O Google está ativado no backend?
  useEffect(() => {
    let cancelado = false
    http.get('/api/auth/google/config')
      .then(({ data }) => { if (!cancelado) setCfg(data) })
      .catch(() => { if (!cancelado) setCfg({ enabled: false }) })
    return () => { cancelado = true }
  }, [])

  // 2) Se estiver, desenha o botão oficial do Google
  useEffect(() => {
    if (!cfg || !cfg.enabled || !btnRef.current) return
    let cancelado = false
    carregarGSI().then((google) => {
      if (cancelado || !btnRef.current) return
      google.accounts.id.initialize({
        client_id: cfg.client_id,
        callback: aoReceberCredencial,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        text: modo === 'cadastro' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        locale: 'pt-BR',
        width: Math.min(360, btnRef.current.offsetWidth || 320),
      })
    }).catch(() => { /* bloqueador de anúncios ou sem internet: o botão só não aparece */ })
    return () => { cancelado = true }
  }, [cfg])

  if (!cfg || !cfg.enabled) return null

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>ou</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <div ref={btnRef} className="flex justify-center" style={{ minHeight: 44 }} />

      {passo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,.55)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl overflow-y-auto"
            style={{ maxHeight: '92vh' }}>

            {passo.tipo === 'vincular' ? (
              <>
                <h3 className="font-display text-xl mb-2" style={{ color: 'var(--navy)' }}>
                  Vincular sua conta Google
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                  Já existe uma conta OPA com o e-mail <strong>{passo.email}</strong>. Digite a senha
                  dessa conta para vinculá-la ao Google. Isso é pedido só desta primeira vez.
                </p>
                <label className="label">Senha da conta OPA</label>
                <input
                  className="input"
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && senha && !enviando) vincular() }}
                />
                <div className="flex justify-end gap-2 mt-5">
                  <button type="button" className="btn-ghost" onClick={() => setPasso(null)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn-primary" disabled={enviando || !senha} onClick={vincular}>
                    {enviando ? 'Vinculando…' : 'Vincular e entrar'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-display text-xl mb-2" style={{ color: 'var(--navy)' }}>
                  Complete seu cadastro
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                  Sua conta Google ainda não tem cadastro no OPA. Confirme os dados abaixo para criar a conta.
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label">Nome completo</label>
                    <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">E-mail (do Google)</label>
                    <input className="input" value={passo.email} readOnly
                      style={{ background: 'var(--slate)', cursor: 'default' }} />
                  </div>
                  <div>
                    <label className="label">Disciplina</label>
                    <select className="select" value={disciplina} onChange={(e) => setDisciplina(e.target.value)}>
                      <option value="">Selecione…</option>
                      {DISCIPLINAS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <SchoolCombobox value={escolaData} onChange={setEscolaData} />
                  <div>
                    <label className="label">MASP / Matrícula</label>
                    <input className="input" placeholder="000000" value={masp}
                      onChange={(e) => setMasp(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <button type="button" className="btn-ghost" onClick={() => setPasso(null)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn-primary"
                    disabled={enviando || nome.trim().length < 3} onClick={cadastrar}>
                    {enviando ? 'Criando conta…' : 'Criar conta e entrar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
