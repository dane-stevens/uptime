import type { ReactNode } from "react";

export function Container({ children, as = 'default' }: { children: ReactNode; as?: 'default' | 'create' }) {
  const CONTAINER_WIDTHS = {
    'default': 'max-w-(--breakpoint-lg)',
    'create': 'max-w-(--breakpoint-sm)'
  }
  return (
    <div className={`${CONTAINER_WIDTHS[as]} mx-auto`}>
      {children}
    </div>
  )
}