"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  footer?: React.ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  headerAction?: React.ReactNode
}

export function CardContainer({
  title,
  description,
  footer,
  isLoading,
  isEmpty,
  emptyMessage = "No data available",
  headerAction,
  className,
  children,
  ...props
}: CardContainerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-3">
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {headerAction && <div>{headerAction}</div>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="p-6 pt-3">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        ) : isEmpty ? (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
      {footer && <div className="p-6 pt-0">{footer}</div>}
    </div>
  )
}
