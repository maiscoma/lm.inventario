"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { reportService } from "../services/reportService"
import { productService } from "../services/productService"
import { Package, AlertTriangle, TrendingUp, Activity, Clock, DollarSign, BarChart3 } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"
import toast from "react-hot-toast"

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockAlerts: 0,
    totalValue: 0,
    recentMovements: 0,
  })
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [recentMovements, setRecentMovements] = useState([])
  const [movementStats, setMovementStats] = useState({
    entradas: 0,
    salidas: 0,
    totalMovements: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        const [
          productsResponse,
          lowStockResponse,
          inventoryStatsResponse,
          movementStatsResponse,
          recentMovementsResponse,
        ] = await Promise.all([
          productService.getAll(), // No necesitamos límite aquí
          reportService.getLowStockReport(),
          isAdmin() ? reportService.getInventoryStats() : Promise.resolve({ data: { totalValue: 0 } }),
          reportService.getMovementStats(),
          reportService.getRecentMovements(4),
        ]);

        // ✨ CORRECCIÓN AQUÍ: Asegúrate de acceder a la propiedad 'data'
        setStats({
          totalProducts: productsResponse.data?.length || 0,
          lowStockAlerts: lowStockResponse.data?.length || 0, // Usamos .length
          totalValue: inventoryStatsResponse.data?.totalValue || 0,
          recentMovements: movementStatsResponse.data?.recentMovements || 0,
        });

        setLowStockProducts(lowStockResponse.data?.slice(0, 4) || []);
        setRecentMovements(recentMovementsResponse.data || []);
        setMovementStats(movementStatsResponse.data || {});

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
        toast.error("Error al cargar los datos del dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin]);

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount)
  }

  // --- ✨ CORRECCIÓN 3: Formateo de fecha relativa ---
  const formatRelativeTime = (timestamp) => {
    if (!timestamp || typeof timestamp._seconds !== 'number') return "hace un momento";

    const date = new Date(timestamp._seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `hace ${diffInSeconds}s`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
  }

  // Cards de estadísticas
  const StatCard = ({ title, value, icon: Icon, color, trend, description }) => (
    <div className="card hover-glow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-text-muted text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {description && <p className="text-text-secondary text-sm mt-1">{description}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Bienvenido de vuelta, <span className="font-medium text-primary">{user?.nombre}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock className="w-4 h-4" />
          <span>Última actualización: {new Date().toLocaleString("es-CL")}</span>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          color="bg-gradient-to-r from-primary to-primary-dark"
          description="Productos registrados"
        />

        <StatCard
          title="Alertas de Stock"
          value={stats.lowStockAlerts}
          icon={AlertTriangle}
          color="bg-gradient-to-r from-warning to-orange-500"
          description="Productos con stock bajo"
        />

        {isAdmin() && (
          <StatCard
            title="Valor Total"
            value={formatCurrency(stats.totalValue)}
            icon={DollarSign}
            color="bg-gradient-to-r from-success to-green-600"
            description="Valorización del inventario"
          />
        )}

        <StatCard
          title="Movimientos Recientes"
          value={stats.recentMovements}
          icon={Activity}
          color="bg-gradient-to-r from-accent to-purple-600"
          description="Últimos 7 días"
        />
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de stock bajo */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Alertas de Stock
              </h3>
              <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-sm font-medium">
                {stats.lowStockAlerts}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{product.nombre}</p>
                    <p className="text-sm text-text-muted">{product.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-warning">Stock: {product.stock.actual}</p>
                    <p className="text-xs text-text-muted">Mín: {product.stock.minimo}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted">No hay alertas de stock bajo</p>
              </div>
            )}
          </div>

          {lowStockProducts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-border">
              <button className="w-full btn-secondary text-sm">Ver todas las alertas</button>
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Actividad Reciente
            </h3>
          </div>

          <div className="space-y-3">
            {recentMovements.length > 0 ? (
              recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${movement.type === "entrada" ? "bg-success/20 text-success" : "bg-error/20 text-error"
                      }`}
                  >
                    {movement.type === "entrada" ? "+" : "-"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{movement.productInfo?.nombre || `ID: ${movement.productId}`}</p>
                    <p className="text-sm text-text-muted">
                      {movement.type === "entrada" ? "Entrada" : "Salida"} de {movement.quantity} unidades
                    </p>
                    <p className="text-xs text-text-muted">Motivo: {movement.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">{formatRelativeTime(movement.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted">No hay movimientos recientes</p>
              </div>
            )}
          </div>

          {recentMovements.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-border">
              <button className="w-full btn-secondary text-sm">Ver todos los movimientos</button>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de resumen (solo para administradores) */}
      {isAdmin() && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Resumen de Movimientos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{movementStats.totalMovements || 0}</p>
              <p className="text-text-muted">Movimientos Totales</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{movementStats.entradas || 0}</p>
              <p className="text-text-muted">Entradas Totales</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-8 h-8 text-accent" />
              </div>
              <p className="text-2xl font-bold text-text-primary">{movementStats.salidas || 0}</p>
              <p className="text-text-muted">Salidas Totales</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
