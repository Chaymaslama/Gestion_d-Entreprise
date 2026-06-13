import { useState, useEffect } from "react";
import { getTransactions } from "../services/financeService";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => { fetchTransactions(); }, []);
  return { transactions, loading, error, refetch: fetchTransactions };
}