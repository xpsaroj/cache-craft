"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, isAbortError } from "@/lib/api/client";

interface QueryState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isRefreshing: boolean;
}

interface UseApiQueryOptions {
  enabled?: boolean;
}

export function useApiQuery<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: UseApiQueryOptions = {},
) {
  const { enabled = true } = options;
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    isLoading: enabled,
    isRefreshing: false,
  });
  const [version, setVersion] = useState(0);
  const fetcherRef = useRef(fetcher);
  const currentKeyRef = useRef<string | null>(null);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refresh = useCallback(() => {
    setVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      currentKeyRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset state when the query is disabled.
      setState({
        data: null,
        error: null,
        isLoading: false,
        isRefreshing: false,
      });
      return;
    }

    const keyChanged = currentKeyRef.current !== key;
    currentKeyRef.current = key;
    const controller = new AbortController();
    let cancelled = false;

    setState((previous) => {
      const keepData = !keyChanged && previous.data !== null;

      return {
        data: keepData ? previous.data : null,
        error: null,
        isLoading: !keepData,
        isRefreshing: keepData,
      };
    });

    fetcherRef.current(controller.signal)
      .then((data) => {
        if (!cancelled) {
          setState({
            data,
            error: null,
            isLoading: false,
            isRefreshing: false,
          });
        }
      })
      .catch((error: unknown) => {
        if (cancelled || isAbortError(error)) {
          return;
        }

        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError({
                status: 0,
                message: "Something went wrong. Please try again.",
              });

        setState((previous) => ({
          data: previous.data,
          error: apiError,
          isLoading: false,
          isRefreshing: false,
        }));
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [key, enabled, version]);

  return { ...state, refresh };
}
