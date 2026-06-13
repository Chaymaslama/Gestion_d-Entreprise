import { useState, useEffect } from "react";
import { getDocuments } from "../services/documentService";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { fetchDocuments(); }, []);
  return { documents, loading, error, refetch: fetchDocuments };
}