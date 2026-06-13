import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Employees from "./pages/employees/Employees";
import Clients from "./pages/clients/Clients";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import Documents from "./pages/documents/Documents";
import Finance from "./pages/finance/Finance";
import Messages from "./pages/messages/Messages";
import HR from "./pages/hr/HR";

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
          <Route path="/employees" element={<PrivateLayout><Employees /></PrivateLayout>} />
          <Route path="/clients" element={<PrivateLayout><Clients /></PrivateLayout>} />
          <Route path="/products" element={<PrivateLayout><Products /></PrivateLayout>} />
          <Route path="/stock" element={<PrivateLayout><Products /></PrivateLayout>} />
          <Route path="/orders" element={<PrivateLayout><Orders /></PrivateLayout>} />
          <Route path="/documents" element={<PrivateLayout><Documents /></PrivateLayout>} />
          <Route path="/projects" element={<PrivateLayout><h2>🗂️ Projets — bientôt</h2></PrivateLayout>} />
          <Route path="/finance" element={<PrivateLayout><Finance /></PrivateLayout>} />
          <Route path="/messages" element={<PrivateLayout><Messages /></PrivateLayout>} />
          <Route path="/settings" element={<PrivateLayout><h2>⚙️ Paramètres — bientôt</h2></PrivateLayout>} />
          <Route path="/hr" element={<PrivateLayout><HR /></PrivateLayout>} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}