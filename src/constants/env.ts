export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://rob-italic-beginner-faces.trycloudflare.com/api/v1/zalo";

export const API_ORIGIN: string = (() => {
  try {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "";
  }
})();