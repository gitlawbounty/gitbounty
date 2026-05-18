import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: 'border-accent text-accent hover:bg-accent hover:text-base',
  ghost: 'border-border text-primary hover:border-accent hover:text-accent',
  danger: 'border-status-disputed text-status-disputed hover:bg-status-disputed hover:text-base',
}

export function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`border px-3 py-1.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      [ {children} ]
    </button>
  )
}
