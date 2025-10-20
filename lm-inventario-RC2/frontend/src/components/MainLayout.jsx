// frontend/src/components/MainLayout.jsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Toaster } from "react-hot-toast";
import Header from "./Header";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // --- SOLUCIÓN: Se quita la clase `bg-dark-bg` de este div ---
    <div className="min-h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div>
        <Header 
          toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--dark-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--dark-border)",
          },
        }}
      />
    </div>
  );
};

export default MainLayout;