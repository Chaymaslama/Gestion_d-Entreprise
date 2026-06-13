import { useState } from "react";
import Leaves from "./Leaves";
import Attendance from "./Attendance";

export default function HR() {
  const [activeTab, setActiveTab] = useState("leaves");

  return (
    <div>
      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === "leaves" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("leaves")}
        >
          🏖️ Gestion des congés
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "attendance" ? styles.tabActive : {}) }}
          onClick={() => setActiveTab("attendance")}
        >
          📋 Présences & Pointage
        </button>
      </div>

      {/* Contenu */}
      <div style={styles.content}>
        {activeTab === "leaves" && <Leaves />}
        {activeTab === "attendance" && <Attendance />}
      </div>
    </div>
  );
}

const styles = {
  tabs: { display: "flex", gap: "8px", marginBottom: "1.5rem", background: "#fff", padding: "6px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "fit-content" },
  tab: { padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#64748b", background: "transparent", transition: "all 0.2s" },
  tabActive: { background: "#4F46E5", color: "#fff", fontWeight: 600 },
  content: {},
};