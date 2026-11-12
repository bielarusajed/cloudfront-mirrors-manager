"use client"

import type { CSSProperties } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="app-toaster toaster group"
      style={{
        "--normal-bg": "var(--mirror-paper)",
        "--normal-text": "var(--mirror-ink)",
        "--normal-border": "var(--mirror-line)",
        fontFamily: "var(--mirror-font)",
      } as CSSProperties}
      toastOptions={{
        closeButtonAriaLabel: "Закрыць паведамленне",
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
