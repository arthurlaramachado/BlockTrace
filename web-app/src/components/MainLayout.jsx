"use client"
import { AppBar, Toolbar, Typography, Container, Button, Box, IconButton } from "@mui/material"
import { Dashboard, ExitToApp, Search } from "@mui/icons-material"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const MainLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            BlockTrace
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton color="inherit" onClick={() => navigate("/")} aria-label="Home">
              <Search />
            </IconButton>

            {isAuthenticated ? (
              <>
                <IconButton color="inherit" onClick={() => navigate("/dashboard")} aria-label="Dashboard">
                  <Dashboard />
                </IconButton>
                <IconButton color="inherit" onClick={handleLogout} aria-label="Logout">
                  <ExitToApp />
                </IconButton>
              </>
            ) : (
              <Button color="inherit" onClick={() => navigate("/login")} sx={{ textTransform: "none" }}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  )
}

export default MainLayout
