import React from 'react'
import { cn } from '../../lib/utils'

interface PageHeaderProps {
  children: React.ReactNode
  className?: string
}

export function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <h1 className={cn('text-3xl font-bold text-foreground', className)}>
      {children}
    </h1>
  )
}

interface PageDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function PageDescription({ children, className }: PageDescriptionProps) {
  return (
    <p className={cn('text-muted-foreground mt-2', className)}>
      {children}
    </p>
  )
}