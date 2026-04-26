// src/pages/Admin.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Building2, Edit3, Trash2, Upload,
  Plus, X, Check, Loader2, ArrowLeft,
  Eye, EyeOff, RefreshCw, Link as LinkIcon,
  Pencil
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import Layout from '../components/layout/Layout'

const DISCIPLINAS = [
  'Matemática','Português','História','Geografia','Ciências',
  'Biologia','Física','Química','Arte','Educação Física',
  'Inglês','Filosofia','Sociologia','Ensino Religioso','Outra',
]

function Tab({ label, icon: Icon, active, onClick, badge }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
        active ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}>
      <Icon size={16} />
      {label}
      {badge != null && <span className={`badge ${active ? 'badge-blue' : 'bg-gray-100 text-gray-500'}`}>{badge}</span>}
    </button>
  )
}

function EditUserModal({ user, schools, onClose, onSave }) {
  const [form, setForm] = useState({
    role: user.role,
    is_active: user.is_active,
    nome_completo: user.nome_completo || '',
    disciplina: user.disciplina || '',
    school_id: user.school_id || '',
    masp: user.masp || '',
    new_password: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.new_password) delete payload.new_password
      if (!payload.school_id) delete payload.school_id
      else payload.school_id = parseInt(payload.school_id)
      await api.put(`/api/admin/users/${user.id}`, payload)
      toast.success('Usuário atualizado!')
      onSave(); onClose()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao atualizar.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-display text-lg" style={{ color: 'var(--navy)' }}>
            Editar: <span className="text-blue-600">{user.username}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="label">Nome completo</label>
            <input className="input" placeholder="Nome com acentos e espaços"
              value={form.nome_completo}
              onChange={e => setForm(f => ({ ...f, nome_completo: e.target.value }))} />
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Este nome aparece no PDF do plano de aula
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Perfil</label>
              <select className="select" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">Professor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={String(form.is_active)}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Disciplina</label>
            <select className="select" value={form.disciplina}
              onChange={e => setForm(f => ({ ...f, disciplina: e.target.value }))}>
              <option value="">Selecione…</option>
              {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="label flex items-center gap-1">
              <LinkIcon size={11} /> Escola vinculada
            </label>
            <select className="select" value={form.school_id}
              onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}>
              <option value="">Sem escola vinculada</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              A logo desta escola aparece no PDF do professor
            </p>
          </div>

          <div>
            <label className="label">MASP</label>
            <input className="input" value={form.masp}
              onChange={e => setForm(f => ({ ...f, masp: e.target.value }))} />
          </div>

          <div>
            <label className="label">Nova senha (opcional)</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'}
                placeholder="Deixe em branco para não alterar"
                value={form.new_password}
                onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-5 sticky bottom-0 bg-white border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={save} disabled={loading} className="btn-primary gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

function NewSchoolModal({ onClose, onSave }) {
  const [nome, setNome] = useState('')
  const [logo, setLogo] = useState(null)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!nome.trim()) return toast.error('Informe o nome da escola.')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('nome', nome.trim())
      if (logo) fd.append('logo', logo)
      await api.post('/api/admin/schools', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Escola cadastrada!')
      onSave(); onClose()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao cadastrar.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-display text-lg" style={{ color: 'var(--navy)' }}>Nova Escola</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="label">Nome da escola</label>
            <input className="input" placeholder="Ex: E.E. João Paulo II"
              value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div>
            <label className="label">Logo (PNG/JPG)</label>
            <input type="file" accept=".png,.jpg,.jpeg,.webp"
              className="input py-2 text-sm cursor-pointer"
              onChange={e => setLogo(e.target.files[0])} />
            {logo && <p className="text-xs mt-1 text-green-600">✓ {logo.name}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={save} disabled={loading} className="btn-primary gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  )
}

function EditSchoolModal({ school, onClose, onSave }) {
  const [nome, setNome] = useState(school.nome)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!nome.trim()) return toast.error('Informe o nome da escola.')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('nome', nome.trim())
      await api.put(`/api/admin/schools/${school.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Escola atualizada!')
      onSave(); onClose()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao atualizar escola.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-display text-lg" style={{ color: 'var(--navy)' }}>Editar Escola</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">
          <label className="label">Nome da escola</label>
          <input className="input" value={nome} onChange={e => setNome(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={save} disabled={loading} className="btn-primary gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteSchoolModal({ school, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm fade-in">
        <div className="px-6 py-5">
          <h3 className="font-display text-lg mb-2" style={{ color: '#ef4444' }}>Deletar Escola</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Tem certeza que deseja remover <strong style={{ color: 'var(--navy)' }}>{school.nome}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          {school.users_count > 0 && (
            <p className="text-xs mt-3 p-3 bg-red-50 rounded-lg text-red-600">
              ⚠ Esta escola possui {school.users_count} professor{school.users_count !== 1 ? 'es' : ''} vinculado{school.users_count !== 1 ? 's' : ''}.
              Desvincule-os antes de deletar.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button
            onClick={confirm}
            disabled={loading || school.users_count > 0}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ background: '#ef4444' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [tab, setTab]         = useState('usuarios')
  const [users, setUsers]     = useState([])
  const [schools, setSchools] = useState([])
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser]       = useState(null)
  const [newSchool, setNewSchool]     = useState(false)
  const [editSchool, setEditSchool]   = useState(null)
  const [deleteSchool, setDeleteSchool] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(null)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard')
      toast.error('Acesso restrito a administradores.')
    }
  }, [user])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [u, s, st] = await Promise.all([
        api.get('/api/admin/users').then(r => r.data),
        api.get('/api/admin/schools').then(r => r.data),
        api.get('/api/admin/stats').then(r => r.data),
      ])
      setUsers(u); setSchools(s); setStats(st)
    } catch { toast.error('Erro ao carregar dados.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleDeleteUser = async (uid) => {
    if (!confirm('Excluir este usuário permanentemente?')) return
    try {
      await api.delete(`/api/admin/users/${uid}`)
      toast.success('Usuário removido.')
      fetchAll()
    } catch (e) { toast.error(e.response?.data?.detail || 'Erro.') }
  }

  const handleUploadLogo = async (schoolId, file) => {
    if (!file) return
    setUploadingLogo(schoolId)
    try {
      const fd = new FormData()
      fd.append('logo', file)
      await api.post(`/api/admin/schools/${schoolId}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Logo atualizada!')
      fetchAll()
    } catch { toast.error('Erro ao enviar logo.') }
    finally { setUploadingLogo(null) }
  }

  const handleDeleteSchool = async () => {
    try {
      await api.delete(`/api/admin/schools/${deleteSchool.id}`)
      toast.success('Escola removida!')
      setDeleteSchool(null)
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao remover escola.')
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2 rounded-lg">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-display text-3xl" style={{ color: 'var(--navy)' }}>Painel Administrativo</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              Gerencie usuários, escolas e configurações do OPA5
            </p>
          </div>
          <button onClick={fetchAll} className="btn-ghost gap-2 ml-auto">
            <RefreshCw size={15} /> Atualizar
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {[
              { label: 'Usuários', value: stats.total_users, color: 'var(--blue)' },
              { label: 'Ativos', value: stats.active_users, color: 'var(--teal)' },
              { label: 'Planos', value: stats.total_planos, color: 'var(--navy)' },
              { label: 'Este mês', value: stats.planos_this_month, color: '#7c3aed' },
              { label: 'Escolas', value: stats.total_schools, color: '#d97706' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center fade-in">
                <p className="text-2xl font-display" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="flex border-b px-2" style={{ borderColor: 'var(--border)' }}>
            <Tab label="Usuários" icon={Users} active={tab === 'usuarios'}
              onClick={() => setTab('usuarios')} badge={users.length} />
            <Tab label="Escolas" icon={Building2} active={tab === 'escolas'}
              onClick={() => setTab('escolas')} badge={schools.length} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--blue)' }} />
            </div>
          ) : tab === 'usuarios' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--slate)' }}>
                    {['Professor', 'Nome Completo', 'Perfil', 'Disciplina', 'Escola', 'Planos', 'Status', 'Ações'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: u.role === 'admin' ? 'var(--navy)' : 'var(--blue)' }}>
                            {(u.nome_completo || u.username)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{u.username}</p>
                            {u.masp && <p className="text-xs" style={{ color: 'var(--muted)' }}>{u.masp}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm" style={{ color: 'var(--navy)' }}>
                          {u.nome_completo || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 'admin' ? '🔐 Admin' : 'Professor'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{u.disciplina || '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{u.escola || '—'}</td>
                      <td className="px-4 py-3"><span className="badge badge-teal">{u.planos_count}</span></td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.is_active ? 'badge-teal' : 'badge-red'}`}>
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditUser(u)}
                            className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                            style={{ color: 'var(--blue)' }} title="Editar">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors" title="Excluir">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div className="flex justify-end px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => setNewSchool(true)} className="btn-primary gap-2 text-sm">
                  <Plus size={14} /> Nova Escola
                </button>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {schools.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Building2 size={32} style={{ color: 'var(--border)' }} />
                    <p style={{ color: 'var(--muted)' }}>Nenhuma escola cadastrada</p>
                    <button onClick={() => setNewSchool(true)} className="btn-primary gap-2 text-sm">
                      <Plus size={14} /> Cadastrar escola
                    </button>
                  </div>
                ) : schools.map(s => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50"
                      style={{ borderColor: 'var(--border)' }}>
                      {s.logo_path ? (
                        <img
                          src={s.logo_path?.startsWith('http') ? s.logo_path : `${import.meta.env.VITE_API_URL}/uploads/${s.logo_path}`}
                          alt={s.nome} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Building2 size={22} style={{ color: 'var(--border)' }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{s.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="badge badge-blue text-xs">{s.plan_type}</span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>
                          {s.users_count} professor{s.users_count !== 1 ? 'es' : ''}
                        </span>
                        {s.logo_path
                          ? <span className="text-xs font-medium" style={{ color: 'var(--teal)' }}>✓ Logo cadastrada</span>
                          : <span className="text-xs" style={{ color: '#d97706' }}>⚠ Sem logo</span>
                        }
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Upload logo */}
                      <label className="btn-outline gap-2 text-xs cursor-pointer">
                        {uploadingLogo === s.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Upload size={13} />}
                        {s.logo_path ? 'Trocar logo' : 'Enviar logo'}
                        <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden"
                          onChange={e => handleUploadLogo(s.id, e.target.files[0])} />
                      </label>

                      {/* Editar */}
                      <button
                        onClick={() => setEditSchool(s)}
                        className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar escola"
                        style={{ color: 'var(--blue)' }}
                      >
                        <Pencil size={15} />
                      </button>

                      {/* Deletar */}
                      <button
                        onClick={() => setDeleteSchool(s)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Deletar escola"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editUser && <EditUserModal user={editUser} schools={schools} onClose={() => setEditUser(null)} onSave={fetchAll} />}
      {newSchool && <NewSchoolModal onClose={() => setNewSchool(false)} onSave={fetchAll} />}
      {editSchool && <EditSchoolModal school={editSchool} onClose={() => setEditSchool(null)} onSave={fetchAll} />}
      {deleteSchool && <DeleteSchoolModal school={deleteSchool} onClose={() => setDeleteSchool(null)} onConfirm={handleDeleteSchool} />}
    </Layout>
  )
}
