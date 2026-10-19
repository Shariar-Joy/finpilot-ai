export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Same-origin browser client. Never expose a proxy/server HTML error to users. */
export async function api<T>(
  path: string,
  body?: unknown,
  method = body ? "POST" : "GET",
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Could not reach the server. Check your connection and try again.",
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      response.status,
      "The server returned an unexpected response. Please try again.",
    );
  }
  if (!response.ok) {
    const error =
      data && typeof data === "object" && "error" in data
        ? data.error
        : undefined;
    throw new ApiError(
      response.status,
      typeof error === "string" ? error : "Request failed. Please try again.",
    );
  }
  return data as T;
}
