import { useState, useRef } from "react";
import { uploadDocument } from "../../services/documentService";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES_DOCUMENT } from "../../utils/constants";

export default function UploadModal({ onClose }) {
  const { currentUser } = useAuth();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    description: "",
    categorie: "autre",
  });

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (!form.nom) setForm({ ...form, nom: f.name.replace(/\.[^.]+$/, "") });
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!form.nom) setForm({ ...form, nom: f.name.replace(/\.[^.]+$/, "") }); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError("Veuillez sélectionner un fichier."); return; }
    setUploading(true);
    setError("");
    try {
      await uploadDocument(file, form, currentUser.uid, setProgress);
      onClose();
    } catch {
      setError("Erreur lors de l'upload. Réessayez.");
      setUploading(false);
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Uploader un document</h2>
          <button style={styles.closeBtn} onClick={onClose} disabled={uploading}>✕</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Zone de drop */}
          <div
            style={{ ...styles.dropZone, borderColor: file ? "#4F46E5" : "#e2e8f0", background: file ? "#EEF2FF" : "#f8fafc" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
            {file ? (
              <div>
                <p style={styles.dropIcon}>📄</p>
                <p style={styles.fileName}>{file.name}</p>
                <p style={styles.fileSize}>{formatSize(file.size)}</p>
              </div>
            ) : (
              <div>
                <p style={styles.dropIcon}>⬆️</p>
                <p style={styles.dropText}>Glissez un fichier ici ou cliquez pour sélectionner</p>
                <p style={styles.dropHint}>PDF, Word, Excel, Images — max 10 MB</p>
              </div>
            )}
          </div>

          {/* Métadonnées */}
          <div style={styles.field}>
            <label style={styles.label}>Nom du document *</label>
            <input
              style={styles.input}
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex: Contrat Mohamed Ali"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Catégorie</label>
            <select
              style={styles.input}
              value={form.categorie}
              onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            >
              {CATEGORIES_DOCUMENT.map((c) => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, minHeight: "70px", resize: "vertical" }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description optionnelle..."
            />
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div style={styles.progressWrapper}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <p style={styles.progressText}>{progress}% — Upload en cours...</p>
            </div>
          )}

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose} disabled={uploading}>
              Annuler
            </button>
            <button type="submit" style={styles.submitBtn} disabled={uploading || !file}>
              {uploading ? `Upload... ${progress}%` : "⬆️ Uploader"}
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
  dropZone: { border: "2px dashed", borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer", marginBottom: "1.5rem", transition: "all 0.2s" },
  dropIcon: { fontSize: "36px", margin: "0 0 8px" },
  dropText: { fontSize: "14px", color: "#374151", fontWeight: 500, margin: "0 0 4px" },
  dropHint: { fontSize: "12px", color: "#94a3b8", margin: 0 },
  fileName: { fontSize: "14px", fontWeight: 600, color: "#4F46E5", margin: "0 0 4px" },
  fileSize: { fontSize: "12px", color: "#64748b", margin: 0 },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  progressWrapper: { marginBottom: "1rem" },
  progressBar: { background: "#e2e8f0", borderRadius: "8px", height: "8px", overflow: "hidden", marginBottom: "6px" },
  progressFill: { background: "#4F46E5", height: "100%", borderRadius: "8px", transition: "width 0.3s" },
  progressText: { fontSize: "13px", color: "#4F46E5", fontWeight: 500, margin: 0 },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px" },
  submitBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  error: { color: "red", padding: "0 1.5rem", fontSize: "14px" },
};