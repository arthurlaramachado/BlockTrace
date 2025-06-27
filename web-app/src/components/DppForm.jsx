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
import { getPublicKeyFromPrivateKey, signedFetch } from "../scripts/signTransaction"

export function getDPPStatusMenuItems() {
  return [
    { value: "created", label: "Created" },
    { value: "in_production", label: "In Production" },
    { value: "manufactured", label: "Manufactured" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
    { value: "in_use", label: "In Use" },
    { value: "under_maintenance", label: "Under Maintenance" },
    { value: "repaired", label: "Repaired" },
    { value: "returned", label: "Returned" },
    { value: "recalled", label: "Recalled" },
    { value: "end_of_life", label: "End of Life" },
    { value: "in_recycling", label: "In Recycling" },
    { value: "recycled", label: "Recycled" },
    { value: "disposed", label: "Disposed" },
    { value: "archived", label: "Archived" }
  ].map((status) => (
    <MenuItem key={status.value} value={status.value}>
      {status.label}
    </MenuItem>
  ));
}

export function getScopeMenuItems() {
  return [
    { value: "material_data", label: "Material Data" },
    { value: "manufacturing_data", label: "Manufacturing Data" },
    { value: "environmental_data", label: "Environmental Data" },
    { value: "logistics_data", label: "Logistics Data" },
    { value: "circularity_data", label: "Circularity Data" },
    { value: "maintenance_data", label: "Maintenance Data" },
    { value: "user_manual", label: "User Manual" },
    { value: "status", label: "Status" },
    { value: "audit_log", label: "Audit Log" },
    { value: "all", label: "All" },
  ].map((scope) => (
    <MenuItem key={scope.value} value={scope.value}>
      {scope.label}
    </MenuItem>
  ));
}

export function getRoleMenuItems() {
  return [
    { value: "read", label: "Read" },
    { value: "write", label: "Write" },
    { value: "view", label: "View" },
    { value: "all", label: "All" },
  ].map((role) => (
    <MenuItem key={role.value} value={role.value}>
      {role.label}
    </MenuItem>
  ));
}

const DppForm = ({ mode = "create" }) => {
  const [formData, setFormData] = useState({
    product_name: "",
    serial_number: "",
    status: "created",
    components: [],
    permissions: [],
  })
  const [loading, setLoading] = useState(false)
  const [newComponent, setNewComponent] = useState("")
  const [newPermission, setNewPermission] = useState({
    role: "",
    scope: "",
    user_did: ""
  })
  const [oldDPP, setOldDPP] = useState()

  const navigate = useNavigate()
  const { dpp_id } = useParams()
  const { ownerKey } = useAuth()
  const { showSnackbar } = useSnackbar()

  const isEditMode = mode === "edit"
  const api_address = import.meta.env.VITE_API_ADDRESS

  useEffect(() => {
    if (isEditMode && dpp_id) {
      const fetchDppData = async () => {
        try {
          const url = `${api_address}/dpp/readDPP?dpp_id=${dpp_id}`
          const response = await fetch(url, { method: "GET" })

          if (!response.ok) {
            throw new Error("Failed to fetch DPP data")
          }

          const res = await response.json()
          const data = res.data

          setFormData({
            product_name: data.product_name,
            serial_number: data.serial_number,
            status: data.status,
            components: data.components,
            permissions: data.permissions
          })

          setOldDPP(data)

        } catch (error) {
          showSnackbar("Error in loading DPP", "error")
        }
      }

      fetchDppData()
    }
  }, [isEditMode, dpp_id])

  const getPermissionLine = (permission) => {
    const splitted = permission.split(":")

    return (
      <>
        <TableCell>{splitted[0]}</TableCell>
        <TableCell>{splitted[1]}</TableCell>
        <TableCell>{splitted[2]}</TableCell>
      </>
    )
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addComponent = () => {
    if (newComponent.length > 0) {
      setFormData(
        {
          ...formData,
          components: [...formData.components, newComponent],
        }
      )
    }

    setNewComponent("")
  }

  const removeComponent = (component) => {
    const newComponents = formData.components.filter(value => value != component)
    setFormData({ ...formData, components: newComponents })
  }

  const addPermission = () => {
    const { role, scope, user_did } = newPermission

    if (role.length > 0 && scope.length > 0 && user_did.length > 0) {
      const newPermissionJoined = `${role}:${scope}:${user_did}`

      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, newPermissionJoined],
      }))

      setNewPermission({
        role: "",
        scope: "",
        user_did: ""
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
      const publicKey = getPublicKeyFromPrivateKey(ownerKey)

      const dpp = {
        ...formData,
        owner_did: publicKey,
      }

      const editBody = {
        ...formData,
        owner_did: isEditMode ? oldDPP.owner_did : "",
        dpp_id: isEditMode ? oldDPP.dpp_id : ""
      }
      
      const route = isEditMode ? "editDPP" : "createDPP"

      const response = await signedFetch({
        url: `${api_address}/dpp/${route}`,
        message: `create:dpp:${publicKey}`,
        secretKey: ownerKey,
        method: "POST",
        body: isEditMode ? editBody : dpp,
      })

      if (!response.ok) {
        throw new Error("Error to save DPP")
      }

      showSnackbar(isEditMode ? "DPP successfully updated!" : "DPP successfully created!", "success")
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
          {isEditMode ? "Edit DPP" : "Create new DPP"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Basic Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product name"
                value={formData.product_name}
                onChange={(e) => handleInputChange("product_name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
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
                  {getDPPStatusMenuItems()}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Components
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={10}>
              <TextField
                fullWidth
                label="Component name or DPP Id"
                value={newComponent}
                onChange={(e) => setNewComponent(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <IconButton onClick={addComponent} color="primary">
                  <Add />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {formData.components.length > 0 && (
            <TableContainer sx={{ mb: 3 }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Component name or DPP ID</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.components.map((component) => (
                    <TableRow>
                      <TableCell>{component}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeComponent(component)} color="error">
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

          <Typography variant="h6" sx={{ mb: 2 }}>
            Permissions
          </Typography>

          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={newPermission.role}
                  label="Role"
                  onChange={(e) => setNewPermission((prev) => ({ ...prev, role: e.target.value }))}
                >
                  {getRoleMenuItems()}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Scope</InputLabel>
                <Select
                  value={newPermission.scope}
                  label="Scope"
                  onChange={(e) => setNewPermission((prev) => ({ ...prev, scope: e.target.value }))}
                >
                  {getScopeMenuItems()}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="User DID"
                value={newPermission.user_did}
                onChange={(e) => setNewPermission((prev) => ({ ...prev, user_did: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <IconButton onClick={addPermission} color="primary">
                  <Add />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {formData.permissions.length > 0 && (
            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell>Scope</TableCell>
                    <TableCell>User DID</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.permissions.map((permission, index) => (
                    <TableRow key={index}>
                      {getPermissionLine(permission)}
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

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}>
            <Button variant="outlined" startIcon={<Cancel />} onClick={() => navigate("/dashboard")}>
              Cancelar
            </Button>
            <LoadingButton type="submit" variant="contained" startIcon={<Save />} loading={loading}>
              {isEditMode ? "Update" : "Create"} DPP
            </LoadingButton>
          </Box>
        </Box>
      </Paper >
    </Box >
  )
}

export default DppForm
