// src/components/forms/BNCCSelector.jsx
// Componente completo de integração BNCC
// Funcionalidades:
//   1. Filtro por disciplina + série → lista de habilidades
//   2. Auto-completar ao digitar código (ex: EF06MA01)
//   3. Busca por texto na descrição

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, ChevronDown, X, Check, BookOpen, Loader2 } from 'lucide-react'
import { useBNCC } from '../../hooks/useBNCC'

// ── Badge de habilidade selecionada ───────────────────────────────────────────
function HabilidadeBadge({ codigo, descricao, onRemove }) {
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-lg border text-sm"
      style={{ background: 'var(--sage)', borderColor: '#a7f3d0' }}
    >
      <div className="flex-shrink-0">
        <span className="badge badge-teal font-mono text-xs">{codigo}</span>
      </div>
      <p className="flex-1 text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>
        {descricao}
      </p>
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ── Item da lista de sugestões ────────────────────────────────────────────────
function SugestaoItem({ habilidade, onSelect, selecionada }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(habilidade)}
      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <span className="badge badge-blue font-mono text-xs">{habilidade.codigo}</span>
      </div>
      <p className="flex-1 text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>
        {habilidade.descricao.length > 120
          ? habilidade.descricao.slice(0, 120) + '…'
          : habilidade.descricao}
      </p>
      {selecionada && (
        <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--teal)' }} />
      )}
    </button>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function BNCCSelector({
  disciplina,        // vem do formulário principal
  serie,             // vem do formulário principal
  onChange,          // callback: ({ codigos, habilidades, competencias }) => void
  initialCodigos,    // códigos já salvos (edição)
}) {
  const { getHabilidades, getDescricaoPorCodigo, buscar } = useBNCC()

  const [selecionadas, setSelecionadas] = useState([])   // habilidades escolhidas
  const [query, setQuery] = useState('')                 // campo de busca
  const [sugestoes, setSugestoes] = useState([])         // dropdown
  const [showLista, setShowLista] = useState(false)      // lista completa
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const dropRef = useRef(null)

  // Carrega habilidades já salvas ao editar
  useEffect(() => {
    if (!initialCodigos) return
    const codigos = initialCodigos.split(/[,\s]+/).map(c => c.trim()).filter(Boolean)
    const carregadas = codigos.map(cod => {
      const desc = getDescricaoPorCodigo(cod)
      return desc ? { codigo: cod, descricao: desc } : null
    }).filter(Boolean)
    if (carregadas.length) setSelecionadas(carregadas)
  }, [initialCodigos])

  // Notifica o formulário pai sempre que seleção mudar
  useEffect(() => {
    const codigos = selecionadas.map(h => h.codigo).join(', ')
    const habilidades = selecionadas.map(h => `${h.codigo} — ${h.descricao}`).join('\n')
    onChange?.({ codigos, habilidades, competencias: '' })
  }, [selecionadas])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setSugestoes([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Busca com debounce
  useEffect(() => {
    if (!query || query.length < 2) { setSugestoes([]); return }
    setSearching(true)
    const t = setTimeout(() => {
      const results = buscar(query, disciplina, serie)
      setSugestoes(results)
      setSearching(false)
    }, 250)
    return () => clearTimeout(t)
  }, [query, disciplina, serie])

  // Auto-completar quando digita código exato
  useEffect(() => {
    const cod = query.trim().toUpperCase()
    if (cod.length >= 8) {
      const desc = getDescricaoPorCodigo(cod)
      if (desc && !selecionadas.find(h => h.codigo === cod)) {
        adicionarHabilidade({ codigo: cod, descricao: desc })
        setQuery('')
      }
    }
  }, [query])

  const adicionarHabilidade = useCallback((h) => {
    setSelecionadas(prev => {
      if (prev.find(x => x.codigo === h.codigo)) return prev
      return [...prev, h]
    })
    setSugestoes([])
    setQuery('')
  }, [])

  const removerHabilidade = useCallback((codigo) => {
    setSelecionadas(prev => prev.filter(h => h.codigo !== codigo))
  }, [])

  // Lista completa de habilidades para disciplina+série
  const listaCompleta = getHabilidades(disciplina, serie)
  const temBNCC = listaCompleta.length > 0

  return (
    <div className="flex flex-col gap-4">

      {/* Aviso se disciplina não tem BNCC disponível */}
      {disciplina && !temBNCC && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-xs"
          style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
          <BookOpen size={14} className="flex-shrink-0" />
          Base BNCC de <strong>{disciplina}</strong> ainda não disponível. Você pode digitar os códigos manualmente.
        </div>
      )}

      {/* Campo de busca / auto-completar */}
      <div ref={dropRef} className="relative">
        <label className="label">Buscar habilidades BNCC</label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted)' }} />
          {searching && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: 'var(--muted)' }} />
          )}
          <input
            ref={inputRef}
            className="input pl-9"
            placeholder={temBNCC
              ? `Digite o código (ex: EF06MA01) ou trecho da habilidade…`
              : `Digite o código BNCC (ex: EF06MA01)…`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setSugestoes(buscar(query, disciplina, serie))}
          />
        </div>

        {/* Dropdown de sugestões */}
        {sugestoes.length > 0 && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto scrollbar-thin fade-in"
            style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-2 border-b text-xs font-semibold" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
              {sugestoes.length} resultado{sugestoes.length !== 1 ? 's' : ''}
            </div>
            {sugestoes.map(h => (
              <SugestaoItem
                key={h.codigo}
                habilidade={h}
                onSelect={adicionarHabilidade}
                selecionada={!!selecionadas.find(x => x.codigo === h.codigo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botão lista completa */}
      {temBNCC && (
        <div>
          <button
            type="button"
            onClick={() => setShowLista(!showLista)}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: 'var(--blue)' }}
          >
            <ChevronDown size={15} className={`transition-transform ${showLista ? 'rotate-180' : ''}`} />
            {showLista ? 'Ocultar' : 'Ver todas as habilidades'} de {disciplina}
            {serie && ` — ${serie}`}
            <span className="badge badge-blue ml-1">{listaCompleta.length}</span>
          </button>

          {showLista && (
            <div className="mt-3 border rounded-xl overflow-hidden max-h-80 overflow-y-auto scrollbar-thin fade-in"
              style={{ borderColor: 'var(--border)' }}>
              {listaCompleta.map(h => (
                <SugestaoItem
                  key={h.codigo}
                  habilidade={h}
                  onSelect={adicionarHabilidade}
                  selecionada={!!selecionadas.find(x => x.codigo === h.codigo)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Habilidades selecionadas */}
      {selecionadas.length > 0 && (
        <div className="flex flex-col gap-2 fade-in">
          <div className="flex items-center justify-between">
            <label className="label mb-0">
              Habilidades selecionadas
              <span className="badge badge-teal ml-2">{selecionadas.length}</span>
            </label>
            <button
              type="button"
              onClick={() => setSelecionadas([])}
              className="text-xs hover:text-red-500 transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              Limpar todas
            </button>
          </div>
          {selecionadas.map(h => (
            <HabilidadeBadge
              key={h.codigo}
              codigo={h.codigo}
              descricao={h.descricao}
              onRemove={() => removerHabilidade(h.codigo)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
