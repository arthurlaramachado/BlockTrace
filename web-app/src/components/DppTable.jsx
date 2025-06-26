"use client"

import { useState, useEffect } from "react"
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid"
import { Box, Chip, Tooltip, Paper } from "@mui/material"
import { Visibility, Edit, Delete } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSnackbar } from "../contexts/SnackbarContext"

const DppTable = () => {
  const [dpps, setDpps] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { ownerKey } = useAuth()
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    setLoading(true)
    fetchDpps()
  }, [])

  useEffect(() => {
    setLoading(false)
  }, [dpps])

  const fetchDpps = async () => {
    try {
      await fetch('http://localhost:3000/dpp/getAllDPPsByOwnerDID?owner_did=did:example:abcd1234')
        .then(async response => {
          if (!response.statusText == "OK") {
            throw new Error('Request failed');
          }

          const result = await response.json()

          setDpps(result.data)
        }).catch(error => {
          console.error('Error:', error);
        });

    } catch (error) {
      showSnackbar("Erro ao carregar DPPs", "error")
    }
  }

  const handleView = (dppId) => {
    navigate(`/dpp/${dppId}/view`)
  }

  const handleEdit = (dppId) => {
    navigate(`/dpp/${dppId}/edit`)
  }

  const handleDelete = async (id, dppId) => {
    if (window.confirm("Tem certeza que deseja excluir este DPP?")) {
      try {
        // Simulate API call
        await fetch(`/api/dpp/${dppId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${ownerKey}`,
          },
        })

        setDpps((prev) => prev.filter((dpp) => dpp.id !== id))
        showSnackbar("DPP excluído com sucesso", "success")
      } catch (error) {
        showSnackbar("Erro ao excluir DPP", "error")
      }
    }
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
      field: "manufacturer",
      headerName: "Fabricante",
      width: 200,
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
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Excluir">
              <Delete />
            </Tooltip>
          }
          label="Excluir"
          onClick={() => handleDelete(params.row.id, params.row.dpp_id)}
        />,
      ],
    },
  ]

  return (
    <Paper elevation={2} sx={{ borderRadius: 3 }}>
      <DataGrid
        rows={dpps}
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
