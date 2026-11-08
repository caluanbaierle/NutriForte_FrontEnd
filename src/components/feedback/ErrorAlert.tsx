interface ErrorAlertProps {
  message: string
  onClose?: () => void
}

export function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-red-200 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
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
