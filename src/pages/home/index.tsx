import { useNavigate } from "react-router-dom";
import { Avatar, Button, Text } from "zmp-ui";
import { useEvents } from "@/services/event/event.queries";
import { useCustomer } from "@/services/event/event.queries";
import { useUserStore } from "@/stores/user.store";
import { copy } from "@/constants/copy";
import { SparklesIcon } from "@/components/common/vectors";
import { resolveMedia } from "@/services/event/event.api";
import { formatDate } from "@/utils/event";
import { CalendarIcon, MapPinIcon } from "@/components/common/vectors";

export default function HomePage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const phone = user?.phone ?? "";

  // Fetch the active events list — API returns only active events sorted by start_date
  const { data: events, isLoading } = useEvents(phone || undefined);
  const { data: customer } = useCustomer(phone || undefined);

  // Use the first (and typically only) active event
  const event = events?.[0] ?? null;

  const isRegistered = event?.is_registered ?? false;

  const hero = resolveMedia((event as any)?.hero_image ?? null);

  return (
    <div className="flex min-h-full flex-col gap-5 pb-5">
      {/* Greeting */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              src={user?.avatar || undefined}
              size={44}
              className="border-2 border-white shadow-sm"
            >
              {user?.name?.[0]?.toUpperCase() || "K"}
            </Avatar>
            <div className="min-w-0">
              <Text className="!text-xxxxsmall text-text-secondary">
                {copy.event.goingToEvent}
              </Text>
              <Text.Title size="small" className="truncate text-text-primary">
                {user?.name || "Khách tham dự"}
              </Text.Title>
            </div>
          </div>
          <button
            type="button"
            aria-label="Vé của tôi"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm active:opacity-80"
            onClick={() => navigate("/ticket")}
          >
            <TicketBadgeIcon />
          </button>
        </div>
      </div>

      {/* Active event card */}
      {isLoading ? (
        <div className="mx-4 space-y-3">
          <div className="h-44 animate-pulse rounded-2xl bg-neutral100" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-neutral100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-neutral100" />
          <div className="h-12 animate-pulse rounded-xl bg-neutral100" />
        </div>
      ) : event ? (
        <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-md">
          {/* Hero image */}
          <div className="relative h-44 w-full overflow-hidden bg-neutral100">
            {hero ? (
              <img src={hero} alt={event.name} loading="eager" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <span className="text-xlarge-m text-primary">{event.name[0]}</span>
              </div>
            )}
            {isRegistered && (
              <div className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xxxxsmall-m text-white">
                Đã đăng ký
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 px-4 py-4">
            <Text.Title size="normal" className="text-text-title">
              {event.name}
            </Text.Title>
            <div className="flex items-center gap-1.5 text-xxsmall text-text-secondary">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-1.5 text-xxsmall text-text-secondary">
                <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            )}
            {event.description && (
              <Text size="small" className="mt-1 line-clamp-2 text-text-secondary">
                {event.description}
              </Text>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 border-divider01 border-t px-4 py-4">
            <Button
              fullWidth
              size="large"
              type="neutral"
              className="!h-11 !rounded-xl bg-neutral400 text-text-primary"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              Xem chi tiết
            </Button>
            {isRegistered ? (
              <Button
                fullWidth
                size="large"
                className="!h-11 !rounded-xl bg-green500 text-white"
                onClick={() => navigate("/ticket")}
              >
                🎫 Xem vé
              </Button>
            ) : (
              <Button
                fullWidth
                size="large"
                className="!h-11 !rounded-xl bg-primary text-white"
                onClick={() => navigate(`/event/${event.id}/register`)}
              >
                {copy.event.registerNow}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <SparklesIcon className="h-10 w-10 text-text-disabled" />
          <Text className="text-small text-text-secondary">{copy.event.empty}</Text>
        </div>
      )}

      {/* Registration status hint */}
      {customer && event && (
        <div className="mx-4 rounded-xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Text size="xxsmall" className="text-text-secondary">
                Trạng thái đăng ký
              </Text>
              <Text size="small-m" className="text-text-primary">
                {customer.status_label}
              </Text>
            </div>
            <button
              type="button"
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xxsmall text-primary"
              onClick={() => navigate("/ticket")}
            >
              Xem vé →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TicketBadgeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-12-9.75h15.75a1.5 1.5 0 010 3h-.75a1.5 1.5 0 000 3h.75a1.5 1.5 0 010 3H4.5a1.5 1.5 0 010-3h.75a1.5 1.5 0 000-3h-.75a1.5 1.5 0 010-3z" />
    </svg>
  );
}
