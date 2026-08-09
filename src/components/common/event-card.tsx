import { useNavigate } from "react-router-dom";
import { EventSummary } from "@/types/event.types";
import { resolveMedia } from "@/services/event/event.api";
import { formatDate } from "@/utils/event";
import { cn } from "@/utils/cn";

interface EventCardProps {
  event: EventSummary;
  featured?: boolean;
}

export default function EventCard({ event, featured }: EventCardProps) {
  const navigate = useNavigate();
  const hero = resolveMedia(event.hero_image);

  return (
    <button
      type="button"
      aria-label={`Xem sự kiện ${event.name}`}
      className={cn(
        "flex w-full flex-col items-stretch overflow-hidden rounded-xl bg-white text-left shadow-sm active:opacity-80",
        featured ? "shadow-md" : "",
      )}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-neutral100",
          featured ? "h-44" : "h-28",
        )}
      >
        {hero ? (
          <img
            src={hero}
            alt=""
            loading="lazy"
            className={cn(
              "h-full w-full object-cover",
              featured ? "h-full" : "",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-xlarge-m text-primary">{event.name[0]}</span>
          </div>
        )}
        {event.is_registered && (
          <div className="absolute right-2 top-2 rounded-full bg-primary px-2.5 py-1 text-xxxxsmall-m text-white">
            Đã đăng ký
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center gap-1.5 text-xxxxsmall text-text-secondary">
          <CalendarMiniIcon className="h-3 w-3" />
          <span>{formatDate(event.start_date)}</span>
          {event.venue && (
            <>
              <span>·</span>
              <span className="truncate">{event.venue}</span>
            </>
          )}
        </div>
        <div
          className={cn(
            "line-clamp-2 font-medium text-text-primary",
            featured ? "text-large-m" : "text-small-m",
          )}
        >
          {event.name}
        </div>
        {featured && (
          <div className="mt-1 flex items-center gap-1 text-small text-primary">
            <span className="text-primary">{featuredArrow}</span>
            <span className="font-medium">Xem chi tiết</span>
          </div>
        )}
      </div>
    </button>
  );
}

const featuredArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-3.5 w-3.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
    />
  </svg>
);

function CalendarMiniIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}