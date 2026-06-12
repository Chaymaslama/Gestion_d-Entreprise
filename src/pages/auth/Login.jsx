import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Connexion</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p style={styles.link}>
          <Link to="/reset-password">Mot de passe oublié ?</Link>
        </p>
        <p style={styles.link}>
          Pas de compte ? <Link to="/register">S'inscrire</Link>
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