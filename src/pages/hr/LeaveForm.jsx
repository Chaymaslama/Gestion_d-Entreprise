import { useState, useEffect } from "react";
import { addLeave, calcWorkDays } from "../../services/hrService";
import { getEmployees } from "../../services/employeeService";
import { TYPES_CONGE } from "../../utils/constants";

export default function LeaveForm({ onClose }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    employeeNom: "",
    type: "annuel",
    dateDebut: "",
    dateFin: "",
    motif: "",
  });

  useEffect(() => {
    getEmployees().then(setEmployees);
  }, []);

  const nombreJours = form.dateDebut && form.dateFin
    ? calcWorkDays(form.dateDebut, form.dateFin)
    : 0;

  function handleEmployeeChange(e) {
    const emp = employees.find((em) => em.id === e.target.value);
    setForm({
      ...form,
      employeeId: e.target.value,
      employeeNom: emp ? `${emp.prenom} ${emp.nom}` : "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (nombreJours <= 0) { setError("La date de fin doit être après la date de début."); return; }
    setLoading(true);
    setError("");
    try {
      await addLeave({ ...form, nombreJours });
      onClose();
    } catch {
      setError("Une erreur est survenue.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Nouvelle demande de congé</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Employé *</label>
            <select style={styles.input} value={form.employeeId} onChange={handleEmployeeChange} required>
              <option value="">Sélectionner un employé</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Type de congé *</label>
            <select
              style={styles.input}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES_CONGE.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Date de début *</label>
              <input
                style={styles.input}
                type="date"
                value={form.dateDebut}
                onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Date de fin *</label>
              <input
                style={styles.input}
                type="date"
                value={form.dateFin}
                onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                required
              />
            </div>
          </div>

          {nombreJours > 0 && (
            <div style={styles.joursInfo}>
              📅 <strong>{nombreJours} jour(s) ouvrable(s)</strong>
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Motif</label>
            <textarea
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
              value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })}
              placeholder="Raison du congé..."
            />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Annuler</button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Envoi..." : "Soumettre la demande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" },
  modal: { background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: 700 },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" },
  form: { padding: "1.5rem" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  joursInfo: { background: "#EEF2FF", borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem", fontSize: "14px", color: "#4F46E5" },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1rem" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px" },
  submitBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  error: { color: "red", padding: "0 1.5rem", fontSize: "14px" },
};