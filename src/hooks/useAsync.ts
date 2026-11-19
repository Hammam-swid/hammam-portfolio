import { useEffect, useState } from "react";

/** Runs a stable async loader once and tracks its data/loading/error state. */
export function useAsync<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<{
    data?: T;
    loading: boolean;
    error?: string;
  }>({ loading: true });

  useEffect(() => {
    let alive = true;
    loader()
      .then((data) => alive && setState({ data, loading: false }))
      .catch(
        (e: Error) => alive && setState({ loading: false, error: e.message }),
      );
    return () => {
      alive = false;
    };
  }, [loader]);

  return state;
}
