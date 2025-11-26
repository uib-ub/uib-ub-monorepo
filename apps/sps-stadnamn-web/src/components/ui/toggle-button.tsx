'use client'
import { type ReactNode } from 'react'

interface ToggleButtonProps {
  children: ReactNode
  isSelected?: boolean
  onClick?: () => void
  className?: string
  ariaPressed?: boolean
  ariaChecked?: boolean
  ariaLabel?: string
  ariaLabelledBy?: string
  role?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function ToggleButton({
  children,
  isSelected = false,
  onClick,
  className = '',
  ariaPressed,
  ariaChecked,
  ariaLabel,
  ariaLabelledBy,
  role,
  type = 'button'
}: ToggleButtonProps) {
  // For radio buttons, use aria-checked; for toggle buttons, use aria-pressed
  const ariaProps: Record<string, any> = {}
  if (role === 'radio') {
    ariaProps['aria-checked'] = ariaChecked !== undefined ? ariaChecked : isSelected
  } else {
    ariaProps['aria-pressed'] = ariaPressed !== undefined ? ariaPressed : isSelected
  }
  if (ariaLabel) ariaProps['aria-label'] = ariaLabel
  if (ariaLabelledBy) ariaProps['aria-labelledby'] = ariaLabelledBy
  if (role) ariaProps['role'] = role

  return (
    <button
      type={type}
      onClick={onClick}
      {...ariaProps}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${
        isSelected
          ? 'bg-accent-800 text-white'
          : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
      } ${className}`}
    >
      {children}
    </button>
  )
}

