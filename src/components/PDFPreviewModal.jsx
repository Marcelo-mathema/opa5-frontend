// src/components/PDFPreviewModal.jsx
// Modal de pré-visualização do PDF antes do download.
//
// Uso:
//   <PDFPreviewModal
//     open={showPreview}
//     url={pdfUrl}
//     filename={pdfName}
//     onClose={fecharPreview}
//   />
//
// Quem abre o modal é responsável por gerar a url (planosAPI.gerarPDFBlob)
// e por chamar onClose — que revoga a URL e libera a memória.

import { useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'

// Detecta telas pequenas — iframe com PDF não é confiável em mobile
const isMobile = () =>
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /iPhone|iPad|Android/i.test(navigator.userAgent))

export default function PDFPreviewModal({ open, url, filename, onClose }) {

  // Fecha com a tecla Esc
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    // Trava o scroll do fundo enquanto o modal está aberto
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !url) return null

  const baixar = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'plano.pdf'
    a.click()
  }

  const abrirEmNovaAba = () => window.open(url, '_blank')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ─── Cabeçalho ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="min-w-0">
            <h3 className="font-display text-lg truncate" style={{ color: 'var(--navy)' }}>
              Pré-visualização do PDF
            </h3>
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {filename || 'plano.pdf'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg flex-shrink-0 transition-colors hover:bg-gray-100"
            style={{ color: 'var(--muted)' }}
            aria-label="Fechar pré-visualização"
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── Corpo ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden" style={{ background: 'var(--slate)' }}>
          {isMobile() ? (
            // Mobile: iframe de PDF não renderiza de forma confiável
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                A pré-visualização no celular funciona melhor em uma nova aba.
              </p>
              <button
                type="button"
                onClick={abrirEmNovaAba}
                className="btn-outline gap-2"
              >
                <ExternalLink size={15} />
                Abrir PDF em nova aba
              </button>
            </div>
          ) : (
            <iframe
              src={url}
              title="Pré-visualização do plano de aula"
              className="w-full border-0"
              style={{ height: '70vh' }}
            />
          )}
        </div>

        {/* ─── Rodapé ────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <button type="button" onClick={onClose} className="btn-ghost">
            Fechar
          </button>
          <button type="button" onClick={baixar} className="btn-primary gap-2">
            <Download size={15} />
            Baixar PDF
          </button>
        </div>

      </div>
    </div>
  )
}
