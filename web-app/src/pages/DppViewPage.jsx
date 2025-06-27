"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Button, Fade, Typography, Alert, CircularProgress } from "@mui/material"
import { Edit, ArrowBack } from "@mui/icons-material"
import { useAuth } from "../contexts/AuthContext"
import { useSnackbar } from "../contexts/SnackbarContext"
import PassportViewer from "../components/PassportViewer"
import TransferDPPButton from "../components/TransferDPPButton"
import { getPublicKeyFromPrivateKey, signedFetch } from "../scripts/signTransaction"

const DppViewPage = () => {
  const { dpp_id } = useParams()
  const navigate = useNavigate()
  const { ownerKey } = useAuth()
  const { showSnackbar } = useSnackbar()
  const [isOwner, setIsOwner] = useState(false)
  const [dpp, setDpp] = useState(undefined)
  const api_address = import.meta.env.VITE_API_ADDRESS

  useEffect(() => {
    if (dpp_id) {
      const fetchDppData = async () => {
        try {
          const url = `${api_address}/dpp/readDPP?dpp_id=${dpp_id}`
          const response = await fetch(url, { method: "GET" })

          if (!response.ok) {
            throw new Error("Failed to fetch DPP data")
          }

          const res = await response.json()
          const data = res.data

          setDpp(data)

        } catch (error) {
          showSnackbar("Error in loading DPP", "error")
        }
      }

      fetchDppData()
    }
  }, [dpp_id])

  useEffect(() => {
    const publicKey = getPublicKeyFromPrivateKey(ownerKey)
    if (dpp && dpp.owner_did == publicKey) setIsOwner(true)
  }, [dpp_id, ownerKey, dpp])

  const handleEdit = () => {
    navigate(`/dpp/${dpp_id}/edit`)
  }

  const handleTransfer = async (new_owner_did) => {
    if (window.confirm("Are you sure you want to transfer this DPP?")) {
      try {
        const message = `transfer:${dpp_id}:${new_owner_did}`;

        await signedFetch({
          url: `${api_address}/dpp/transferDPP`,
          method: "POST",
          message,
          secretKey: ownerKey,
          body: {
            dpp_id,
            new_owner_did
          }
        }).then(res => {
          if (res.ok) alert('Transferência enviada com sucesso!');
          else alert('Erro ao transferir DPP');
        });

        showSnackbar("DPP successfully transfered", "success")
        navigate("/dashboard")
      } catch (error) {
        showSnackbar("Error in transfering DPP", "error")
        console.log(error)
      }
    }
  }

  if (dpp == undefined) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Fade in timeout={600}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/dashboard")} sx={{ textTransform: "none" }}>
            Back to dashbord
          </Button>

          {isOwner && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
                Edit
              </Button>
              <TransferDPPButton onTransfer={(new_owner_did) => {
                handleTransfer(new_owner_did)
              }} />
            </Box>
          )}
        </Box>

        {isOwner && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">You are the owner of this product and can transfer or edit it.</Typography>
          </Alert>
        )}

        <PassportViewer dpp={dpp} />
      </Box>
    </Fade>
  )
}

export default DppViewPage
