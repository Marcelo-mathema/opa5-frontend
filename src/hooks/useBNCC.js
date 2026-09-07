// src/hooks/useBNCC.js
// Consulta o backend para habilidades e competências BNCC

import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../services/api";

// ── Cache em memória ──────────────────────────────────────────────────────────
let _cacheHab = null;
let _cacheComp = null;
let _loadingHab = false;
let _loadingComp = false;
let _listenersHab = [];
let _listenersComp = [];

function notificar(list) {
  list.forEach((fn) => fn());
  list.length = 0;
}

async function carregarHabilidades() {
  if (_cacheHab) return _cacheHab;
  if (_loadingHab)
    return new Promise((r) => {
      _listenersHab.push(() => r(_cacheHab));
    });
  _loadingHab = true;
  try {
    const { data } = await api.get("/api/bncc/habilidades");
    _cacheHab = (data || []).map((h) => ({
      codigo: h.codigo,
      descricao: h.texto,
      disciplina: h.disciplina,
      area: h.area,
      serie: h.serie,
      nivel: h.nivel,
    }));
  } catch (e) {
    console.error("[useBNCC] habilidades:", e);
    _cacheHab = [];
  } finally {
    _loadingHab = false;
    notificar(_listenersHab);
  }
  return _cacheHab;
}

async function carregarCompetencias() {
  if (_cacheComp) return _cacheComp;
  if (_loadingComp)
    return new Promise((r) => {
      _listenersComp.push(() => r(_cacheComp));
    });
  _loadingComp = true;
  try {
    const { data } = await api.get("/api/bncc/competencias");
    _cacheComp = data || {};
  } catch (e) {
    console.error("[useBNCC] competências:", e);
    _cacheComp = {};
  } finally {
    _loadingComp = false;
    notificar(_listenersComp);
  }
  return _cacheComp;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useBNCC() {
  const [todasHabilidades, setTodasHabilidades] = useState(_cacheHab || []);
  const [competencias, setCompetencias] = useState(_cacheComp || {});
  const [carregando, setCarregando] = useState(!_cacheHab || !_cacheComp);

  useEffect(() => {
    let mounted = true;
    Promise.all([carregarHabilidades(), carregarCompetencias()]).then(
      ([hab, comp]) => {
        if (!mounted) return;
        setTodasHabilidades(hab);
        setCompetencias(comp);
        setCarregando(false);
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  const disciplinasDisponiveis = useMemo(() => {
    return [...new Set(todasHabilidades.map((h) => h.disciplina))].sort();
  }, [todasHabilidades]);

  const getSeriesPorDisciplina = useCallback(
    (disciplina) => {
      const base = disciplina
        ? todasHabilidades.filter((h) => h.disciplina === disciplina)
        : todasHabilidades;
      return [...new Set(base.map((h) => h.serie))].sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, "") || "0");
        const nb = parseInt(b.replace(/\D/g, "") || "0");
        return na - nb;
      });
    },
    [todasHabilidades],
  );

  // ── Correspondência de séries ──────────────────────────────────────────────
  // A BNCC tem habilidades por ano ("6º Ano") e habilidades compartilhadas
  // por faixa ("6º ao 9º Ano"). Um plano do 6º ano deve enxergar as duas.
  // Também tolera valores antigos salvos no banco ("9º Ano EF", "1ª Série EM").

  const normalizarSerie = (s) => {
    if (!s) return "";
    return String(s)
      .replace(/\s*EF\s*$/i, "")
      .trim();
  };

  // Extrai o número do ano: "6º Ano" → 6
  const numeroDoAno = (s) => {
    const m = String(s).match(/^(\d+)º\s*Ano$/i);
    return m ? parseInt(m[1]) : null;
  };

  // Faixa "6º ao 9º Ano" → { de: 6, ate: 9 }
  const faixaDeAnos = (s) => {
    const m = String(s).match(/^(\d+)º\s*ao\s*(\d+)º\s*Ano$/i);
    return m ? { de: parseInt(m[1]), ate: parseInt(m[2]) } : null;
  };

  const ehEnsinoMedio = (s) =>
    /^\d+ª\s*Série\s*EM$/i.test(String(s)) ||
    /^Ensino\s*Médio$/i.test(String(s));

  // Decide se a habilidade (serieHab) se aplica à série escolhida (serieAlvo)
  const serieCorresponde = (serieHab, serieAlvo) => {
    if (!serieAlvo) return true;
    const alvo = normalizarSerie(serieAlvo);
    const hab = normalizarSerie(serieHab);

    if (hab === alvo) return true;

    // Ensino Médio: qualquer série do EM vê as habilidades do EM
    if (ehEnsinoMedio(alvo) && ehEnsinoMedio(hab)) return true;

    // Ano simples dentro de uma faixa: 3º Ano ⊂ 1º ao 5º Ano
    const n = numeroDoAno(alvo);
    const faixa = faixaDeAnos(hab);
    if (n !== null && faixa) return n >= faixa.de && n <= faixa.ate;

    return false;
  };

  const getHabilidades = useCallback(
    (disciplina, serie) => {
      if (!disciplina) return [];
      return todasHabilidades.filter(
        (h) => h.disciplina === disciplina && serieCorresponde(h.serie, serie),
      );
    },
    [todasHabilidades],
  );

  const getDescricaoPorCodigo = useCallback(
    (codigo) => {
      if (!codigo) return null;
      const cod = codigo.trim().toUpperCase();
      return todasHabilidades.find((h) => h.codigo === cod)?.descricao || null;
    },
    [todasHabilidades],
  );

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

  // ── COMPETÊNCIAS REAIS ────────────────────────────────────────────────────
  // Retorna texto formatado das competências específicas da disciplina.
  // Exemplo: "Competência 1: Reconhecer que a Matemática é uma ciência..."
  const getCompetenciasPorDisciplina = useCallback(
    (disciplina) => {
      if (!disciplina || !competencias[disciplina]) return "";
      return competencias[disciplina]
        .map((c) => `Competência Específica ${c.n}: ${c.t}`)
        .join("\n");
    },
    [competencias],
  );

  // Atalho retrocompatível — PlanoForm chama getCompetenciasPorSerie(serie)
  // mas agora precisamos da disciplina também. Se só receber serie,
  // tentamos inferir; se impossível, retorna texto genérico.
  const getCompetenciasPorSerie = useCallback(
    (serie, disciplina) => {
      if (disciplina && competencias[disciplina]) {
        return getCompetenciasPorDisciplina(disciplina);
      }
      if (!serie) return "";
      // Sem disciplina informada: retorna genérico
      return `Competências da BNCC para ${serie}.`;
    },
    [competencias, getCompetenciasPorDisciplina],
  );

  return {
    todasHabilidades,
    competencias, // objeto bruto: { "Matemática": [{n, t}, ...] }
    carregando,
    disciplinasDisponiveis,
    getSeriesPorDisciplina,
    getHabilidades,
    getDescricaoPorCodigo,
    buscar,
    getCompetenciasPorSerie,
    getCompetenciasPorDisciplina,
  };
}
