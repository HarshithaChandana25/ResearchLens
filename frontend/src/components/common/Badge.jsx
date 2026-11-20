import React from 'react'

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const getClasses = () => {
    const base = 'inline-flex items-center gap-1 font-semibold rounded-md'
    const sizes = {
      sm: 'px-2 py-0.5 text-[9px]',
      md: 'px-2.5 py-1 text-[10px]',
      lg: 'px-3 py-1.5 text-[11px]',
    }
    const variants = {
      default: 'bg-[#211d35] text-[#bca7e9] border border-[#3e325c]',
      primary: 'bg-[#3b2a68] text-[#cbb6ff] border border-[#5d4699]',
      success: 'bg-[#153424] text-[#86efac] border border-[#225e3d]',
      warning: 'bg-[#382a15] text-[#fde047] border border-[#715422]',
      danger: 'bg-[#3a191d] text-[#fca5a5] border border-[#782833]',
      neutral: 'bg-[#181926] text-[#9ca3af] border border-[#2d2e42]',
      sample: 'bg-[#29213a] text-[#b49bdf] border border-[#493b64] tracking-wider uppercase text-[8px]',
      verified: 'bg-[#132d2a] text-[#5eead4] border border-[#1f5952]',
    }
    return `${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`
  }

  return (
    <span className={`status-badge badge-${variant} ${className}`}>
      {children}
    </span>
  )
}
