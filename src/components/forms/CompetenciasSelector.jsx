// src/components/forms/CompetenciasSelector.jsx
// Seleção manual das competências específicas que a aula trabalha.
//
// A BNCC não publica um mapeamento oficial de habilidade → competência.
// Essa associação é uma decisão pedagógica do professor, por isso a
// escolha é manual: mostramos as competências da disciplina e ele marca
// as que a aula de fato mobiliza.

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Check, Info } from 'lucide-react'

export default function CompetenciasSelector({
  disciplina,        // string — disciplina atual do plano
  competencias,      // objeto vindo do useBNCC: { "Matemática": [{n, t}, ...] }
  value,             // string — texto já salvo (ao editar um plano)
  onChange,          // (texto: string) => void
}) {
  const [selecionadas, setSelecionadas] = useState([])
  const [aberto, setAberto] = useState(false)
  const [inicializado, setInicializado] = useState(false)

  const lista = useMemo(
    () => (disciplina && competencias?.[disciplina]) || [],
    [disciplina, competencias]
  )

  // Ao editar um plano, remarca as competências que já estavam salvas.
  // Compara pelo número ("Competência Específica 3:") para não depender
  // de o texto estar idêntico.
  useEffect(() => {
    if (inicializado || !value || lista.length === 0) return
    const numeros = [...value.matchAll(/Compet[êe]ncia\s+Espec[íi]fica\s+(\d+)/gi)]
      .map(m => parseInt(m[1]))
    if (numeros.length) setSelecionadas(numeros)
    setInicializado(true)
  }, [value, lista, inicializado])

  // Quando a disciplina muda, limpa a seleção anterior
  useEffect(() => {
    if (!inicializado) return
    setSelecionadas([])
  }, [disciplina])

  // Propaga o texto formatado para o formulário
  useEffect(() => {
    if (lista.length === 0) return
    const texto = lista
      .filter(c => selecionadas.includes(c.n))
      .map(c => `Competência Específica ${c.n}: ${c.t}`)
      .join('\n')
    onChange?.(texto)
  }, [selecionadas, lista])

  const alternar = (n) => {
    setSelecionadas(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n].sort((a, b) => a - b)
    )
  }

  const marcarTodas = () => setSelecionadas(lista.map(c => c.n))
  const limpar = () => setSelecionadas([])

  if (!disciplina) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg text-xs"
        style={{ background: 'var(--slate)', color: 'var(--muted)' }}>
        <Info size={14} className="flex-shrink-0" />
        Selecione a disciplina para ver as competências.
      </div>
    )
  }

  if (lista.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg text-xs"
        style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e' }}>
        <Info size={14} className="flex-shrink-0" />
        Competências de <strong>{disciplina}</strong> não cadastradas.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Cabeçalho com contador e ações */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--blue)' }}
        >
          <ChevronDown size={15}
            className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
          {aberto ? 'Ocultar' : 'Escolher'} competências de {disciplina}
          <span className="badge badge-teal ml-1">
            {selecionadas.length} de {lista.length}
          </span>
        </button>

        {aberto && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={marcarTodas}
              className="text-xs hover:underline" style={{ color: 'var(--blue)' }}>
              Marcar todas
            </button>
            <button type="button" onClick={limpar}
              className="text-xs hover:underline" style={{ color: 'var(--muted)' }}>
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* Lista de checkboxes */}
      {aberto && (
        <div className="border rounded-xl overflow-hidden max-h-72 overflow-y-auto scrollbar-thin fade-in"
          style={{ borderColor: 'var(--border)' }}>
          {lista.map(c => {
            const marcada = selecionadas.includes(c.n)
            return (
              <button
                key={c.n}
                type="button"
                onClick={() => alternar(c.n)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-0"
                style={{
                  borderColor: 'var(--border)',
                  background: marcada ? 'var(--sage)' : undefined,
                }}
              >
                <div
                  className="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border transition-colors"
                  style={{
                    borderColor: marcada ? 'var(--teal)' : 'var(--border)',
                    background: marcada ? 'var(--teal)' : 'transparent',
                  }}
                >
                  {marcada && <Check size={11} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="badge badge-blue text-xs mr-2">CE {c.n}</span>
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>
                    {c.t}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Prévia do que vai para o PDF */}
      {selecionadas.length > 0 && !aberto && (
        <div className="p-3 rounded-lg text-xs leading-relaxed max-h-32 overflow-y-auto scrollbar-thin"
          style={{ background: 'var(--slate)', color: 'var(--ink)' }}>
          {lista
            .filter(c => selecionadas.includes(c.n))
            .map(c => (
              <p key={c.n} className="mb-1.5 last:mb-0">
                <strong>Competência Específica {c.n}:</strong> {c.t}
              </p>
            ))}
        </div>
      )}

      {selecionadas.length === 0 && !aberto && (
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Nenhuma competência selecionada — o campo ficará vazio no PDF.
        </p>
      )}
    </div>
  )
}