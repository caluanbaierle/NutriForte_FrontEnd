interface SuccessAlertProps {
  message: string
  onClose?: () => void
}

export function SuccessAlert({ message, onClose }: SuccessAlertProps) {
  if (!message) return null
  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-green-200 bg-[var(--color-success-bg)] px-4 py-3 text-sm text-[var(--color-success)]"
    >
      <p>{message}</p>
      {onClose ? (
        <button type="button" onClick={onClose} className="shrink-0 font-semibold hover:opacity-80" aria-label="Fechar">
          ×
        </button>
      ) : null}
    </div>
  )
}
