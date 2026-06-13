import { useState, useEffect } from "react";
import { getClients } from "../services/clientService";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchClients() {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { fetchClients(); }, []);

  return { clients, loading, error, refetch: fetchClients };
}