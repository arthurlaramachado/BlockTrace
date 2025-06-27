"use client"
import { Typography, Button, Box, Fade } from "@mui/material"
import { Add } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import DppTable from "../components/DppTable"

const DashboardPage = () => {
  const navigate = useNavigate()

  return (
    <Fade in timeout={600}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" color="primary">
            My DPPs
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/dpp/new")} size="large">
            New DPP
          </Button>
        </Box>

        <DppTable />
      </Box>
    </Fade>
  )
}

export default DashboardPage
