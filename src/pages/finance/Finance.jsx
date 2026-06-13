import { useState } from "react";
import { useTransactions } from "../../hooks/useTransactions";
import { deleteTransaction, calcStats, groupByMonth } from "../../services/financeService";
import { STATUTS_TRANSACTION, CATEGORIES_FINANCE } from "../../utils/constants";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import TransactionForm from "./TransactionForm";

export default function Finance() {
  const { transactions, loading, refetch } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  const stats = calcStats(transactions);
  const chartData = groupByMonth(transactions);

  const filtered = transactions.filter((t) => {
    const matchType = filterType ? t.type === filterType : true;
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette transaction ?")) return;
    await deleteTransaction(id);
    refetch();
  }

  function handleClose() {
    setShowForm(false);
    setSelected(null);
    refetch();
  }

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div>
      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #059669" }}>
          <p style={styles.kpiLabel}>Total Revenus</p>
          <p style={{ ...styles.kpiValue, color: "#059669" }}>
            {stats.revenus.toFixed(2)} DT
          </p>
        </div>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #DC2626" }}>
          <p style={styles.kpiLabel}>Total Dépenses</p>
          <p style={{ ...styles.kpiValue, color: "#DC2626" }}>
            {stats.depenses.toFixed(2)} DT
          </p>
        </div>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #4F46E5" }}>
          <p style={styles.kpiLabel}>Bénéfice Net</p>
          <p style={{ ...styles.kpiValue, color: stats.benefice >= 0 ? "#4F46E5" : "#DC2626" }}>
            {stats.benefice.toFixed(2)} DT
          </p>
        </div>
        <div style={{ ...styles.kpiCard, borderLeft: "4px solid #D97706" }}>
          <p style={styles.kpiLabel}>En attente</p>
          <p style={{ ...styles.kpiValue, color: "#D97706" }}>
            {stats.enAttente.toFixed(2)} DT
          </p>
        </div>
      </div>

      {/* Graphique */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Revenus vs Dépenses — {new Date().getFullYear()}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `${value.toFixed(2)} DT`} />
            <Legend />
            <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#059669" fill="url(#colorRevenus)" strokeWidth={2} />
            <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#DC2626" fill="url(#colorDepenses)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Tous les types</option>
          <option value="revenu">💰 Revenus</option>
          <option value="depense">💸 Dépenses</option>
        </select>
        <button style={{ ...styles.btn, background: "#059669" }} onClick={() => { setSelected({ type: "revenu" }); setShowForm(true); }}>
          + Revenu
        </button>
        <button style={{ ...styles.btn, background: "#DC2626" }} onClick={() => { setSelected({ type: "depense" }); setShowForm(true); }}>
          + Dépense
        </button>
      </div>

      <p style={styles.count}>{filtered.length} transaction(s)</p>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Catégorie</th>
              <th style={styles.th}>Montant</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={styles.empty}>Aucune transaction trouvée</td></tr>
            ) : (
              filtered.map((t) => {
                const statut = STATUTS_TRANSACTION.find((s) => s.value === t.statut);
                const isRevenu = t.type === "revenu";
                const allCats = [...CATEGORIES_FINANCE.revenu, ...CATEGORIES_FINANCE.depense];
                const cat = allCats.find((c) => c.value === t.categorie);
                return (
                  <tr key={t.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.typeBadge,
                        background: isRevenu ? "#ECFDF5" : "#FEF2F2",
                        color: isRevenu ? "#059669" : "#DC2626",
                      }}>
                        {isRevenu ? "💰 Revenu" : "💸 Dépense"}
                      </span>
                    </td>
                    <td style={styles.td}>{t.description || "—"}</td>
                    <td style={styles.td}>{cat?.icon} {cat?.label || t.categorie}</td>
                    <td style={styles.td}>
                      <strong style={{ color: isRevenu ? "#059669" : "#DC2626" }}>
                        {isRevenu ? "+" : "-"}{Number(t.montant).toFixed(2)} DT
                      </strong>
                    </td>
                    <td style={styles.td}>{t.date || "—"}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statut?.bg || "#f1f5f9",
                        color: statut?.color || "#64748b",
                      }}>
                        {statut?.label || t.statut}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => { setSelected(t); setShowForm(true); }}>✏️</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(t.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && <TransactionForm transaction={selected} onClose={handleClose} />}
    </div>
  );
}

const styles = {
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  kpiCard: { background: "#fff", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0" },
  kpiLabel: { margin: "0 0 6px", fontSize: "13px", color: "#64748b" },
  kpiValue: { margin: 0, fontSize: "24px", fontWeight: 700 },
  chartCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" },
  chartTitle: { margin: "0 0 1.5rem", fontSize: "15px", fontWeight: 600 },
  toolbar: { display: "flex", gap: "12px", marginBottom: "1rem", flexWrap: "wrap" },
  search: { flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", background: "#fff" },
  btn: { padding: "10px 18px", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  count: { fontSize: "13px", color: "#64748b", marginBottom: "1rem" },
  tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#0f172a", verticalAlign: "middle" },
  typeBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 },
  editBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "8px" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "14px" },
};