"use client"

import { useState } from "react"
import { Paper, TextField, Typography, Box, Alert } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { Key } from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { useSnackbar } from "../contexts/SnackbarContext"

const KeyLoginForm = () => {
  const [ownerKey, setOwnerKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showSnackbar } = useSnackbar()

  const from = location.state?.from?.pathname || "/dashboard"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ownerKey.trim()) {
      setError("Por favor, insira sua chave de proprietário")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate API validation - replace with actual validation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any non-empty key
      if (ownerKey.trim().length < 8) {
        throw new Error("Chave de proprietário deve ter pelo menos 8 caracteres")
      }

      login(ownerKey.trim())
      showSnackbar("Login realizado com sucesso!", "success")
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Key sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" color="primary" gutterBottom>
            Acesso do Proprietário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Digite sua chave de proprietário para acessar seus DPPs
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Chave de Proprietário"
            type="password"
            value={ownerKey}
            onChange={(e) => setOwnerKey(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder="Digite sua chave secreta"
            error={Boolean(error)}
            disabled={loading}
            autoFocus
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            loading={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            Entrar
          </LoadingButton>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Demo:</strong> Use qualquer chave com 8+ caracteres para testar
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default KeyLoginForm
