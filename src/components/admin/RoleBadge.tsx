interface RoleBadgeProps {
  role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === "super_admin") {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
        超级管理员
      </span>
    )
  }

  if (role === "admin") {
    return (
      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
        管理员
      </span>
    )
  }

  return null
}
