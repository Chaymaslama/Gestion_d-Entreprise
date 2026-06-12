import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";

const menuItems = [
  { path: "/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/employees", icon: "👥", label: "Employés" },
  { path: "/clients", icon: "🤝", label: "Clients" },
  { path: "/products", icon: "📦", label: "Produits" },
  { path: "/stock", icon: "🏭", label: "Stock" },
  { path: "/orders", icon: "🛒", label: "Commandes" },
  { path: "/documents", icon: "📄", label: "Documents" },
  { path: "/projects", icon: "🗂️", label: "Projets" },
  { path: "/finance", icon: "💰", label: "Finance" },
  { path: "/messages", icon: "💬", label: "Messagerie" },
  { path: "/settings", icon: "⚙️", label: "Paramètres" },
];

export default function Layout({ children }) {
  const { currentUser, userRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: collapsed ? "64px" : "220px" }}>
        {/* Logo */}
        <div style={styles.logo}>
          {!collapsed && <span style={styles.logoText}>🏢 GestionPro</span>}
          <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Menu */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  background: active ? "#4F46E5" : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div style={styles.userSection}>
          <div style={styles.avatar}>
            {currentUser?.email?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={styles.userInfo}>
              <p style={styles.userEmail}>{currentUser?.email}</p>
              <p style={styles.userRole}>{userRole || "employé"}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>
            {menuItems.find((m) => m.path === location.pathname)?.label || "Dashboard"}
          </h1>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Déconnexion
          </button>
        </header>

        {/* Content */}
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", minHeight: "100vh", background: "#f8fafc" },
  sidebar: { background: "#0f172a", display: "flex", flexDirection: "column", transition: "width 0.3s", overflow: "hidden", minHeight: "100vh", position: "sticky", top: 0 },
  logo: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1rem", borderBottom: "1px solid #1e293b" },
  logoText: { color: "#fff", fontWeight: 700, fontSize: "15px", whiteSpace: "nowrap" },
  collapseBtn: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px", padding: "4px" },
  nav: { flex: 1, padding: "1rem 0.5rem", display: "flex", flexDirection: "column", gap: "4px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", textDecoration: "none", transition: "all 0.2s", whiteSpace: "nowrap" },
  navIcon: { fontSize: "18px", minWidth: "20px", textAlign: "center" },
  navLabel: { fontSize: "14px", fontWeight: 500 },
  userSection: { display: "flex", alignItems: "center", gap: "10px", padding: "1rem", borderTop: "1px solid #1e293b" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#4F46E5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 },
  userInfo: { overflow: "hidden" },
  userEmail: { color: "#e2e8f0", fontSize: "12px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole: { color: "#64748b", fontSize: "11px", margin: 0, textTransform: "capitalize" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  header: { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  pageTitle: { fontSize: "18px", fontWeight: 600, margin: 0, color: "#0f172a" },
  logoutBtn: { background: "none", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#64748b" },
  content: { padding: "1.5rem", flex: 1 },
};