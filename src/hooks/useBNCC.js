// src/hooks/useBNCC.js
// ─────────────────────────────────────────────────────────────────────────────
// Substitui a versão anterior que lia um arquivo local (bncc_matematica.js)
// Agora consulta o backend FastAPI que serve todas as disciplinas do JSON completo
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../services/api'

// Cache em memória para não re-buscar enquanto a aba estiver aberta
let _cache = null
let _loading = false
let _listeners = []

function notificarListeners() {
  _listeners.forEach(fn => fn())
}

async function carregarTodasHabilidades() {
  if (_cache) return _cache
  if (_loading) {
    // Aguarda quem já está carregando
    return new Promise(resolve => {
      _listeners.push(() => resolve(_cache))
    })
  }
  _loading = true
  try {
    const { data } = await api.get('/api/bncc/habilidades')
    // Normaliza: backend retorna { codigo, texto, disciplina, area, serie, nivel }
    // BNCCSelector espera: { codigo, descricao, serie, disciplina }
    _cache = (data || []).map(h => ({
      codigo:     h.codigo,
      descricao:  h.texto,
      disciplina: h.disciplina,
      area:       h.area,
      serie:      h.serie,
      nivel:      h.nivel,
    }))
    notificarListeners()
    return _cache
  } catch (e) {
    console.error('[useBNCC] Erro ao carregar habilidades:', e)
    _cache = []
    return _cache
  } finally {
    _loading = false
    _listeners = []
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBNCC() {
  const [todasHabilidades, setTodasHabilidades] = useState(_cache || [])
  const [carregando, setCarregando] = useState(!_cache)

  // Carrega uma única vez por sessão
  useEffect(() => {
    if (_cache) {
      setTodasHabilidades(_cache)
      setCarregando(false)
      return
    }
    setCarregando(true)
    carregarTodasHabilidades().then(dados => {
      setTodasHabilidades(dados)
      setCarregando(false)
    })
  }, [])

  // Lista de disciplinas únicas disponíveis no banco
  const disciplinasDisponiveis = useMemo(() => {
    const set = new Set(todasHabilidades.map(h => h.disciplina))
    return [...set].sort()
  }, [todasHabilidades])

  // Séries disponíveis — opcionalmente filtradas por disciplina
  const getSeriesPorDisciplina = useCallback((disciplina) => {
    const base = disciplina
      ? todasHabilidades.filter(h => h.disciplina === disciplina)
      : todasHabilidades
    const set = new Set(base.map(h => h.serie))
    return [...set].sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, '') || '0')
      const nb = parseInt(b.replace(/\D/g, '') || '0')
      return na - nb
    })
  }, [todasHabilidades])

  // Habilidades filtradas por disciplina e/ou série
  const getHabilidades = useCallback((disciplina, serie) => {
    if (!disciplina) return []
    return todasHabilidades.filter(h => {
      const disciplinaOk = h.disciplina === disciplina
      const serieOk = !serie || h.serie === serie
      return disciplinaOk && serieOk
    })
  }, [todasHabilidades])

  // Busca por código exato
  const getDescricaoPorCodigo = useCallback((codigo) => {
    if (!codigo) return null
    const cod = codigo.trim().toUpperCase()
    const encontrada = todasHabilidades.find(h => h.codigo === cod)
    return encontrada?.descricao || null
  }, [todasHabilidades])

  // Busca livre por código ou texto da habilidade
  const buscar = useCallback((query, disciplina, serie) => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    const base = getHabilidades(disciplina, serie)
    // Se disciplina tem habilidades, busca só nelas; senão busca em tudo
    const pool = base.length > 0 ? base : todasHabilidades
    return pool
      .filter(h =>
        h.codigo.toLowerCase().includes(q) ||
        h.descricao.toLowerCase().includes(q)
      )
      .slice(0, 12)
  }, [todasHabilidades, getHabilidades])

  // Competências por série — geradas dinamicamente a partir dos dados
  const getCompetenciasPorSerie = useCallback((serie) => {
    // Retorna texto placeholder; competências completas podem ser expandidas
    // no futuro integrando o campo "competencia" do JSON da BNCC
    if (!serie) return ''
    return `Habilidades da BNCC para ${serie}.`
  }, [])

  return {
    todasHabilidades,
    carregando,
    disciplinasDisponiveis,
    getSeriesPorDisciplina,
    getHabilidades,
    getDescricaoPorCodigo,
    buscar,
    getCompetenciasPorSerie,
  }
}
