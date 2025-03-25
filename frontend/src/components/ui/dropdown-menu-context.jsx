import * as React from "react"
import { createContext, useContext } from "react"

const DropdownMenuContext = createContext(null)

export function DropdownMenuProvider({ children }) {
  return (
    <DropdownMenuContext.Provider value={null}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

export function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("useDropdownMenuContext must be used within a DropdownMenuProvider")
  }
  return context
} 