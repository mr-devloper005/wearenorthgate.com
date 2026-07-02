import { cn } from '@/lib/utils'

type LoadingStateProps = {
  label?: string
  className?: string
}

function PulseBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[1.25rem] bg-current/10', className)} />
}

export function PageLoadingState({ label = 'Loading page', className }: LoadingStateProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[var(--editable-container)] px-4 py-12 sm:px-6 lg:px-8', className)} aria-live="polite" aria-busy="true">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-current/50">{label}</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-[1.8rem] border border-current/10 p-5">
          <PulseBlock className="h-10 w-4/5" />
          <PulseBlock className="mt-4 h-4 w-full" />
          <PulseBlock className="mt-3 h-4 w-2/3" />
        </div>
        <div className="rounded-[1.8rem] border border-current/10 p-5">
          <PulseBlock className="h-60 w-full rounded-[1.6rem]" />
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <PulseBlock key={item} className="h-28 w-full rounded-[1.2rem]" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardGridLoadingState({ count = 6, className }: LoadingStateProps & { count?: number }) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)} aria-live="polite" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-[1.7rem] border border-current/10 p-4">
          <PulseBlock className="h-44 w-full rounded-[1.3rem]" />
          <PulseBlock className="mt-4 h-5 w-5/6" />
          <PulseBlock className="mt-3 h-4 w-2/3" />
          <PulseBlock className="mt-6 h-10 w-32 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DetailLoadingState({ label = 'Loading detail', className }: LoadingStateProps) {
  return (
    <div className={cn('mx-auto grid w-full max-w-[var(--editable-container)] gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr]', className)} aria-live="polite" aria-busy="true">
      <div className="rounded-[1.8rem] border border-current/10 p-5">
        <PulseBlock className="h-72 w-full rounded-[1.4rem]" />
        <PulseBlock className="mt-4 h-10 w-3/4" />
        <PulseBlock className="mt-3 h-4 w-full" />
        <PulseBlock className="mt-3 h-4 w-4/5" />
      </div>
      <div className="rounded-[1.8rem] border border-current/10 p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-current/50">{label}</p>
        <PulseBlock className="mt-5 h-12 w-4/5" />
        <PulseBlock className="mt-5 h-4 w-full" />
        <PulseBlock className="mt-3 h-4 w-5/6" />
        <PulseBlock className="mt-3 h-4 w-2/3" />
      </div>
    </div>
  )
}
