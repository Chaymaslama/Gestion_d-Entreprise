import { useEffect, useState } from "react";
import {
  listenDashboardStats, getMonthlyRevenue,
  getOrdersByMonth, getRecentTransactions,
  getLowStockAlerts, getRecentOrders,
} from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import { STATUTS_COMMANDE } from "../../utils/constants";

export default function Dashboard() {
  const { currentUser, userRole } = useAuth();
  const [stats, setStats] = useState({ employes: 0, clients: 0, produits: 0, commandes: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [ordersByMonth, setOrdersByMonth] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Stats temps réel
    listenDashboardStats(setStats);

    // Reste des données
    async function loadData() {
      const [rev, orders, transactions, stock, recentOrd] = await Promise.all([
        getMonthlyRevenue(),
        getOrdersByMonth(),
        getRecentTransactions(),
        getLowStockAlerts(),
        getRecentOrders(),
      ]);
      setMonthlyRevenue(rev);
      setOrdersByMonth(orders);
      setRecentTransactions(transactions);
      setLowStock(stock);
      setRecentOrders(recentOrd);
      setLoading(false);
    }
    loadData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const kpiCards = [
    { label: "Employés", value: stats.employes, icon: "👥", color: "#4F46E5", bg: "#EEF2FF", link: "/employees" },
    { label: "Clients", value: stats.clients, icon: "🤝", color: "#0891b2", bg: "#ECFEFF", link: "/clients" },
    { label: "Produits", value: stats.produits, icon: "📦", color: "#059669", bg: "#ECFDF5", link: "/products" },
    { label: "Commandes", value: stats.commandes, icon: "🛒", color: "#D97706", bg: "#FFFBEB", link: "/orders" },
    { label: "CA du mois", value: `${monthlyRevenue.toFixed(0)} DT`, icon: "💰", color: "#7C3AED", bg: "#F5F3FF", link: "/finance" },
  ];

  if (loading) return (
    <div style={styles.loadingWrapper}>
      <p style={styles.loadingText}>⏳ Chargement du dashboard...</p>
    </div>
  );

  return (
    <div>
      {/* Greeting */}
      <div style={styles.greeting}>
        <div>
          <h2 style={styles.greetingTitle}>
            {greeting}, {currentUser?.email?.split("@")[0]} 👋
          </h2>
          <p style={styles.greetingSubtitle}>
            Voici un aperçu de votre activité aujourd'hui · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <span style={styles.roleBadge}>{userRole || "employé"}</span>
      </div>

      {/* Alertes */}
      {lowStock.length > 0 && (
        <div style={styles.alert}>
          ⚠️ <strong>{lowStock.length} produit(s) en stock faible :</strong>{" "}
          {lowStock.map((p) => p.nom).join(", ")}
        </div>
      )}

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {kpiCards.map((card) => (
          <div key={card.label} style={styles.kpiCard}>
            <div style={{ ...styles.kpiIcon, background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <p style={styles.kpiLabel}>{card.label}</p>
              <p style={{ ...styles.kpiValue, color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div style={styles.chartsGrid}>
        {/* Commandes par mois */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 Commandes — 6 derniers mois</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="commandes" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions récentes */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>💳 Transactions récentes</h3>
          {recentTransactions.length === 0 ? (
            <p style={styles.emptyText}>Aucune transaction</p>
          ) : (
            recentTransactions.map((t) => (
              <div key={t.id} style={styles.transactionRow}>
                <span style={{ fontSize: "20px" }}>
                  {t.type === "revenu" ? "💰" : "💸"}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={styles.transactionDesc}>
                    {t.description || t.categorie || "—"}
                  </p>
                  <p style={styles.transactionDate}>{t.date}</p>
                </div>
                <span style={{
                  fontWeight: 700,
                  color: t.type === "revenu" ? "#059669" : "#DC2626",
                  fontSize: "14px",
                }}>
                  {t.type === "revenu" ? "+" : "-"}{Number(t.montant).toFixed(2)} DT
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Commandes récentes */}
      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>🛒 Dernières commandes</h3>
        {recentOrders.length === 0 ? (
          <p style={styles.emptyText}>Aucune commande</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>N° Commande</th>
                <th style={styles.th}>Client</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const statut = STATUTS_COMMANDE.find((s) => s.value === order.statut);
                return (
                  <tr key={order.id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.numero}>{order.numero}</code>
                    </td>
                    <td style={styles.td}>{order.clientNom}</td>
                    <td style={styles.td}>
                      <strong>{Number(order.total || 0).toFixed(2)} DT</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statut?.bg || "#f1f5f9",
                        color: statut?.color || "#64748b",
                      }}>
                        {statut?.label || order.statut}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {order.createdAt?.toDate?.()?.toLocaleDateString("fr-FR") || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  loadingWrapper: { display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" },
  loadingText: { fontSize: "16px", color: "#64748b" },
  greeting: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", background: "#fff", borderRadius: "12px", padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0" },
  greetingTitle: { margin: "0 0 4px", fontSize: "20px", fontWeight: 700 },
  greetingSubtitle: { margin: 0, fontSize: "13px", color: "#64748b", textTransform: "capitalize" },
  roleBadge: { background: "#EEF2FF", color: "#4F46E5", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, textTransform: "capitalize" },
  alert: { background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", marginBottom: "1rem", fontSize: "14px", color: "#92400E" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  kpiCard: { background: "#fff", borderRadius: "12px", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", border: "1px solid #e2e8f0" },
  kpiIcon: { width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 },
  kpiLabel: { margin: 0, fontSize: "12px", color: "#64748b" },
  kpiValue: { margin: 0, fontSize: "26px", fontWeight: 700 },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" },
  chartCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" },
  chartTitle: { margin: "0 0 1.25rem", fontSize: "15px", fontWeight: 600 },
  transactionRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  transactionDesc: { margin: 0, fontSize: "13px", fontWeight: 500 },
  transactionDate: { margin: 0, fontSize: "11px", color: "#94a3b8" },
  emptyText: { textAlign: "center", color: "#94a3b8", fontSize: "14px", padding: "2rem 0" },
  tableCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 16px", fontSize: "14px", color: "#0f172a", verticalAlign: "middle" },
  numero: { background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 },
};