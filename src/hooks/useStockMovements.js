import { useState, useEffect } from "react";
import { getStockMovements } from "../services/productService";

export function useStockMovements(productId = null) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchMovements() {
    setLoading(true);
    const data = await getStockMovements(productId);
    setMovements(data);
    setLoading(false);
  }

  useEffect(() => { fetchMovements(); }, [productId]);
  return { movements, loading, refetch: fetchMovements };
}