import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CONFIRM_ATTENDANCE_KEY,
  GET_CUSTOMER_KEY,
  GET_EVENT_DETAIL_KEY,
  GET_EVENTS_KEY,
  GET_QR_KEY,
  GET_VOUCHERS_KEY,
  REGISTER_KEY,
  UPDATE_CUSTOMER_KEY,
} from "@/constants/api";
import { eventService } from "./event.api";
import {
  RegisterRequest,
  UpdateCustomerRequest,
} from "@/types/event.types";

export function useEvents(phone?: string) {
  return useQuery({
    queryKey: [GET_EVENTS_KEY, phone],
    queryFn: () => eventService.getEvents(phone),
    enabled: Boolean(phone),
  });
}

export function useAllEvents() {
  return useQuery({
    queryKey: [GET_EVENTS_KEY, "all"],
    queryFn: () => eventService.getEvents(),
  });
}

export function useEventDetail(idOrSlug?: string | number) {
  return useQuery({
    queryKey: [GET_EVENT_DETAIL_KEY, idOrSlug],
    queryFn: () => eventService.getEventDetail(idOrSlug as string | number),
    enabled: idOrSlug !== undefined && idOrSlug !== null && idOrSlug !== "",
  });
}

export function useCustomer(phone?: string) {
  return useQuery({
    queryKey: [GET_CUSTOMER_KEY, phone],
    queryFn: () => eventService.getCustomer(phone as string),
    enabled: Boolean(phone),
  });
}

export function useQrCheckin(phone?: string) {
  return useQuery({
    queryKey: [GET_QR_KEY, phone],
    queryFn: () => eventService.getQrCheckin(phone as string),
    enabled: Boolean(phone),
  });
}

export function useVouchers(phone?: string) {
  return useQuery({
    queryKey: [GET_VOUCHERS_KEY, phone],
    queryFn: () => eventService.getVouchers(phone as string),
    enabled: Boolean(phone),
  });
}

export function useRegister() {
  return useMutation({
    mutationKey: [REGISTER_KEY],
    mutationFn: (payload: RegisterRequest) => eventService.register(payload),
  });
}

export function useUpdateCustomer() {
  return useMutation({
    mutationKey: [UPDATE_CUSTOMER_KEY],
    mutationFn: (payload: UpdateCustomerRequest) =>
      eventService.updateCustomer(payload),
  });
}

export function useConfirmAttendance() {
  return useMutation({
    mutationKey: [CONFIRM_ATTENDANCE_KEY],
    mutationFn: (phone: string) => eventService.confirmAttendance(phone),
  });
}