import { API_BASE_URL, API_ORIGIN } from "@/constants/env";
import { APIError } from "@/lib/api-error";
import {
  ConfirmAttendanceResponse,
  Customer,
  EventDetail,
  EventSummary,
  QrCheckin,
  RegisterRequest,
  RegisterResponse,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
  VouchersResponse,
} from "@/types/event.types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    throw new APIError(0, (err as Error)?.message || "Network error");
  }

  clearTimeout(timeout);

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message =
      json?.message ||
      (json?.errors ? Object.values(json.errors).flat().join(", ") : null) ||
      `Request failed (${res.status})`;
    throw new APIError(res.status, message);
  }

  return (json?.data ?? json) as T;
}

export function resolveMedia(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("data:")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

function phoneQuery(phone?: string): string {
  return phone ? `?phone=${encodeURIComponent(phone)}` : "";
}

export const eventService = {
  async getEvents(phone?: string): Promise<EventSummary[]> {
    return request(`/events${phoneQuery(phone)}`);
  },

  async resolveZaloPhone(
    code: string,
    accessToken: string,
  ): Promise<{ number: string }> {
    return request("/phone", {
      method: "POST",
      body: JSON.stringify({ code, access_token: accessToken }),
    });
  },

  async getEventDetail(idOrSlug: string | number): Promise<EventDetail> {
    return request(`/event/${encodeURIComponent(String(idOrSlug))}`);
  },

  async getCustomer(phone: string): Promise<Customer> {
    return request(`/customer${phoneQuery(phone)}`);
  },

  async getQrCheckin(phone: string): Promise<QrCheckin> {
    return request(`/qr-checkin${phoneQuery(phone)}`);
  },

  async getVouchers(phone: string): Promise<VouchersResponse> {
    return request(`/vouchers${phoneQuery(phone)}`);
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return request("/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateCustomer(
    payload: UpdateCustomerRequest,
  ): Promise<UpdateCustomerResponse> {
    return request("/customer/update", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async confirmAttendance(phone: string): Promise<ConfirmAttendanceResponse> {
    return request("/confirm", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },
};
