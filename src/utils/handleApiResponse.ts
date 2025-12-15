import type { ApiResponse } from "apisauce";

function getErrorMessage(result: unknown): string {
  if (typeof result === "string") return result;
  if (result && typeof result === "object" && "message" in result) {
    const message = (result as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Unknown error";
}

function handleApiResponse<T>(response: ApiResponse<T, unknown>): T {
  if (!response.ok) {
    const details = [
      response.problem ? `problem=${response.problem}` : null,
      response.originalError
        ? `error=${getErrorMessage(response.originalError)}`
        : null,
    ]
      .filter(Boolean)
      .join(" ");
    throw new Error(
      details
        ? `Todos API request failed (${details})`
        : "Todos API request failed"
    );
  }
  return response.data as T;
}

export default handleApiResponse;
