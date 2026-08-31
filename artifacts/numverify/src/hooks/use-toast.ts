import type React from "react"

export type ToastItem = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  variant?: "default" | "destructive"
}

export function toast({ ...props }: Omit<ToastItem, "id">) {
  // Placeholder for real toast
  console.log("Toast:", props)
}

export function useToast() {
  return {
    toast,
    dismiss: () => {},
    toasts: [] as ToastItem[]
  }
}
