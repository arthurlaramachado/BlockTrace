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
    fetchDpps()
  }, [])

  const fetchDpps = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with actual API
      const response = await fetch(`/api/dpp?ownerKey=${ownerKey}`)

      // Mock data for demonstration
      const mockData = [
        {
          id: 1,
          dpp_id: "dpp-001-smartphone",
          product_name: "Smartphone EcoTech Pro",
          manufacturer: "EcoTech Industries",
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-20T14:45:00Z",
        },
        {
          id: 2,
          dpp_id: "dpp-002-laptop",
          product_name: "Laptop GreenCompute X1",
          manufacturer: "GreenCompute Corp",
          status: "active",
          created_at: "2024-01-10T09:15:00Z",
          updated_at: "2024-01-18T16:20:00Z",
        },
        {
          id: 3,
          dpp_id: "dpp-003-tablet",
          product_name: "Tablet EcoTab Mini",
          manufacturer: "EcoTech Industries",
          status: "inactive",
          created_at: "2024-01-05T14:22:00Z",
          updated_at: "2024-01-12T11:30:00Z",
        },
      ]

      setDpps(mockData)
    } catch (error) {
      showSnackbar("Erro ao carregar DPPs", "error")
    } finally {
      setLoading(false)
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
