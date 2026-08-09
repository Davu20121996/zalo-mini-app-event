import { useEffect, useRef, type ReactNode } from "react";
import PhoneAuthSheet from "./phone-auth-sheet";
import { useUserStore } from "@/stores/user.store";
import { getUserInfo } from "zmp-sdk/apis";
import { eventService } from "@/services/event/event.api";

/**
 * UserGate — guards the whole app.
 *
 * Logic:
 * 1. On mount, silently grab the Zalo user ID (no permission needed).
 * 2. If stored phone exists → check /customer once to confirm registration is
 *    still valid. If valid, let through immediately without any sheet.
 * 3. If no stored phone AND never asked before → show PhoneAuthSheet once.
 * 4. After user registers or dismisses → mark authAsked = true (never show again).
 */
export default function UserGate({ children }: { children: ReactNode }) {
  const user = useUserStore((s) => s.user);
  const authAsked = useUserStore((s) => s.authAsked);
  const setZaloUserId = useUserStore((s) => s.setZaloUserId);
  const markAuthAsked = useUserStore((s) => s.markAuthAsked);
  const setUp = useUserStore((s) => s.setUp);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    // Always try to get Zalo user ID silently
    getUserInfo({ avatarType: "normal" })
      .then(({ userInfo }) => {
        if (userInfo?.id) setZaloUserId(userInfo.id);
      })
      .catch(() => {});

    // If we have a stored phone, verify with backend once (silent, no blocking)
    const storedPhone = useUserStore.getState().user?.phone;
    if (storedPhone) {
      eventService
        .getCustomer(storedPhone)
        .then((customer) => {
          // Refresh name/email/company from backend in case it changed
          const cur = useUserStore.getState().user;
          if (cur) {
            setUp({
              ...cur,
              name: customer.name || cur.name,
              email: customer.email ?? cur.email,
              company: customer.company ?? cur.company,
              id: String(customer.attendee_id),
            });
          }
        })
        .catch(() => {
          // Backend unreachable or customer not found — still let through
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Already has phone → app is ready
  if (user?.phone) {
    return <>{children}</>;
  }

  // Already dismissed once → let through without blocking
  if (authAsked) {
    return <>{children}</>;
  }

  // First open, no phone — show auth sheet
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="text-small text-text-secondary">
          Đang chuẩn bị sự kiện...
        </div>
      </div>
      <PhoneAuthSheet
        visible={!user?.phone && !authAsked}
        onDismiss={markAuthAsked}
      />
    </div>
  );
}
