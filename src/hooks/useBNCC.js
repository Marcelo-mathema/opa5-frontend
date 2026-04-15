// src/hooks/useBNCC.js
import { useMemo, useCallback } from 'react'
import BANCO_BNCC from '../data/bncc_matematica'

const PREFIXO_SERIE = {
  EF06MA:  '6º Ano EF',
  EF07MA:  '7º Ano EF',
  EF08MA:  '8º Ano EF',
  EF09MA:  '9º Ano EF',
  EM13MAT: 'Ensino Médio',
}

const DISCIPLINA_PREFIXOS = {
  'Matemática': ['EF06MA', 'EF07MA', 'EF08MA', 'EF09MA', 'EM13MAT'],
}

// Competências BNCC por série — preenchidas automaticamente ao selecionar série
const COMPETENCIAS_POR_SERIE = {
  '6º Ano EF': 'Competência Específica 1: Reconhecer que a Matemática é uma ciência humana, fruto da necessidade e curiosidade humanas. Competência Específica 3: Compreender as relações entre conceitos e procedimentos dos diferentes campos da Matemática (Aritmética, Álgebra, Geometria, Estatística e Probabilidade).',
  '7º Ano EF': 'Competência Específica 2: Desenvolver o raciocínio lógico, o espírito de investigação e a capacidade de produzir argumentos convincentes. Competência Específica 4: Fazer observações sistemáticas de aspectos quantitativos e qualitativos presentes nas práticas sociais.',
  '8º Ano EF': 'Competência Específica 3: Compreender as relações entre conceitos e procedimentos dos diferentes campos da Matemática. Competência Específica 5: Utilizar processos e ferramentas matemáticas, inclusive tecnologias digitais disponíveis, para modelar e resolver problemas cotidianos.',
  '9º Ano EF': 'Competência Específica 4: Fazer observações sistemáticas de aspectos quantitativos e qualitativos. Competência Específica 6: Enfrentar situações-problema em múltiplos contextos, incluindo-se situações imaginadas, não diretamente relacionadas com o aspecto prático-utilitário.',
  'Ensino Médio': 'Competência Específica EM 1: Utilizar estratégias, conceitos e procedimentos matemáticos para interpretar situações em diversos contextos, sejam atividades cotidianas, sejam fatos das Ciências da Natureza e Humanas. Competência Específica EM 3: Utilizar estratégias, conceitos, definições e procedimentos matemáticos para interpretar, construir modelos e resolver problemas em diversos contextos.',
}

export function useBNCC() {
  const todasHabilidades = useMemo(() => {
    return Object.entries(BANCO_BNCC).map(([codigo, descricao]) => {
      const prefixo = Object.keys(PREFIXO_SERIE).find(p => codigo.startsWith(p)) || ''
      return { codigo, descricao, serie: PREFIXO_SERIE[prefixo] || '', prefixo }
    })
  }, [])

  const getSeriesPorDisciplina = useCallback((disciplina) => {
    const prefixos = DISCIPLINA_PREFIXOS[disciplina] || []
    return [...new Set(prefixos.map(p => PREFIXO_SERIE[p]).filter(Boolean))]
  }, [])

  const getHabilidades = useCallback((disciplina, serie) => {
    if (!disciplina) return []
    const prefixos = DISCIPLINA_PREFIXOS[disciplina] || []
    return todasHabilidades.filter(h => {
      const prefixoOk = prefixos.some(p => h.codigo.startsWith(p))
      const serieOk = !serie || h.serie === serie
      return prefixoOk && serieOk
    })
  }, [todasHabilidades])

  const getDescricaoPorCodigo = useCallback((codigo) => {
    return BANCO_BNCC[(codigo || '').trim().toUpperCase()] || null
  }, [])

  const buscar = useCallback((query, disciplina, serie) => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    const base = getHabilidades(disciplina, serie)
    const pool = base.length > 0 ? base : todasHabilidades
    return pool
      .filter(h => h.codigo.toLowerCase().includes(q) || h.descricao.toLowerCase().includes(q))
      .slice(0, 12)
  }, [todasHabilidades, getHabilidades])

  // Competências automáticas por série
  const getCompetenciasPorSerie = useCallback((serie) => {
    return COMPETENCIAS_POR_SERIE[serie] || ''
  }, [])

  return {
    todasHabilidades,
    getSeriesPorDisciplina,
    getHabilidades,
    getDescricaoPorCodigo,
    buscar,
    getCompetenciasPorSerie,
    disciplinasDisponiveis: Object.keys(DISCIPLINA_PREFIXOS),
  }
}
