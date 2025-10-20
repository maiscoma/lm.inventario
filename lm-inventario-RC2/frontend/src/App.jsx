// --- INICIO DE LA SOLUCIÓN ---
import { lazy, Suspense, useCallback } from "react";
// --- FIN DE LA SOLUCIÓN ---
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import particlesOptions from "./components/particles-config";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
// --- INICIO DE LA SOLUCIÓN ---
import LoadingSpinner from "./components/LoadingSpinner"; // Importamos el spinner

// Convertimos las importaciones estáticas a dinámicas con React.lazy
const Login = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const CreateProductPage = lazy(() => import("./pages/CreateProductPage"));
const EditProductPage = lazy(() => import("./pages/EditProductPage"));
const MovementsPage = lazy(() => import("./pages/MovementsPage"));
const StockAlertsPage = lazy(() => import("./pages/StockAlertsPage"));
const MovementsReportPage = lazy(() => import("./pages/MovementsReportPage"));
const ValuationReportPage = lazy(() => import("./pages/ValuationReportPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const SystemLogsPage = lazy(() => import("./pages/SystemLogsPage"));
const SystemSettingsPage = lazy(() => import("./pages/SystemSettingsPage"));
const DatabasePage = lazy(() => import("./pages/DatabasePage"));
// --- FIN DE LA SOLUCIÓN ---

function App() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="relative">
      <Particles
        id="tsparticles-global"
        init={particlesInit}
        options={particlesOptions}
      />
      <div className="relative z-10">
        <AuthProvider>
          <NotificationProvider>
            <SettingsProvider>
              <Router>
                {/* --- INICIO DE LA SOLUCIÓN --- */}
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <LoadingSpinner size="lg" text="Cargando..." />
                    </div>
                  }
                >
                  <Routes>
                    {/* Rutas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    {/* Layout principal para rutas protegidas */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <MainLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="products/new" element={<CreateProductPage />} />
                      <Route path="products/edit/:id" element={<EditProductPage />} />
                      <Route path="movimientos" element={<MovementsPage />} />
                      
                      {/* Rutas de administración (solo para administrador) */}
                      <Route
                        path="admin"
                        element={
                          <ProtectedRoute requiredRole="administrador">
                            <AdminPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/usuarios"
                        element={
                          <ProtectedRoute requiredRole="administrador">
                            <UsersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/logs"
                        element={
                          <ProtectedRoute requiredRole="administrador">
                            <SystemLogsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/configuracion"
                        element={
                          <ProtectedRoute requiredRole="administrador">
                            <SystemSettingsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="admin/base-de-datos"
                        element={
                          <ProtectedRoute requiredRole="administrador">
                            <DatabasePage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Rutas de Reportes */}
                      <Route
                        path="reportes/alertas"
                        element={
                          <ProtectedRoute requiredRole={["administrador", "operador"]}>
                            <StockAlertsPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="reportes/movimientos"
                        element={
                          <ProtectedRoute requiredRole={["administrador", "operador"]}>
                            <MovementsReportPage />
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="reportes/valorizacion"
                        element={
                          <ProtectedRoute requiredRole="administrador">
                            <ValuationReportPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Ruta por defecto para cualquier otra cosa */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Routes>
                </Suspense>
                {/* --- FIN DE LA SOLUCIÓN --- */}
              </Router>
            </SettingsProvider>
          </NotificationProvider>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;