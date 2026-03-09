import type { ReactNode } from "react";

export const H = {
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-2xl">{children}</h1>
  )


}