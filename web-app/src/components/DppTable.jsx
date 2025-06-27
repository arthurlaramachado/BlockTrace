"use client"

import { useState, useEffect } from "react"
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid"
import { Box, Chip, Tooltip, Paper } from "@mui/material"
import { Visibility, Edit } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSnackbar } from "../contexts/SnackbarContext"
import { getPublicKeyFromPrivateKey } from "../scripts/signTransaction"

const DppTable = () => {
  const [dpps, setDpps] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { ownerKey } = useAuth()
  const { showSnackbar } = useSnackbar()

  const api_address = import.meta.env.VITE_API_ADDRESS

  useEffect(() => {
    setLoading(true)
    fetchDpps()
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [dpps])

  const fetchDpps = async () => {
    try {
      const publicKey = getPublicKeyFromPrivateKey(ownerKey)
      const encodedDid = encodeURIComponent(publicKey) // ensures signs like "+" dont get lost
      await fetch(`${api_address}/dpp/getAllDPPsByOwnerDID?owner_did=${encodedDid}`)
        .then(async response => {
          if (!response.statusText == "OK") {
            throw new Error('Request failed');
          }

          const result = await response.json()

          // Ensures that when no data comes from backend it doent break the app
          if (Object.keys(result.data).length != 0) {
            setDpps(result.data)
          } 

        }).catch(error => {
          console.error('Error:', error);
        });

    } catch (error) {
      showSnackbar("Failed to load dpps", "error")
    }
  }

  const handleView = (dppId) => {
    navigate(`/dpp/${dppId}/view`)
  }

  const handleEdit = (dppId) => {
    navigate(`/dpp/${dppId}/edit`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
        return "default"
      case "recalled":
        return "error"
      default:
        return "default"
    }
  }

  const columns = [
    {
      field: "dpp_id",
      headerName: "DPP ID",
      width: 200,
      renderCell: (params) => <Box sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>{params.value}</Box>,
    },
    {
      field: "product_name",
      headerName: "Produto",
      width: 250,
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value.toUpperCase()} color={getStatusColor(params.value)} size="small" />
      ),
    },
    {
      field: "updated_at",
      headerName: "Atualizado",
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString("pt-BR"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={
            <Tooltip title="Visualizar">
              <Visibility />
            </Tooltip>
          }
          label="Visualizar"
          onClick={() => handleView(params.row.dpp_id)}
        />,
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Editar">
              <Edit />
            </Tooltip>
          }
          label="Editar"
          onClick={() => handleEdit(params.row.dpp_id)}
        />,
      ],
    },
  ]

  return (
    <Paper elevation={2} sx={{ borderRadius: 3 }}>
      <DataGrid
        rows={dpps}
        getRowId={row => row.dpp_id}
        columns={columns}
        loading={loading}
        autoHeight
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            borderColor: "divider",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "background.default",
            borderColor: "divider",
          },
        }}
      />
    </Paper>
  )
}

export default DppTable
