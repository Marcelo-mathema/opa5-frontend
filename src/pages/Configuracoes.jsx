// src/pages/Configuracoes.jsx
import Layout from '../components/layout/Layout'
import { useAuthStore } from '../store/authStore'

export default function Configuracoes() {
  const { user } = useAuthStore()
  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--navy)' }}>Configurações</h1>
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--navy)' }}>Meus Dados</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Nome', user?.nome_completo || user?.username],
              ['Usuário', user?.username],
              ['Disciplina', user?.disciplina || '—'],
              ['Escola', user?.escola || '—'],
              ['MASP', user?.masp || '—'],
              ['Plano', user?.plano || 'Gratuito'],
            ].map(([label, valor]) => (
              <div key={label} className="flex gap-2">
                <span className="text-slate-500 w-32">{label}:</span>
                <span className="font-medium">{valor}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">Para alterar seus dados, entre em contato com o administrador.</p>
        </div>
      </div>
    </Layout>
  )
}