// src/hooks/useBNCC.js
import { useMemo, useCallback } from "react";
import BANCO_BNCC from "../data/bncc_matematica";

const PREFIXO_SERIE = {
  EF06MA: "6º Ano EF",
  EF07MA: "7º Ano EF",
  EF08MA: "8º Ano EF",
  EF09MA: "9º Ano EF",
  EM13MAT: "Ensino Médio",
};

const DISCIPLINA_PREFIXOS = {
  Matemática: ["EF06MA", "EF07MA", "EF08MA", "EF09MA", "EM13MAT"],
};

const COMPETENCIAS_EM = `Competência Específica 1: Utilizar estratégias, conceitos e procedimentos matemáticos para interpretar situações em diversos contextos, sejam atividades cotidianas, sejam fatos das Ciências da Natureza e Humanas, das questões socioeconômicas ou tecnológicas, divulgados por diferentes meios, de modo a contribuir para uma formação geral.
Competência Específica 2: Propor ou participar de ações para investigar desafios do mundo contemporâneo e tomar decisões éticas e socialmente responsáveis, com base na análise de problemas de urgência social, com vistas à construção de uma sociedade justa, democrática e inclusiva.
Competência Específica 3: Utilizar estratégias, conceitos, definições e procedimentos matemáticos para interpretar, construir modelos e resolver problemas em diversos contextos, analisando a plausibilidade dos resultados e a adequação das soluções propostas, de modo a construir argumentação consistente.
Competência Específica 4: Compreender e utilizar, com flexibilidade e precisão, diferentes registros de representação matemáticos (algébrico, geométrico, estatístico, computacional etc.), na busca de solução e comunicação de resultados de problemas.
Competência Específica 5: Investigar e estabelecer conjecturas a respeito de diferentes conceitos e propriedades matemáticas, empregando estratégias e recursos, como observação de padrões, experimentações e diferentes tecnologias, identificando a necessidade, ou não, de uma demonstração cada vez mais formal na validação das referidas conjecturas.`;

const COMPETENCIAS_POR_SERIE = {
  "6º Ano EF":
    "Competência Específica 1: Reconhecer que a Matemática é uma ciência humana, fruto da necessidade e curiosidade humanas. Competência Específica 3: Compreender as relações entre conceitos e procedimentos dos diferentes campos da Matemática.",
  "7º Ano EF":
    "Competência Específica 2: Desenvolver o raciocínio lógico, o espírito de investigação e a capacidade de produzir argumentos convincentes. Competência Específica 4: Fazer observações sistemáticas de aspectos quantitativos e qualitativos presentes nas práticas sociais.",
  "8º Ano EF":
    "Competência Específica 3: Compreender as relações entre conceitos e procedimentos dos diferentes campos da Matemática. Competência Específica 5: Utilizar processos e ferramentas matemáticas, inclusive tecnologias digitais disponíveis, para modelar e resolver problemas cotidianos.",
  "9º Ano EF":
    "Competência Específica 4: Fazer observações sistemáticas de aspectos quantitativos e qualitativos. Competência Específica 6: Enfrentar situações-problema em múltiplos contextos.",
  "1ª Série EM": COMPETENCIAS_EM,
  "2ª Série EM": COMPETENCIAS_EM,
  "3ª Série EM": COMPETENCIAS_EM,
};

export function useBNCC() {
  const todasHabilidades = useMemo(() => {
    return Object.entries(BANCO_BNCC).map(([codigo, descricao]) => {
      const prefixo =
        Object.keys(PREFIXO_SERIE).find((p) => codigo.startsWith(p)) || "";
      return {
        codigo,
        descricao,
        serie: PREFIXO_SERIE[prefixo] || "",
        prefixo,
      };
    });
  }, []);

  const getSeriesPorDisciplina = useCallback((disciplina) => {
    const prefixos = DISCIPLINA_PREFIXOS[disciplina] || [];
    return [...new Set(prefixos.map((p) => PREFIXO_SERIE[p]).filter(Boolean))];
  }, []);

  const getHabilidades = useCallback(
    (disciplina, serie) => {
      if (!disciplina) return [];
      const prefixos = DISCIPLINA_PREFIXOS[disciplina] || [];
      return todasHabilidades.filter((h) => {
        const prefixoOk = prefixos.some((p) => h.codigo.startsWith(p));
        const serieOk = !serie || h.serie === serie;
        return prefixoOk && serieOk;
      });
    },
    [todasHabilidades],
  );

  const getDescricaoPorCodigo = useCallback((codigo) => {
    return BANCO_BNCC[(codigo || "").trim().toUpperCase()] || null;
  }, []);

  const buscar = useCallback(
    (query, disciplina, serie) => {
      if (!query || query.length < 2) return [];
      const q = query.toLowerCase();
      const base = getHabilidades(disciplina, serie);
      const pool = base.length > 0 ? base : todasHabilidades;
      return pool
        .filter(
          (h) =>
            h.codigo.toLowerCase().includes(q) ||
            h.descricao.toLowerCase().includes(q),
        )
        .slice(0, 12);
    },
    [todasHabilidades, getHabilidades],
  );

  const getCompetenciasPorSerie = useCallback((serie) => {
    return COMPETENCIAS_POR_SERIE[serie] || "";
  }, []);

  return {
    todasHabilidades,
    getSeriesPorDisciplina,
    getHabilidades,
    getDescricaoPorCodigo,
    buscar,
    getCompetenciasPorSerie,
    disciplinasDisponiveis: Object.keys(DISCIPLINA_PREFIXOS),
  };
}
