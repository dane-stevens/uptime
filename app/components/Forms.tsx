import type { HTMLInputTypeAttribute, ReactNode } from "react";

export function Field({ type = 'text', name, label, defaultValue, options }: { type?: HTMLInputTypeAttribute, name: string; label: ReactNode, defaultValue?: string; options?: string[][] }) {
  const id = `f_${name}`
  return (
    <div>
      <label className="text-sm" htmlFor={`#${id}`}>{label}</label>
      {type === 'select' && (
        <select name={name} id={id} defaultValue={defaultValue} className="border border-base-600 px-4 py-2 rounded-lg w-full">
          {options?.map((option, i) => {
            return <option value={option[0]}>{[option[1]]}</option>
          })}
        </select>
      )}
      {
        !['select'].includes(type) && (
          <input type={type} name={name} id={id} defaultValue={defaultValue} className="border border-base-600 indent-4 py-2 rounded-lg w-full" />
        )
      }
    </div>
  )
}

export function Submit({ children }: { children: ReactNode; }) {
  return (
    <button type='submit' className="bg-base-200 px-4 py-2 rounded-lg text-base-900">{children}</button>
  )
}