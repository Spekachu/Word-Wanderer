import { useState, useEffect, useCallback } from 'react';

const cache = new Map();

function useCachedApi(url, token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      cache.set(url, result);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    if (cache.has(url)) {
      setData(cache.get(url));
      setLoading(false);
    } else {
      fetchData();
    }
  }, [url, fetchData]);

  const invalidateCache = useCallback(() => {
    cache.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { data, loading, error, invalidateCache, refetch: fetchData };
}

export default useCachedApi;