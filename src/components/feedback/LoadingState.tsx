export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-charcoal-muted" role="status">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-sage-muted border-t-forest" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
