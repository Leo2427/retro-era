"use client"

interface Props {
  label: string
}

export function TodoNavItem({ label }: Props) {
  return (
    <button
      onClick={() => alert("敬请期待")}
      className="group relative flex items-center gap-1.5 text-sm text-text-muted/40 transition-colors cursor-not-allowed"
    >
      <span className="line-through decoration-text-muted/30">{label}</span>
      <span className="rounded bg-border/50 px-1 py-0.5 text-[9px] font-medium text-text-muted/50">
        即将
      </span>
    </button>
  )
}
