"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [ownerKey, setOwnerKey] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedKey = localStorage.getItem("blocktrace_owner_key")
    if (savedKey) {
      setOwnerKey(savedKey)
    }
    setLoading(false)
  }, [])

  const login = (key) => {
    setOwnerKey(key)
    localStorage.setItem("blocktrace_owner_key", key)
  }

  const logout = () => {
    setOwnerKey(null)
    localStorage.removeItem("blocktrace_owner_key")
  }

  const isAuthenticated = Boolean(ownerKey)

  return (
    <AuthContext.Provider
      value={{
        ownerKey,
        login,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
