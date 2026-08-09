import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "zmp-ui";
import { useEvents } from "@/services/event/event.queries";
import { useUserStore } from "@/stores/user.store";
import { copy } from "@/constants/copy";
import { SparklesIcon } from "@/components/common/vectors";

/**
 * Events page — there is only one active event at a time.
 * Redirect straight to that event's detail page.
 * Show a loading/empty fallback while fetching.
 */
export default function EventsPage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const phone = user?.phone ?? "";
  const { data: events, isLoading } = useEvents(phone || undefined);

  const event = events?.[0] ?? null;

  // Auto-navigate to the active event detail once loaded
  useEffect(() => {
    if (event) {
      navigate(`/event/${event.id}`, { replace: true });
    }
  }, [event, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-8">
        <div className="h-44 animate-pulse rounded-2xl bg-neutral100" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-neutral100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral100" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-16 text-center">
        <SparklesIcon className="h-10 w-10 text-text-disabled" />
        <Text className="text-small text-text-secondary">{copy.event.empty}</Text>
      </div>
    );
  }

  // Fallback while redirect is in progress
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
