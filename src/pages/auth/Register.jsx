import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/authService";

export default function Register() {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.email, form.password, form.nom, form.prenom);
      navigate("/dashboard");
    } catch (err) {
      setError("Erreur lors de l'inscription. Vérifiez vos informations.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Créer un compte</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" name="prenom" placeholder="Prénom" value={form.prenom} onChange={handleChange} required />
          <input style={styles.input} type="text" name="nom" placeholder="Nom" value={form.nom} onChange={handleChange} required />
          <input style={styles.input} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input style={styles.input} type="password" name="password" placeholder="Mot de passe (6 caractères min)" value={form.password} onChange={handleChange} required />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
        <p style={styles.link}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
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
  error: { color: "red", marginBottom: "1rem", fontSize: "14px" },
  link: { marginTop: "1rem", fontSize: "13px", textAlign: "center" },
};