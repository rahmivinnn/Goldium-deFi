"use client"

import React from "react"
import { cn } from "@/lib/utils"

type StatusVariant = 
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "neutral"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StatusVariant
  pulse?: boolean
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({
  variant = "default",
  pulse = false,
  size = "md",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    pending: "bg-purple-100 text-purple-800",
    neutral: "bg-slate-100 text-slate-800",
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }

  const dotClasses = {
    default: "bg-gray-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    pending: "bg-purple-500",
    neutral: "bg-slate-500",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          dotClasses[variant],
          pulse && "animate-pulse"
        )}
      />
      {children}
    </div>
  )
}
