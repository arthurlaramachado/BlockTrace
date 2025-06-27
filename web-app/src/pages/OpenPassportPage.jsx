"use client"

/* For time reasons, this page has been copied from passportViewer, instead of reusing it */
/* Fix using global state would be a good idea */

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
import { useParams } from "react-router-dom"
import AuditTimeline from "../components/AuditTimeline"

const OpenPassportPage = () => {
  const { dpp_id } = useParams()
  const [dpp, setDpp] = useState(undefined)
  const [error, setError] = useState(null)
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
          setError(error.message)
        }
      }

      fetchDppData()
    }
  }, [dpp_id])

  const getCreatedAt = (dpp) => {
    const createLog = dpp.audit_log.find(log => log.action === "CREATE")
    return new Date(createLog.timestamp).toLocaleString("pt-BR")
  }

  const getLastUpdatedAt = (dpp) => {
    const updatedAt = new Date(dpp.updated_at)
    if (!Array.isArray(dpp.audit_log) || dpp.audit_log.length === 0) {
      return updatedAt.toLocaleString("pt-BR")
    }

    const latestAuditTimestamp = dpp.audit_log
      .map(entry => new Date(entry.timestamp))
      .reduce((latest, current) => (current > latest ? current : latest), updatedAt)

    return latestAuditTimestamp.toLocaleString("pt-BR")
  }

  const getPermissionInfo = (permission) => {
    const perm = permission.split(":")
    return {
      role: perm[0],
      scope: perm[1],
      did: perm[2]
    }
  }

  if (error && !dpp) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="h6">Error loading DPP</Typography>
        <Typography>{error}</Typography>
      </Alert>
    )
  }

  if (!dpp) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ space: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h4" color="primary" gutterBottom>
              {dpp.product_name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {dpp.owner_did}
            </Typography>
          </Box>
          <Chip label={dpp.status?.toUpperCase()} color="success" size="large" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">DPP ID</Typography>
            <Typography variant="body1" fontFamily="monospace">{dpp.dpp_id}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Serial Number</Typography>
            <Typography variant="body1">{dpp.serial_number}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Created at</Typography>
            <Typography variant="body1">{getCreatedAt(dpp)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Updated at</Typography>
            <Typography variant="body1">{getLastUpdatedAt(dpp)}</Typography>
          </Box>
        </Box>
      </Paper>

      <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Inventory sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Componentes ({dpp.components?.length || 0})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name or DID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(dpp.components) && dpp.components.length > 0 ? (
                  dpp.components.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell>{component}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>No components registered.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2, borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Security sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Permissions</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>DID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(dpp.permissions) && dpp.permissions.length > 0 ? (
                  dpp.permissions.map((permission, index) => {
                    const { role, scope, did } = getPermissionInfo(permission)
                    return (
                      <TableRow key={index}>
                        <TableCell><Chip label={role} variant="outlined" /></TableCell>
                        <TableCell>{scope}</TableCell>
                        <TableCell>{did}</TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No permissions registered.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Timeline sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Audit Logs</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <AuditTimeline auditLog={dpp.audit_log} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default OpenPassportPage
