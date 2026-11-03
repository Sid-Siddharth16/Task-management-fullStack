import { useCallback, useEffect, useState } from "react";
import { type HttpError, isRequestCanceled, toHttpError } from "../api/api.helper";
import { systemService } from "../api/services/system.service";
import type { ApiInfo, HealthStatus } from "../types/system.types";

export type ApiStatusState =
  | { status: "loading" }
  | { status: "success"; info: ApiInfo; health: HealthStatus }
  | { status: "error"; error: HttpError };

export function useApiStatus() {
  const [state, setState] = useState<ApiStatusState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      systemService.getInfo(controller.signal),
      systemService.getHealth(controller.signal),
    ])
      .then(([info, health]) => setState({ status: "success", info, health }))
      .catch((error: unknown) => {
        if (isRequestCanceled(error)) return;
        setState({ status: "error", error: toHttpError(error) });
      });

    // abort in-flight requests on unmount / retry (also dedupes StrictMode double-run)
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  }, []);

  return { ...state, retry };
}
