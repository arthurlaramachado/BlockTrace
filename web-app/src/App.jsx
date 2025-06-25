import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import theme from "./theme"
import { AuthProvider } from "./contexts/AuthContext"
import { SnackbarProvider } from "./contexts/SnackbarContext"
import MainLayout from "./components/MainLayout"
import ProtectedRoute from "./components/ProtectedRoute"

// Pages
import SearchPage from "./pages/SearchPage"
import PassportPage from "./pages/PassportPage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import DppCreatePage from "./pages/DppCreatePage"
import DppEditPage from "./pages/DppEditPage"
import DppViewPage from "./pages/DppViewPage"

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            <MainLayout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<SearchPage />} />
                <Route path="/passport/:dpp_id" element={<PassportPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dpp/new"
                  element={
                    <ProtectedRoute>
                      <DppCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dpp/:dpp_id/edit"
                  element={
                    <ProtectedRoute>
                      <DppEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dpp/:dpp_id/view"
                  element={
                    <ProtectedRoute>
                      <DppViewPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MainLayout>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
