import toast from "react-hot-toast";

interface ApiResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  error?: string | string[];
  errors?: string[] | Record<string, any>;
  [key: string]: any;
}

export const handleApiError = (
  response: ApiResponse | unknown,
  fallbackMessage = "Something went wrong. Please try again."
) => {
  try {
    const res =
      typeof response === "object" && response !== null
        ? (response as ApiResponse)
        : {};

    const isFailure = res.success === false || res.status === false;

    // Collect all error messages
    const messages: string[] = [];

    if (Array.isArray(res.errors)) {
      messages.push(...res.errors.map(String));
    } else if (typeof res.errors === "object" && res.errors !== null) {
      Object.values(res.errors).forEach((v) => messages.push(String(v)));
    }

    if (Array.isArray(res.error)) {
      messages.push(...res.error.map(String));
    } else if (typeof res.error === "string") {
      messages.push(res.error);
    }

    // Only include message if there are no detailed errors
    if (messages.length === 0 && typeof res.message === "string") {
      messages.push(res.message);
    }

    const uniqueMessages = [...new Set(messages)];

    if (isFailure || uniqueMessages.length > 0) {
      if (uniqueMessages.length > 0) {
        uniqueMessages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(fallbackMessage);
      }
      return;
    }

    // Unknown shape fallback
    toast.error(fallbackMessage);
  } catch {
    toast.error(fallbackMessage);
  }
};
