import { useState } from "react";
import { useEmployees } from "../../hooks/useEmployees";
import { deleteEmployee } from "../../services/employeeService";
import { STATUTS_EMPLOYE } from "../../utils/constants";
import EmployeeForm from "./EmployeeForm";

export default function Employees() {
  const { employees, loading, refetch } = useEmployees();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.nom?.toLowerCase().includes(search.toLowerCase()) ||
      e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      e.poste?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut ? e.statut === filterStatut : true;
    return matchSearch && matchStatut;
  });

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cet employé ?")) return;
    await deleteEmployee(id);
    refetch();
  }

  function handleEdit(emp) {
    setSelected(emp);
    setShowForm(true);
  }

  function handleAdd() {
    setSelected(null);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setSelected(null);
    refetch();
  }

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="🔍 Rechercher un employé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS_EMPLOYE.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button style={styles.addBtn} onClick={handleAdd}>
          + Ajouter un employé
        </button>
      </div>

      {/* Compteur */}
      <p style={styles.count}>{filtered.length} employé(s) trouvé(s)</p>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Employé</th>
              <th style={styles.th}>Poste</th>
              <th style={styles.th}>Département</th>
              <th style={styles.th}>Contrat</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={styles.empty}>Aucun employé trouvé</td>
              </tr>
            ) : (
              filtered.map((emp) => {
                const statut = STATUTS_EMPLOYE.find((s) => s.value === emp.statut);
                return (
                  <tr key={emp.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.empCell}>
                        <div style={styles.avatar}>
                          {emp.prenom?.charAt(0)}{emp.nom?.charAt(0)}
                        </div>
                        <div>
                          <p style={styles.empName}>{emp.prenom} {emp.nom}</p>
                          <p style={styles.empEmail}>{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{emp.poste || "—"}</td>
                    <td style={styles.td}>{emp.departement || "—"}</td>
                    <td style={styles.td}>{emp.typeContrat || "—"}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statut?.bg || "#f1f5f9",
                        color: statut?.color || "#64748b",
                      }}>
                        {statut?.label || emp.statut}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleEdit(emp)}>✏️</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(emp.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <EmployeeForm employee={selected} onClose={handleClose} />
      )}
    </div>
  );
}

const styles = {
  toolbar: { display: "flex", gap: "12px", marginBottom: "1rem", flexWrap: "wrap" },
  search: { flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", background: "#fff" },
  addBtn: { padding: "10px 18px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  count: { fontSize: "13px", color: "#64748b", marginBottom: "1rem" },
  tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#0f172a", verticalAlign: "middle" },
  empCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", flexShrink: 0 },
  empName: { margin: 0, fontWeight: 600, fontSize: "14px" },
  empEmail: { margin: 0, fontSize: "12px", color: "#64748b" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 },
  editBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "8px" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "14px" },
};