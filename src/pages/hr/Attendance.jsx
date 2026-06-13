import { useState, useEffect } from "react";
import { getAttendance, addAttendance, getTodayAttendance } from "../../services/hrService";
import { getEmployees } from "../../services/employeeService";
import { STATUTS_PRESENCE } from "../../utils/constants";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [todayStats, setTodayStats] = useState({ present: 0, absent: 0, retard: 0, conge: 0 });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeId: "", employeeNom: "",
    date: new Date().toISOString().split("T")[0],
    heureEntree: "08:00", heureSortie: "17:00",
    statut: "present",
  });
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    setLoading(true);
    const [att, today, emps] = await Promise.all([
      getAttendance(),
      getTodayAttendance(),
      getEmployees(),
    ]);
    setAttendance(att);
    setEmployees(emps);

    const stats = { present: 0, absent: 0, retard: 0, conge: 0 };
    today.forEach((a) => { if (stats[a.statut] !== undefined) stats[a.statut]++; });
    setTodayStats(stats);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function handleEmployeeChange(e) {
    const emp = employees.find((em) => em.id === e.target.value);
    setForm({ ...form, employeeId: e.target.value, employeeNom: emp ? `${emp.prenom} ${emp.nom}` : "" });
  }

  function calcHeures(entree, sortie) {
    if (!entree || !sortie) return 0;
    const [h1, m1] = entree.split(":").map(Number);
    const [h2, m2] = sortie.split(":").map(Number);
    return Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const heuresTravaillees = calcHeures(form.heureEntree, form.heureSortie);
    await addAttendance({ ...form, heuresTravaillees });
    setSaving(false);
    setShowForm(false);
    fetchData();
  }

  if (loading) return <p style={{ padding: "1rem" }}>Chargement...</p>;

  return (
    <div>
      {/* Stats du jour */}
      <div style={styles.todayHeader}>
        <h3 style={styles.todayTitle}>
          📅 Aujourd'hui — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </h3>
      </div>
      <div style={styles.statsGrid}>
        {[
          { key: "present", label: "Présents", icon: "✅", color: "#059669", bg: "#ECFDF5" },
          { key: "absent", label: "Absents", icon: "❌", color: "#DC2626", bg: "#FEF2F2" },
          { key: "retard", label: "En retard", icon: "⏰", color: "#D97706", bg: "#FFFBEB" },
          { key: "conge", label: "En congé", icon: "🏖️", color: "#4F46E5", bg: "#EEF2FF" },
        ].map((s) => (
          <div key={s.key} style={{ ...styles.statCard, background: s.bg, border: `1px solid ${s.color}22` }}>
            <span style={styles.statIcon}>{s.icon}</span>
            <div>
              <p style={{ ...styles.statLabel, color: s.color }}>{s.label}</p>
              <p style={{ ...styles.statValue, color: s.color }}>{todayStats[s.key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <h3 style={styles.histTitle}>Historique des présences</h3>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          + Enregistrer présence
        </button>
      </div>

      {/* Formulaire inline */}
      {showForm && (
        <div style={styles.inlineForm}>
          <h4 style={styles.inlineTitle}>Enregistrer une présence</h4>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Employé</label>
                <select style={styles.input} value={form.employeeId} onChange={handleEmployeeChange} required>
                  <option value="">Sélectionner</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Date</label>
                <input style={styles.input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Heure entrée</label>
                <input style={styles.input} type="time" value={form.heureEntree} onChange={(e) => setForm({ ...form, heureEntree: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Heure sortie</label>
                <input style={styles.input} type="time" value={form.heureSortie} onChange={(e) => setForm({ ...form, heureSortie: e.target.value })} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Statut</label>
                <select style={styles.input} value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
                  {STATUTS_PRESENCE.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Heures calculées</label>
                <input style={{ ...styles.input, background: "#f8fafc" }} value={`${calcHeures(form.heureEntree, form.heureSortie).toFixed(1)}h`} readOnly />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Employé</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Entrée</th>
              <th style={styles.th}>Sortie</th>
              <th style={styles.th}>Heures</th>
              <th style={styles.th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr><td colSpan={6} style={styles.empty}>Aucune présence enregistrée</td></tr>
            ) : (
              attendance.slice(0, 20).map((att) => {
                const statut = STATUTS_PRESENCE.find((s) => s.value === att.statut);
                return (
                  <tr key={att.id} style={styles.tr}>
                    <td style={styles.td}><strong>{att.employeeNom}</strong></td>
                    <td style={styles.td}>{att.date}</td>
                    <td style={styles.td}>{att.heureEntree || "—"}</td>
                    <td style={styles.td}>{att.heureSortie || "—"}</td>
                    <td style={styles.td}>
                      <strong>{att.heuresTravaillees?.toFixed(1) || "0"}h</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statut?.bg || "#f1f5f9",
                        color: statut?.color || "#64748b",
                      }}>
                        {statut?.label || att.statut}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  todayHeader: { marginBottom: "1rem" },
  todayTitle: { margin: 0, fontSize: "15px", fontWeight: 600, color: "#0f172a" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  statCard: { borderRadius: "12px", padding: "1rem", display: "flex", alignItems: "center", gap: "12px" },
  statIcon: { fontSize: "24px" },
  statLabel: { margin: 0, fontSize: "12px", fontWeight: 600 },
  statValue: { margin: 0, fontSize: "24px", fontWeight: 700 },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  histTitle: { margin: 0, fontSize: "15px", fontWeight: 600 },
  addBtn: { padding: "10px 18px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  inlineForm: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", marginBottom: "1.5rem" },
  inlineTitle: { margin: "0 0 1rem", fontSize: "15px", fontWeight: 600 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  formActions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px" },
  submitBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#0f172a", verticalAlign: "middle" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "14px" },
};