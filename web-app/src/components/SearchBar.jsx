"use client"

import { useState, useEffect } from "react"
import { Paper, TextField, Button, Box, Typography, Chip, Stack } from "@mui/material"
import { Search, History } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

const SearchBar = () => {
  const [dppId, setDppId] = useState("")
  const [recentQueries, setRecentQueries] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem("blocktrace_recent_queries")
    if (saved) {
      setRecentQueries(JSON.parse(saved))
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (dppId.trim()) {
      searchDpp(dppId.trim())
    }
  }

  const searchDpp = (id) => {
    // Add to recent queries
    const updated = [id, ...recentQueries.filter((q) => q !== id)].slice(0, 5)
    setRecentQueries(updated)
    localStorage.setItem("blocktrace_recent_queries", JSON.stringify(updated))

    // Navigate to passport view
    navigate(`/passport/${id}`)
  }

  const clearRecentQueries = () => {
    setRecentQueries([])
    localStorage.removeItem("blocktrace_recent_queries")
  }

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Buscar Digital Product Passport
      </Typography>

      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Digite o ID do DPP para visualizar suas informações públicas
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          <TextField
            fullWidth
            label="DPP ID"
            placeholder="Ex: uuid-1234-5678-9abc"
            value={dppId}
            onChange={(e) => setDppId(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
          <Button type="submit" variant="contained" size="large" sx={{ px: 4, py: 1.5 }} disabled={!dppId.trim()}>
            Buscar
          </Button>
        </Box>
      </Box>

      {recentQueries.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <History sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="subtitle2" color="text.secondary">
              Buscas Recentes
            </Typography>
            <Button size="small" onClick={clearRecentQueries} sx={{ ml: "auto", textTransform: "none" }}>
              Limpar
            </Button>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {recentQueries.map((query, index) => (
              <Chip key={index} label={query} onClick={() => searchDpp(query)} variant="outlined" sx={{ mb: 1 }} />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  )
}

export default SearchBar
