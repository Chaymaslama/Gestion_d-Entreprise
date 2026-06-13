import { useState } from "react";
import { useDocuments } from "../../hooks/useDocuments";
import { deleteDocument, formatFileSize } from "../../services/documentService";
import { CATEGORIES_DOCUMENT } from "../../utils/constants";
import UploadModal from "./UploadModal";

export default function Documents() {
  const { documents, loading, refetch } = useDocuments();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = documents.filter((d) => {
    const matchSearch =
      d.nom?.toLowerCase().includes(search.toLowerCase()) ||
      d.fichierNom?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? d.categorie === filterCat : true;
    return matchSearch && matchCat;
  });

  async function handleDelete(id, fichierURL) {
    if (!window.confirm("Supprimer ce document ?")) return;
    await deleteDocument(id, fichierURL);
    refetch();
  }

  function getFileIcon(type) {
    if (type?.includes("pdf")) return "📕";
    if (type?.includes("image")) return "🖼️";
    if (type?.includes("word") || type?.includes("document")) return "📘";
    if (type?.includes("sheet") || type?.includes("excel")) return "📗";
    return "📄";
  }

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div>
      <div style={styles.catGrid}>
        {CATEGORIES_DOCUMENT.map((cat) => {
          const count = documents.filter((d) => d.categorie === cat.value).length;
          return (
            <div
              key={cat.value}
              style={{
                ...styles.catCard,
                background: cat.bg,
                border: `1px solid ${cat.color}22`,
                cursor: "pointer",
                outline: filterCat === cat.value ? `2px solid ${cat.color}` : "none",
              }}
              onClick={() => setFilterCat(filterCat === cat.value ? "" : cat.value)}
            >
              <span style={styles.catIcon}>{cat.icon}</span>
              <div>
                <p style={{ ...styles.catLabel, color: cat.color }}>{cat.label}</p>
                <p style={{ ...styles.catCount, color: cat.color }}>{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="🔍 Rechercher un document..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={styles.uploadBtn} onClick={() => setShowUpload(true)}>
          ⬆️ Uploader un document
        </button>
      </div>

      <p style={styles.count}>{filtered.length} document(s)</p>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>📂</p>
          <p style={styles.emptyText}>Aucun document trouvé</p>
          <button style={styles.uploadBtn} onClick={() => setShowUpload(true)}>
            Uploader votre premier document
          </button>
        </div>
      ) : (
        <div style={styles.docGrid}>
          {filtered.map((document) => {
            const cat = CATEGORIES_DOCUMENT.find((c) => c.value === document.categorie);
            const viewUrl = document.fichierURL;
            const fileName = document.fichierNom;
            return (
              <div key={document.id} style={styles.docCard}>
                <div style={styles.docHeader}>
                  <span style={styles.fileIcon}>{getFileIcon(document.fichierType)}</span>
                  <span style={{
                    ...styles.catBadge,
                    background: cat?.bg || "#f1f5f9",
                    color: cat?.color || "#64748b",
                  }}>
                    {cat?.icon} {cat?.label}
                  </span>
                </div>

                <p style={styles.docNom}>{document.nom}</p>
                {document.description && (
                  <p style={styles.docDesc}>{document.description}</p>
                )}
                <p style={styles.docMeta}>
                  {fileName} · {formatFileSize(document.fichierTaille || 0)}
                </p>
                <p style={styles.docDate}>
                  {document.createdAt?.toDate?.()?.toLocaleDateString("fr-FR") || "—"}
                </p>

                <div style={styles.docActions}>
                  <button
                    style={styles.viewBtn}
                    onClick={() => window.open(viewUrl, "_blank")}
                  >
                    👁️ Voir
                  </button>
                  <button
                    style={styles.downloadBtn}
                    onClick={() => window.open(viewUrl, "_blank")}
                  >
                    ⬇️ Télécharger
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(document.id, viewUrl)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUpload && (
        <UploadModal onClose={() => { setShowUpload(false); refetch(); }} />
      )}
    </div>
  );
}

const styles = {
  catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "1.5rem" },
  catCard: { borderRadius: "10px", padding: "12px", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s" },
  catIcon: { fontSize: "22px" },
  catLabel: { margin: 0, fontSize: "12px", fontWeight: 600 },
  catCount: { margin: 0, fontSize: "20px", fontWeight: 700 },
  toolbar: { display: "flex", gap: "12px", marginBottom: "1rem", flexWrap: "wrap" },
  search: { flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" },
  uploadBtn: { padding: "10px 18px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" },
  count: { fontSize: "13px", color: "#64748b", marginBottom: "1rem" },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" },
  docCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "8px" },
  docHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  fileIcon: { fontSize: "28px" },
  catBadge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 },
  docNom: { margin: 0, fontWeight: 700, fontSize: "14px", color: "#0f172a" },
  docDesc: { margin: 0, fontSize: "12px", color: "#64748b", lineHeight: 1.4 },
  docMeta: { margin: 0, fontSize: "11px", color: "#94a3b8" },
  docDate: { margin: 0, fontSize: "11px", color: "#94a3b8" },
  docActions: { display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" },
  viewBtn: { padding: "6px 12px", background: "#EEF2FF", color: "#4F46E5", borderRadius: "6px", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" },
  downloadBtn: { padding: "6px 12px", background: "#ECFDF5", color: "#059669", borderRadius: "6px", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginLeft: "auto" },
  empty: { textAlign: "center", padding: "4rem", color: "#94a3b8" },
  emptyIcon: { fontSize: "48px", margin: "0 0 1rem" },
  emptyText: { fontSize: "16px", marginBottom: "1.5rem" },
};