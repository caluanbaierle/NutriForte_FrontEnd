import { Button } from '@/components/forms/Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-white p-6 shadow-soft">
        <h3 className="font-display text-xl text-forest">{title}</h3>
        <p className="mt-2 text-sm text-charcoal-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Aguarde...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
