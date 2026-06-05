import axios from "axios";

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorBody | string | undefined;

    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      if (data.message) return data.message;
      if (data.error) return data.error;
    }

    if (err.response?.status === 401) return "Session expired. Please log in again.";
    if (err.response?.status === 403) return "You don't have permission for this action.";
    if (err.response?.status === 404) return "Resource not found.";
    if (err.response?.status === 422) return "Invalid file or resume content.";
    if (err.response?.status === 500) return "Server error. Please try again shortly.";
    if (err.message === "Network Error") return "Network error. Check your connection.";

    return err.message || fallback;
  }

  if (err instanceof Error) return err.message;
  return fallback;
}
