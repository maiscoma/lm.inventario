import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Toaster } from "react-hot-toast"
import Header from "./Header";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* ✨ 2. ESTRUCTURA MODIFICADA DEL CONTENIDO PRINCIPAL */}
      <div className="lg:ml-64 transition-all duration-300 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--dark-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--dark-border)",
          },
          success: {
            iconTheme: {
              primary: "var(--success-color)",
              secondary: "var(--text-primary)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--error-color)",
              secondary: "var(--text-primary)",
            },
          },
        }}
      />
    </div>
  )
}

export default MainLayout
