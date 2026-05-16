// PUT sans body JSON
export async function putAuthNoBody<TResponse>(
  endpoint: string,
  token: string,
): Promise<TResponse> {
  return requestJson<TResponse>(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
import { getApiUrl } from "@/config/api";
import { errorApi } from "@/types/errorAPI.type";

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let apiErrorPopupHandler:
  | ((payload: {
      type: "error" | "info";
      title: string;
      message: string;
    }) => void)
  | null = null;
let tokenRefreshHandler: (() => Promise<string | null>) | null = null;
let isHandlingUnauthorized = false;
let lastApiPopupKey = "";
let lastApiPopupAt = 0;
let refreshInFlight: Promise<string | null> | null = null;

const API_POPUP_COOLDOWN_MS = 1500;

type HttpApiError = Error & { status: number; errorApi?: errorApi };

export type RequestBehaviorOptions = {
  canRetryAuth?: boolean;
  suppressErrorPopup?: boolean;
  suppressUnauthorizedHandler?: boolean;
};

function showApiErrorPopup(title: string, message: string) {
  const now = Date.now();
  const popupKey = `${title}|${message}`;

  if (
    lastApiPopupKey === popupKey &&
    now - lastApiPopupAt < API_POPUP_COOLDOWN_MS
  ) {
    return;
  }

  lastApiPopupKey = popupKey;
  lastApiPopupAt = now;

  if (apiErrorPopupHandler) {
    apiErrorPopupHandler({
      type: "error",
      title,
      message,
    });
  }
}

function extractApiError(rawBody: string, status: number): errorApi | null {
  if (!rawBody?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;

    const invalidParams = Array.isArray(parsed.InvalidParams)
      ? parsed.InvalidParams.map((item) => {
          if (item && typeof item === "object") {
            const input = item as Record<string, unknown>;
            const name = typeof input.name === "string" ? input.name : "";
            const reason = typeof input.reason === "string" ? input.reason : "";
            return { name, reason };
          }
          return null;
        }).filter((item): item is { name: string; reason: string } =>
          Boolean(item),
        )
      : [];

    return {
      type: typeof parsed.type === "string" ? parsed.type : "about:blank",
      title: typeof parsed.title === "string" ? parsed.title : "Erreur API",
      detail:
        typeof parsed.detail === "string"
          ? parsed.detail
          : typeof parsed.message === "string"
            ? parsed.message
            : typeof parsed.error === "string"
              ? parsed.error
              : rawBody.trim(),
      instance: typeof parsed.instance === "string" ? parsed.instance : "",
      status: typeof parsed.status === "number" ? parsed.status : status,
      InvalidParams: invalidParams,
    };
  } catch {
    return {
      type: "about:blank",
      title: "Erreur API",
      detail: rawBody.trim(),
      instance: "",
      status,
      InvalidParams: [],
    };
  }
}

export function setUnauthorizedHandler(
  handler: (() => void | Promise<void>) | null,
) {
  unauthorizedHandler = handler;
}

export function setApiErrorPopupHandler(
  handler:
    | ((payload: {
        type: "error" | "info";
        title: string;
        message: string;
      }) => void)
    | null,
) {
  apiErrorPopupHandler = handler;
}

export function getApiErrorPopupHandler() {
  return apiErrorPopupHandler;
}

export function setTokenRefreshHandler(
  handler: (() => Promise<string | null>) | null,
) {
  tokenRefreshHandler = handler;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!tokenRefreshHandler) {
    return null;
  }

  if (!refreshInFlight) {
    refreshInFlight = tokenRefreshHandler().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function handleUnauthorizedResponse(
  response: Response,
  apiMessage: string,
  options?: RequestBehaviorOptions,
) {
  if (options?.suppressUnauthorizedHandler) {
    const error = new Error(
      apiMessage || `Erreur API (${response.status})`,
    ) as HttpApiError;
    error.status = response.status;
    throw error;
  }

  if (!isHandlingUnauthorized) {
    isHandlingUnauthorized = true;
    if (!options?.suppressErrorPopup) {
      showApiErrorPopup(
        "Session expirée",
        apiMessage || "Votre session a expiré. Veuillez vous reconnecter.",
      );
    }
    try {
      await unauthorizedHandler?.();
    } finally {
      isHandlingUnauthorized = false;
    }
  }

  const error = new Error(
    apiMessage || `Erreur API (${response.status})`,
  ) as HttpApiError;
  error.status = response.status;
  throw error;
}

async function requestJson<T>(
  endpoint: string,
  init?: RequestInit,
  options?: RequestBehaviorOptions,
): Promise<T> {
  try {
    const headers = new Headers(init?.headers ?? {});

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(getApiUrl(endpoint), {
      ...init,
      headers,
    });

    if (!response.ok) {
      const errorRawBody = await response.text();
      const parsedApiError = extractApiError(errorRawBody, response.status);
      const apiMessage =
        parsedApiError?.detail || `Erreur API (${response.status})`;
      const apiTitle =
        parsedApiError?.title ||
        (response.status >= 500 ? "Erreur serveur" : "Erreur API");

      if (response.status === 401) {
        const currentAuthorization = headers.get("Authorization");

        if (
          options?.canRetryAuth !== false &&
          currentAuthorization?.startsWith("Bearer ")
        ) {
          const refreshedToken = await refreshAccessToken();

          if (refreshedToken) {
            const retryHeaders = new Headers(headers);
            retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

            return requestJson<T>(
              endpoint,
              {
                ...init,
                headers: retryHeaders,
              },
              {
                ...options,
                canRetryAuth: false,
              },
            );
          }
        }

        const error = new Error(
          apiMessage || `Erreur API (${response.status})`,
        ) as HttpApiError;
        error.status = response.status;
        error.errorApi = parsedApiError ?? undefined;

        await handleUnauthorizedResponse(response, apiMessage, options);
        throw error;
      } else if (!options?.suppressErrorPopup) {
        showApiErrorPopup(
          apiTitle,
          apiMessage || `Erreur API (${response.status})`,
        );
      }

      const error = new Error(
        apiMessage || `Erreur API (${response.status})`,
      ) as HttpApiError;
      error.status = response.status;
      error.errorApi = parsedApiError ?? undefined;
      throw error;
    }

    const rawBody = await response.text();

    if (!rawBody) {
      return null as T;
    }

    return JSON.parse(rawBody) as T;
  } catch (error) {
    const httpError = error as Partial<HttpApiError>;

    if (typeof httpError?.status === "number") {
      throw error;
    }

    const networkMessage =
      "Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.";
    if (!options?.suppressErrorPopup) {
      showApiErrorPopup("Erreur réseau", networkMessage);
    }

    const networkError = new Error(networkMessage) as HttpApiError;
    networkError.status = 0;
    throw networkError;
  }
}

async function requestMultipart<T>(
  endpoint: string,
  init?: RequestInit,
  options?: RequestBehaviorOptions,
): Promise<T> {
  try {
    const headers = new Headers(init?.headers ?? {});
    console.log(
      "[requestMultipart] Headers envoyés :",
      Object.fromEntries((headers as any).entries()),
    );
    const response = await fetch(getApiUrl(endpoint), {
      ...init,
      headers,
    });

    if (!response.ok) {
      const errorRawBody = await response.text();
      const parsedApiError = extractApiError(errorRawBody, response.status);
      const apiMessage =
        parsedApiError?.detail || `Erreur API (${response.status})`;
      const apiTitle =
        parsedApiError?.title ||
        (response.status >= 500 ? "Erreur serveur" : "Erreur API");

      if (response.status === 401) {
        const currentAuthorization = headers.get("Authorization");

        if (
          options?.canRetryAuth !== false &&
          currentAuthorization?.startsWith("Bearer ")
        ) {
          const refreshedToken = await refreshAccessToken();

          if (refreshedToken) {
            const retryHeaders = new Headers(headers);
            retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

            return requestMultipart<T>(
              endpoint,
              {
                ...init,
                headers: retryHeaders,
              },
              {
                ...options,
                canRetryAuth: false,
              },
            );
          }
        }

        const error = new Error(
          apiMessage || `Erreur API (${response.status})`,
        ) as HttpApiError;
        error.status = response.status;
        error.errorApi = parsedApiError ?? undefined;

        await handleUnauthorizedResponse(response, apiMessage, options);
        throw error;
      } else if (!options?.suppressErrorPopup) {
        showApiErrorPopup(
          apiTitle,
          apiMessage || `Erreur API (${response.status})`,
        );
      }

      const error = new Error(
        apiMessage || `Erreur API (${response.status})`,
      ) as HttpApiError;
      error.status = response.status;
      error.errorApi = parsedApiError ?? undefined;
      throw error;
    }

    const rawBody = await response.text();

    if (!rawBody) {
      return null as T;
    }

    return JSON.parse(rawBody) as T;
  } catch (error) {
    const httpError = error as Partial<HttpApiError>;
    if (typeof httpError?.status === "number") {
      throw error;
    }

    const networkMessage =
      "Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.";
    if (!options?.suppressErrorPopup) {
      showApiErrorPopup("Erreur réseau", networkMessage);
    }

    const networkError = new Error(networkMessage) as HttpApiError;
    networkError.status = 0;
    throw networkError;
  }
}

export async function getJson<T>(endpoint: string): Promise<T> {
  return requestJson<T>(endpoint);
}

export async function getJsonAuth<T>(
  endpoint: string,
  token: string,
): Promise<T> {
  return requestJson<T>(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function postJson<TResponse, TBody = unknown>(
  endpoint: string,
  body?: TBody,
  options?: RequestBehaviorOptions,
): Promise<TResponse> {
  return requestJson<TResponse>(
    endpoint,
    {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    options,
  );
}

export async function postJsonAuth<TResponse, TBody = unknown>(
  endpoint: string,
  token: string,
  body?: TBody,
): Promise<TResponse> {
  return requestJson<TResponse>(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function deleteJsonAuth<TResponse>(
  endpoint: string,
  token: string,
): Promise<TResponse> {
  return requestJson<TResponse>(endpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function putJsonAuth<TResponse, TBody = unknown>(
  endpoint: string,
  token: string,
  body?: TBody,
): Promise<TResponse> {
  return requestJson<TResponse>(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function uploadMultipartAuth<TResponse>(
  endpoint: string,
  token: string,
  body: FormData,
  method: "POST" | "PUT" | "PATCH" = "POST",
): Promise<TResponse> {
  return requestMultipart<TResponse>(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
}
