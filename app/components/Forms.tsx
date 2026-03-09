import type { HTMLInputTypeAttribute, ReactNode } from "react";

export function Field({ type = 'text', name, label }: { type?: HTMLInputTypeAttribute, name: string; label: ReactNode }) {
  const id = `f_${name}`
  return (
    <div>
      <label className="text-sm" htmlFor={`#${id}`}>{label}</label>
      <input type={type} name={name} id={id} className="border border-base-600 indent-4 py-2 rounded-lg w-full" />
    </div>
  )
}

export function Submit({ children }: { children: ReactNode; }) {
  return (
    <button type='submit' className="bg-base-200 px-4 py-2 rounded-lg text-base-900">{children}</button>
  )
}