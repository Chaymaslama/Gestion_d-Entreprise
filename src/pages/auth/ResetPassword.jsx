import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../services/authService";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      await resetPassword(email);
      setMessage("Email de réinitialisation envoyé ! Vérifiez votre boîte mail.");
    } catch {
      setError("Aucun compte trouvé avec cet email.");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mot de passe oublié</h2>
        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button style={styles.button} type="submit">Envoyer le lien</button>
        </form>
        <p style={styles.link}><Link to="/login">← Retour à la connexion</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" },
  card: { background: "#fff", padding: "2rem", borderRadius: "12px", width: "100%", maxWidth: "400px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  title: { marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 },
  input: { width: "100%", padding: "10px 14px", marginBottom: "1rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" },
  button: { width: "100%", padding: "10px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer" },
  error: { color: "red", fontSize: "14px" },
  success: { color: "green", fontSize: "14px" },
  link: { marginTop: "1rem", fontSize: "13px", textAlign: "center" },
};