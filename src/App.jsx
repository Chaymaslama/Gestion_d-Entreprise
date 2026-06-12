import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";

function PrivateLayout({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* App */}
          <Route path="/dashboard" element={<PrivateLayout><Dashboard /></PrivateLayout>} />

          {/* Placeholder pages */}
          <Route path="/employees" element={<PrivateLayout><h2>👥 Employés — bientôt</h2></PrivateLayout>} />
          <Route path="/clients" element={<PrivateLayout><h2>🤝 Clients — bientôt</h2></PrivateLayout>} />
          <Route path="/products" element={<PrivateLayout><h2>📦 Produits — bientôt</h2></PrivateLayout>} />
          <Route path="/stock" element={<PrivateLayout><h2>🏭 Stock — bientôt</h2></PrivateLayout>} />
          <Route path="/orders" element={<PrivateLayout><h2>🛒 Commandes — bientôt</h2></PrivateLayout>} />
          <Route path="/documents" element={<PrivateLayout><h2>📄 Documents — bientôt</h2></PrivateLayout>} />
          <Route path="/projects" element={<PrivateLayout><h2>🗂️ Projets — bientôt</h2></PrivateLayout>} />
          <Route path="/finance" element={<PrivateLayout><h2>💰 Finance — bientôt</h2></PrivateLayout>} />
          <Route path="/messages" element={<PrivateLayout><h2>💬 Messagerie — bientôt</h2></PrivateLayout>} />
          <Route path="/settings" element={<PrivateLayout><h2>⚙️ Paramètres — bientôt</h2></PrivateLayout>} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}