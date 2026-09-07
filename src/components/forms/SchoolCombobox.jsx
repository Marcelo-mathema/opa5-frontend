// src/components/forms/SchoolCombobox.jsx
// Combobox para seleção de escola no cadastro.
//
// Comportamento:
//   - Ao digitar, busca escolas cadastradas pelo admin via API
//   - Se selecionar da lista → registra school_id + nome
//   - Se digitar livremente → registra apenas o nome (escola não vinculada)
//   - Mostra ícone de verificado nas escolas com logo cadastrada

import { useState, useEffect, useRef } from 'react'
import { Search, X, Check, Building2 } from 'lucide-react'
import { api } from '../../services/api'

export default function SchoolCombobox({ value, onChange, error }) {
  // value = { nome: string, school_id: number|null }
  // onChange = (val: { nome: string, school_id: number|null }) => void

  const [query, setQuery] = useState(value?.nome || '')
  const [sugestoes, setSugestoes] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selecionada, setSelecionada] = useState(!!value?.school_id)
  const dropRef = useRef(null)
  const inputRef = useRef(null)

  // Busca escolas no backend com debounce
  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.length < 2 && !showDropdown) {
        setSugestoes([])
        return
      }
      setLoading(true)
      try {
        const { data } = await api.get('/api/schools/search', {
          params: { q: query },
        })
        setSugestoes(data || [])
      } catch {
        setSugestoes([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (escola) => {
    setQuery(escola.nome)
    setSelecionada(true)
    setShowDropdown(false)
    onChange({ nome: escola.nome, school_id: escola.id })
  }

  const handleClear = () => {
    setQuery('')
    setSelecionada(false)
    onChange({ nome: '', school_id: null })
    inputRef.current?.focus()
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setSelecionada(false)
    setShowDropdown(true)
    onChange({ nome: val, school_id: null })
  }

  const handleFocus = () => {
    setShowDropdown(true)
    // Carrega lista inicial se não tem query
    if (query.length < 2 && sugestoes.length === 0) {
      setLoading(true)
      api.get('/api/schools/search', { params: { q: '' } })
        .then(({ data }) => setSugestoes(data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }

  return (
    <div ref={dropRef} className="relative">
      <label className="label">Escola</label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--muted)' }} />
        <input
          ref={inputRef}
          className={`input pl-9 pr-8 ${error ? 'border-red-400' : ''} ${
            selecionada ? 'border-green-300 bg-green-50/50' : ''
          }`}
          placeholder="Digite para buscar ou cadastrar nova…"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {selecionada && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--teal)' }}>
          <Check size={12} /> Escola vinculada — logo herdada automaticamente
        </p>
      )}
      {!selecionada && query.length >= 2 && (
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Selecione da lista ou continue digitando para cadastrar nova
        </p>
      )}

      {/* Dropdown de sugestões */}
      {showDropdown && sugestoes.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto scrollbar-thin fade-in"
          style={{ borderColor: 'var(--border)' }}>
          <div className="px-3 py-2 border-b text-xs font-semibold"
            style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
            {sugestoes.length} escola{sugestoes.length !== 1 ? 's' : ''} cadastrada{sugestoes.length !== 1 ? 's' : ''}
          </div>
          {sugestoes.map(escola => (
            <button
              key={escola.id}
              type="button"
              onClick={() => handleSelect(escola)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <Building2 size={16} className="flex-shrink-0"
                style={{ color: escola.tem_logo ? 'var(--teal)' : 'var(--muted)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--ink)' }}>
                  {escola.nome}
                </p>
                {escola.tem_logo && (
                  <p className="text-xs" style={{ color: 'var(--teal)' }}>
                    Logo disponível
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && loading && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-lg px-4 py-3 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          Buscando escolas…
        </div>
      )}
    </div>
  )
}