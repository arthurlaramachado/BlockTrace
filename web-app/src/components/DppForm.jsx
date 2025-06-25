"use client"

import { useState, useEffect } from "react"
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { Add, Delete, Save, Cancel } from "@mui/icons-material"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useSnackbar } from "../contexts/SnackbarContext"

const DppForm = ({ mode = "create" }) => {
  const [formData, setFormData] = useState({
    product_name: "",
    manufacturer: "",
    serial_number: "",
    status: "active",
    components: [],
    permissions: [],
  })
  const [loading, setLoading] = useState(false)
  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "",
    supplier: "",
    sustainability_score: 0,
  })
  const [newPermission, setNewPermission] = useState({
    role: "",
    scope: "read_only",
  })

  const navigate = useNavigate()
  const { dpp_id } = useParams()
  const { ownerKey } = useAuth()
  const { showSnackbar } = useSnackbar()

  const isEditMode = mode === "edit"

  useEffect(() => {
    if (isEditMode && dpp_id) {
      fetchDppData()
    }
  }, [isEditMode, dpp_id])

  const fetchDppData = async () => {
    try {
      // Mock data for edit mode
      const mockData = {
        product_name: "Smartphone EcoTech Pro",
        manufacturer: "EcoTech Industries",
        serial_number: "SN-2024-001",
        status: "active",
        components: [
          {
            name: "Battery",
            type: "Li-ion",
            supplier: "GreenBattery Corp",
            sustainability_score: 85,
          },
        ],
        permissions: [
          { role: "manufacturer", scope: "full_access" },
          { role: "retailer", scope: "read_only" },
        ],
      }
      setFormData(mockData)
    } catch (error) {
      showSnackbar("Erro ao carregar dados do DPP", "error")
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addComponent = () => {
    if (newComponent.name && newComponent.type) {
      setFormData((prev) => ({
        ...prev,
        components: [...prev.components, { ...newComponent }],
      }))
      setNewComponent({
        name: "",
        type: "",
        supplier: "",
        sustainability_score: 0,
      })
    }
  }

  const removeComponent = (index) => {
    setFormData((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }))
  }

  const addPermission = () => {
    if (newPermission.role) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, { ...newPermission }],
      }))
      setNewPermission({
        role: "",
        scope: "read_only",
      })
    }
  }

  const removePermission = (index) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditMode ? `/api/dpp/${dpp_id}` : "/api/dpp"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ownerKey}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar DPP")
      }

      showSnackbar(isEditMode ? "DPP atualizado com sucesso!" : "DPP criado com sucesso!", "success")
      navigate("/dashboard")
    } catch (error) {
      showSnackbar(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          {isEditMode ? "Editar DPP" : "Criar Novo DPP"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Informações Básicas
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Produto"
                value={formData.product_name}
                onChange={(e) => handleInputChange("product_name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fabricante"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Número de Série"
                value={formData.serial_number}
                onChange={(e) => handleInputChange("serial_number", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                  <MenuItem value="recalled">Recolhido</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Components */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Componentes
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Nome"
                value={newComponent.name}
                onChange={(e) => setNewComponent((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Tipo"
                value={newComponent.type}
                onChange={(e) => setNewComponent((prev) => ({ ...prev, type: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Fornecedor"
                value={newComponent.supplier}
                onChange={(e) => setNewComponent((prev) => ({ ...prev, supplier: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                size="small"
                label="Score"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={newComponent.sustainability_score}
                onChange={(e) =>
                  setNewComponent((prev) => ({ ...prev, sustainability_score: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton onClick={addComponent} color="primary">
                <Add />
              </IconButton>
            </Grid>
          </Grid>

          {formData.components.length > 0 && (
            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Fornecedor</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.components.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell>{component.name}</TableCell>
                      <TableCell>{component.type}</TableCell>
                      <TableCell>{component.supplier}</TableCell>
                      <TableCell>{component.sustainability_score}%</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeComponent(index)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Permissions */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Permissões
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Papel"
                value={newPermission.role}
                onChange={(e) => setNewPermission((prev) => ({ ...prev, role: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Escopo</InputLabel>
                <Select
                  value={newPermission.scope}
                  label="Escopo"
                  onChange={(e) => setNewPermission((prev) => ({ ...prev, scope: e.target.value }))}
                >
                  <MenuItem value="read_only">Somente Leitura</MenuItem>
                  <MenuItem value="basic_info">Informações Básicas</MenuItem>
                  <MenuItem value="full_access">Acesso Completo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <IconButton onClick={addPermission} color="primary">
                <Add />
              </IconButton>
            </Grid>
          </Grid>

          {formData.permissions.length > 0 && (
            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Papel</TableCell>
                    <TableCell>Escopo</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.permissions.map((permission, index) => (
                    <TableRow key={index}>
                      <TableCell>{permission.role}</TableCell>
                      <TableCell>{permission.scope}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removePermission(index)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
            <Button variant="outlined" startIcon={<Cancel />} onClick={() => navigate("/dashboard")}>
              Cancelar
            </Button>
            <LoadingButton type="submit" variant="contained" startIcon={<Save />} loading={loading}>
              {isEditMode ? "Atualizar" : "Criar"} DPP
            </LoadingButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default DppForm
