import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import MainLayout from "./components/MainLayout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AdminPage from "./pages/AdminPage"
import ProductsPage from "./pages/ProductsPage" // Added ProductsPage import
import CreateProductPage from "./pages/CreateProductPage" // Added CreateProductPage import
import EditProductPage from "./pages/EditProductPage" // Added EditProductPage import
import MovementsPage from "./pages/MovementsPage" // Added MovementsPage import
import StockAlertsPage from "./pages/StockAlertsPage"; // Added StockAlertsPage import
import MovementsReportPage from "./pages/MovementsReportPage";
import ValuationReportPage from "./pages/ValuationReportPage";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";
import SystemLogsPage from "./pages/SystemLogsPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import { NotificationProvider } from "./contexts/NotificationContext";
import DatabasePage from "./pages/DatabasePage";
import { SettingsProvider } from "./contexts/SettingsContext";

// Configuración de rutas
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} /> {/* ✨ 2. AÑADE LA RUTA */}

            {/* Rutas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Redirigir raíz al dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard - Accesible para todos los usuarios autenticados */}
              <Route path="dashboard" element={<Dashboard />} />

              {/* Administración - Solo para administradores */}
              <Route
                path="admin/*"
                element={
                  <ProtectedRoute requiredRole="administrador">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Gestión de Productos - Accesible para todos los usuarios autenticados */}
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<CreateProductPage />} />
              <Route path="products/edit/:id" element={<EditProductPage />} />

              <Route path="movimientos" element={<MovementsPage />} />
              <Route path="reportes/movimientos" element={<MovementsReportPage />} />
              <Route path="reportes/valorizacion" element={<ValuationReportPage />} />
              <Route path="admin" element={<ProtectedRoute requiredRole="administrador"><AdminPage /></ProtectedRoute>} />
              <Route path="admin/usuarios" element={<ProtectedRoute requiredRole="administrador"><UsersPage /></ProtectedRoute>} />
              <Route path="admin/logs" element={<ProtectedRoute requiredRole="administrador"><SystemLogsPage /></ProtectedRoute>} />
              <Route path="admin/configuracion" element={<ProtectedRoute requiredRole="administrador"><SystemSettingsPage /></ProtectedRoute>} />
              <Route path="admin/base-de-datos" element={<ProtectedRoute requiredRole="administrador"><DatabasePage /></ProtectedRoute>} />
              <Route
                path="reportes/alertas"
                element={<StockAlertsPage />}
              />
              <Route
                path="reportes/*"
                element={
                  <div className="card">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Reportes y Estadísticas</h2>
                    <p className="text-text-secondary">
                      Selecciona un reporte del menú lateral.
                    </p>
                  </div>
                }
              />

            </Route>
            {/* Ruta catch-all - Redirigir a dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        </SettingsProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
