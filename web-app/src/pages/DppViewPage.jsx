"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Button, Fade, Typography, Alert } from "@mui/material"
import { Edit, Delete, ArrowBack } from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"
import { useSnackbar } from "../contexts/SnackbarContext"
import PassportViewer from "../components/PassportViewer"

const DppViewPage = () => {
  const { dpp_id } = useParams()
  const navigate = useNavigate()
  const { ownerKey } = useAuth()
  const { showSnackbar } = useSnackbar()
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    // In a real app, you would verify ownership via API
    setIsOwner(true) // For demo purposes
  }, [dpp_id, ownerKey])

  const handleEdit = () => {
    navigate(`/dpp/${dpp_id}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este DPP? Esta ação não pode ser desfeita.")) {
      try {
        await fetch(`/api/dpp/${dpp_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${ownerKey}`,
          },
        })

        showSnackbar("DPP excluído com sucesso", "success")
        navigate("/dashboard")
      } catch (error) {
        showSnackbar("Erro ao excluir DPP", "error")
      }
    }
  }

  return (
    <Fade in timeout={600}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashboard")} sx={{ textTransform: "none" }}>
            Voltar ao Dashboard
          </Button>

          {isOwner && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
                Editar
              </Button>
              <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
                Excluir
              </Button>
            </Box>
          )}
        </Box>

        {isOwner && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">Você é o proprietário deste DPP e pode editá-lo ou excluí-lo.</Typography>
          </Alert>
        )}

        <PassportViewer dppId={dpp_id} />
      </Box>
    </Fade>
  )
}

export default DppViewPage
