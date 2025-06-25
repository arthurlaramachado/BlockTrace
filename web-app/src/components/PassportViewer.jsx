"use client"

import { useState, useEffect } from "react"
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material"
import { ExpandMore, Inventory, Security, Timeline } from "@mui/icons-material"
import AuditTimeline from "./AuditTimeline"

const PassportViewer = ({ dppId }) => {
  const [dppData, setDppData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDppData()
  }, [dppId])

  const fetchDppData = async () => {
    try {
      setLoading(true)
      // Simulated API call - replace with actual API
      const response = await fetch(`/api/dpp/${dppId}`)
      if (!response.ok) {
        throw new Error("DPP não encontrado")
      }
      const data = await response.json()
      setDppData(data)
    } catch (err) {
      setError(err.message)
      // Mock data for demonstration
      setDppData({
        dpp_id: dppId,
        serial_number: "SN-2024-001",
        product_name: "Smartphone EcoTech Pro",
        manufacturer: "EcoTech Industries",
        status: "active",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
        components: [
          {
            name: "Battery",
            type: "Li-ion",
            supplier: "GreenBattery Corp",
            sustainability_score: 85,
          },
          {
            name: "Display",
            type: "OLED",
            supplier: "DisplayTech Ltd",
            sustainability_score: 78,
          },
        ],
        permissions: [
          { role: "manufacturer", scope: "full_access" },
          { role: "retailer", scope: "read_only" },
          { role: "consumer", scope: "basic_info" },
        ],
        audit_log: [
          {
            timestamp: "2024-01-20T14:45:00Z",
            action: "status_updated",
            actor: "system",
            details: "Status changed to active",
          },
          {
            timestamp: "2024-01-15T10:30:00Z",
            action: "dpp_created",
            actor: "manufacturer",
            details: "DPP created for product",
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error && !dppData) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="h6">Erro ao carregar DPP</Typography>
        <Typography>{error}</Typography>
      </Alert>
    )
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

  return (
    <Box sx={{ space: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h4" color="primary" gutterBottom>
              {dppData.product_name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {dppData.manufacturer}
            </Typography>
          </Box>
          <Chip label={dppData.status.toUpperCase()} color={getStatusColor(dppData.status)} size="large" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              DPP ID
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {dppData.dpp_id}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Serial Number
            </Typography>
            <Typography variant="body1">{dppData.serial_number}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Criado em
            </Typography>
            <Typography variant="body1">{new Date(dppData.created_at).toLocaleDateString("pt-BR")}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Atualizado em
            </Typography>
            <Typography variant="body1">{new Date(dppData.updated_at).toLocaleDateString("pt-BR")}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Components */}
      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Inventory sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Componentes ({dppData.components.length})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fornecedor</TableCell>
                  <TableCell align="right">Score Sustentabilidade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dppData.components.map((component, index) => (
                  <TableRow key={index}>
                    <TableCell>{component.name}</TableCell>
                    <TableCell>{component.type}</TableCell>
                    <TableCell>{component.supplier}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${component.sustainability_score}%`}
                        color={component.sustainability_score >= 80 ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Permissions */}
      <Accordion sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Security sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Permissões</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Papel</TableCell>
                  <TableCell>Escopo de Acesso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dppData.permissions.map((permission, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip label={permission.role} variant="outlined" />
                    </TableCell>
                    <TableCell>{permission.scope}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Audit Timeline */}
      <Accordion sx={{ borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Timeline sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Histórico de Auditoria</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <AuditTimeline auditLog={dppData.audit_log} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default PassportViewer
