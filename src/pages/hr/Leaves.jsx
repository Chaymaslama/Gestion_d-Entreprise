import { useState, useEffect } from "react";
import { getLeaves, updateLeaveStatus, deleteLeave } from "../../services/hrService";
import { useAuth } from "../../context/AuthContext";
import { STATUTS_CONGE, TYPES_CONGE } from "../../utils/constants";
import LeaveForm from "./LeaveForm";

export default function Leaves() {
  const { userRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatut, setFilterStatut] = useState("");

  async function fetchLeaves() {
    setLoading(true);
    const data = await getLeaves();
    setLeaves(data);
    setLoading(false);
  }

  useEffect(() => { fetchLeaves(); }, []);

  const filtered = leaves.filter((l) =>
    filterStatut ? l.statut === filterStatut : true
  );

  const enAttente = leaves.filter((l) => l.statut === "en_attente").length;

  async function handleStatus(id, statut) {
    const commentaire = statut === "refuse"
      ? window.prompt("Motif du refus (optionnel) :") || ""
      : "";
    await updateLeaveStatus(id, statut, commentaire);
    fetchLeaves();
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette demande ?")) return;
    await deleteLeave(id);
    fetchLeaves();
  }

  if (loading) return <p style={{ padding: "1rem" }}>Chargement...</p>;

  return (
    <div>
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total demandes</p>
          <p style={styles.statValue}>{leaves.length}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #D97706" }}>
          <p style={styles.statLabel}>En attente</p>
          <p style={{ ...styles.statValue, color: "#D97706" }}>{enAttente}</p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #059669" }}>
          <p style={styles.statLabel}>Approuvés</p>
          <p style={{ ...styles.statValue, color: "#059669" }}>
            {leaves.filter((l) => l.statut === "approuve").length}
          </p>
        </div>
        <div style={{ ...styles.statCard, borderLeft: "4px solid #DC2626" }}>
          <p style={styles.statLabel}>Refusés</p>
          <p style={{ ...styles.statValue, color: "#DC2626" }}>
            {leaves.filter((l) => l.statut === "refuse").length}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <select
          style={styles.select}
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS_CONGE.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>
          + Nouvelle demande
        </button>
      </div>

      <p style={styles.count}>{filtered.length} demande(s)</p>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Employé</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Période</th>
              <th style={styles.th}>Jours</th>
              <th style={styles.th}>Motif</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={styles.empty}>Aucune demande de congé</td></tr>
            ) : (
              filtered.map((leave) => {
                const statut = STATUTS_CONGE.find((s) => s.value === leave.statut);
                const type = TYPES_CONGE.find((t) => t.value === leave.type);
                return (
                  <tr key={leave.id} style={styles.tr}>
                    <td style={styles.td}>
                      <p style={styles.empNom}>{leave.employeeNom}</p>
                    </td>
                    <td style={styles.td}>
                      {type?.icon} {type?.label || leave.type}
                    </td>
                    <td style={styles.td}>
                      <p style={{ margin: 0, fontSize: "13px" }}>
                        {leave.dateDebut} → {leave.dateFin}
                      </p>
                    </td>
                    <td style={styles.td}>
                      <strong>{leave.nombreJours}j</strong>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.motif}>{leave.motif || "—"}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statut?.bg,
                        color: statut?.color,
                      }}>
                        {statut?.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {(userRole === "admin" || userRole === "manager") && leave.statut === "en_attente" && (
                        <>
                          <button
                            style={styles.approveBtn}
                            onClick={() => handleStatus(leave.id, "approuve")}
                          >
                            ✅
                          </button>
                          <button
                            style={styles.refuseBtn}
                            onClick={() => handleStatus(leave.id, "refuse")}
                          >
                            ❌
                          </button>
                        </>
                      )}
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(leave.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <LeaveForm onClose={() => { setShowForm(false); fetchLeaves(); }} />
      )}
    </div>
  );
}

const styles = {
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "1rem 1.25rem", border: "1px solid #e2e8f0", borderLeft: "4px solid #4F46E5" },
  statLabel: { margin: "0 0 4px", fontSize: "12px", color: "#64748b" },
  statValue: { margin: 0, fontSize: "24px", fontWeight: 700, color: "#4F46E5" },
  toolbar: { display: "flex", gap: "12px", marginBottom: "1rem" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", background: "#fff" },
  addBtn: { padding: "10px 18px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  count: { fontSize: "13px", color: "#64748b", marginBottom: "1rem" },
  tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#0f172a", verticalAlign: "middle" },
  empNom: { margin: 0, fontWeight: 600 },
  motif: { margin: 0, fontSize: "12px", color: "#64748b", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 },
  approveBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "18px", marginRight: "4px" },
  refuseBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "18px", marginRight: "4px" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "14px" },
};