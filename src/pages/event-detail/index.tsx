import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Button } from "zmp-ui";
import { useEventDetail } from "@/services/event/event.queries";
import { useCustomer } from "@/services/event/event.queries";
import { resolveMedia } from "@/services/event/event.api";
import { copy } from "@/constants/copy";
import { formatTime } from "@/utils/event";
import {
  CalendarIcon,
  ChevronDownIcon,
  MapPinIcon,
} from "@/components/common/vectors";
import { EventDetail, ScheduleItem } from "@/types/event.types";
import { useUserStore } from "@/stores/user.store";

export default function EventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useUserStore((s) => s.user);
  const phone = user?.phone ?? "";
  const { data: event, isLoading } = useEventDetail(id);
  const { data: customer } = useCustomer(phone || undefined);

  // Check if this user is registered for this specific event
  const isRegistered =
    customer?.event != null &&
    String(customer.event.id) === String(id ?? "");

  const hero = useMemo(
    () => resolveMedia(event?.mobile_hero_image ?? event?.hero_image),
    [event],
  );

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 px-4 pt-4">
        <div className="h-56 animate-pulse rounded-2xl bg-neutral100" />
        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-neutral100" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral100" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-small text-text-secondary">
          {isLoading ? "Đang tải..." : "Không tìm thấy sự kiện"}
        </p>
        <Button onClick={() => navigate("/")}>Về trang chủ</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <HeroSection event={event} hero={hero} />

      <div className="flex flex-col gap-6 px-4 py-5">
        <AboutSection event={event} />

        {event.key_benefits?.length > 0 && (
          <Section title={copy.event.benefits}>
            <div className="flex flex-col gap-2">
              {event.key_benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl bg-white p-3.5 shadow-sm"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CheckBadgeIcon />
                  </div>
                  <div className="min-w-0">
                    <div className="text-small-m text-text-primary">
                      {b.title}
                    </div>
                    <div className="mt-1 text-xxsmall text-text-secondary">
                      {b.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {event.speakers?.length > 0 && (
          <Section title={copy.event.speakers}>
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {event.speakers.map((s) => (
                <div
                  key={s.id}
                  className="flex w-28 flex-shrink-0 flex-col items-center gap-2 rounded-xl bg-white p-3.5 text-center shadow-sm"
                >
                  <Avatar
                    src={resolveMedia(s.photo_thumb) ?? undefined}
                    size={56}
                    className="rounded-full"
                  >
                    {s.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <div className="w-full truncate text-small-m text-text-primary">
                    {s.name}
                  </div>
                  <div className="w-full truncate text-xxsmall text-text-secondary">
                    {s.role}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {event.schedules?.length > 0 && (
          <Section title={copy.event.schedule}>
            <ScheduleList schedules={event.schedules} />
          </Section>
        )}

        {event.venues?.length > 0 && (
          <Section title={copy.event.venue}>
            <VenueCard venue={event.venues[0]} />
          </Section>
        )}

        {event.hotels?.length > 0 && (
          <Section title={copy.event.hotels}>
            <div className="flex flex-col gap-2">
              {event.hotels.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                >
                  <img
                    src={resolveMedia(h.photo_thumb) ?? ""}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 rounded-lg bg-neutral100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-small-m text-text-primary">
                      {h.name}
                    </div>
                    <div className="truncate text-xxsmall text-text-secondary">
                      {h.description}
                    </div>
                  </div>
                  <span className="text-xxsmall text-warning">
                    {"★".repeat(h.rating)}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {event.show_gallery && event.galleries?.length > 0 && (
          <Section title={copy.event.gallery}>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
              {(event.galleries[0]?.photos ?? []).slice(0, 8).map((p, i) => (
                <img
                  key={i}
                  src={resolveMedia(p.thumbnail) ?? ""}
                  alt=""
                  loading="lazy"
                  className="h-20 w-20 flex-shrink-0 rounded-lg bg-neutral100 object-cover"
                />
              ))}
            </div>
          </Section>
        )}

        {event.show_sponsors && event.sponsors?.length > 0 && (
          <Section title={copy.event.sponsors}>
            <div className="flex flex-wrap gap-2.5">
              {event.sponsors.map((s) => (
                <div
                  key={s.id}
                  className="flex h-14 w-24 items-center justify-center rounded-lg bg-white p-2 shadow-sm"
                >
                  <img
                    src={resolveMedia(s.logo_thumb) ?? ""}
                    alt={s.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {event.faqs?.length > 0 && (
          <Section title={copy.event.faq}>
            <FaqList faqs={event.faqs} />
          </Section>
        )}

        {event.show_tickets && event.prices?.length > 0 && (
          <Section title={copy.event.prices}>
            <div className="flex flex-col gap-2">
              {event.prices.map((p) => (
                <PriceCard key={p.id} price={p} amenities={event.amenities} />
              ))}
            </div>
          </Section>
        )}

        <div className="pt-1">
          {isRegistered ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-green100 py-3.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-green500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-small-m text-green500">
                  Bạn đã đăng ký sự kiện này
                </span>
              </div>
              <Button
                fullWidth
                size="large"
                type="neutral"
                className="!h-13 !rounded-xl bg-neutral400 text-text-primary"
                onClick={() => navigate("/ticket")}
              >
                Xem vé của tôi
              </Button>
            </div>
          ) : (
            <Button
              fullWidth
              size="large"
              className="!h-13 !rounded-xl bg-primary text-white"
              onClick={() => navigate(`/event/${event.id}/register`)}
            >
              {copy.event.registerNow}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroSection({
  event,
  hero,
}: {
  event: EventDetail;
  hero: string | null;
}) {
  return (
    <div className="relative h-64 w-full overflow-hidden">
      {hero ? (
        <img
          src={hero}
          alt={event.name}
          loading="eager"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/70">
          <span className="text-[64px] font-bold text-white">
            {event.name[0]}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-xxsmall text-white/90">
          <CalendarIcon className="h-4 w-4" />
          <span className="font-medium">{eventDateLabel(event)}</span>
        </div>
        <h1 className="text-[22px] font-bold leading-snug text-white">
          {event.name}
        </h1>
        {event.venue && (
          <div className="mt-1 flex items-center gap-1.5 text-xxsmall text-white/80">
            <MapPinIcon className="h-4 w-4" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function eventDateLabel(event: EventDetail): string {
  const fmt = (v: string) =>
    new Date(v.replace(" ", "T")).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  if (!event.end_date || event.end_date === event.start_date) {
    return fmt(event.start_date);
  }
  return `${fmt(event.start_date)} - ${fmt(event.end_date)}`;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-large-m text-text-title">{title}</h2>
      {children}
    </section>
  );
}

function AboutSection({ event }: { event: EventDetail }) {
  const description = event.about_description;
  const where = event.about_where ?? event.venue;
  const when = event.about_when;

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-large-m text-text-title">{copy.event.about}</h2>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        {description ? (
          <p className="whitespace-pre-line text-small text-text-primary">
            {description}
          </p>
        ) : (
          <p className="text-small text-text-secondary">
            {event.description ?? "Thông tin sự kiện đang được cập nhật."}
          </p>
        )}
        {(where || when) && (
          <div className="mt-3 flex flex-col gap-2 border-divider01 border-t pt-3">
            {where && (
              <div className="flex items-start gap-2 text-xxsmall text-text-secondary">
                <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>{where}</span>
              </div>
            )}
            {when && (
              <div className="flex items-start gap-2 text-xxsmall text-text-secondary">
                <CalendarIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>{when}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ScheduleList({ schedules }: { schedules: ScheduleItem[] }) {
  const [openDay, setOpenDay] = useState(-1);

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    schedules.forEach((s) => {
      const key = s.day_number ? `Ngày ${s.day_number}` : "Diễn chính";
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return Array.from(map.entries());
  }, [schedules]);

  return (
    <div className="flex flex-col gap-2">
      {grouped.map(([day, list], i) => {
        const isOpen = openDay === i;
        return (
          <div
            key={day}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-4 py-3"
              onClick={() => setOpenDay(isOpen ? -1 : i)}
            >
              <span className="text-small-m text-text-title">{day}</span>
              <ChevronDownIcon
                className={`h-4 w-4 text-text-secondary transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="flex flex-col">
                {list.map((s) => (
                  <div
                    key={s.id}
                    className="flex gap-3 border-divider01 border-t px-4 py-3"
                  >
                    <div className="w-12 flex-shrink-0 pt-0.5 text-xxsmall-m text-primary">
                      {formatTime(s.start_time)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-small-m text-text-title">
                        {s.title}
                      </div>
                      {s.subtitle && (
                        <div className="mt-0.5 text-xxsmall text-text-secondary">
                          {s.subtitle}
                        </div>
                      )}
                      {s.speaker && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Avatar
                            src={
                              resolveMedia(s.speaker.photo_thumb) ?? undefined
                            }
                            size={20}
                            className="rounded-full"
                          >
                            {s.speaker.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <span className="text-xxsmall text-text-secondary">
                            {s.speaker.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VenueCard({ venue }: { venue: EventDetail["venues"][number] }) {
  const img = venue.photos?.[0]?.thumbnail
    ? resolveMedia(venue.photos[0].thumbnail)
    : null;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      {img && (
        <img
          src={img}
          alt=""
          loading="lazy"
          className="h-36 w-full object-cover"
        />
      )}
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-2 text-small-m text-text-title">
          <MapPinIcon className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="line-clamp-1">{venue.name}</span>
        </div>
        {venue.address && (
          <div className="text-xxsmall text-text-secondary">
            {venue.address}
          </div>
        )}
        {venue.description && (
          <p className="mt-1 text-xxsmall text-text-secondary">
            {venue.description}
          </p>
        )}
      </div>
    </div>
  );
}

function FaqList({ faqs }: { faqs: EventDetail["faqs"] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-2">
      {faqs.map((f) => {
        const isOpen = openId === f.id;
        return (
          <div
            key={f.id}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpenId(isOpen ? null : f.id)}
            >
              <span className="flex-1 pr-2 text-small-m text-text-title">
                {f.question}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 flex-shrink-0 text-text-secondary transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <p className="border-divider01 border-t px-4 py-3 text-small text-text-secondary">
                {f.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PriceCard({
  price,
  amenities,
}: {
  price: EventDetail["prices"][number];
  amenities: EventDetail["amenities"];
}) {
  const included = amenities.filter((a) => price.amenity_ids?.includes(a.id));
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-normal-sb text-text-title">{price.name}</div>
        <div className="text-large-sb text-primary">
          {Number(price.price) > 0
            ? `${Number(price.price).toLocaleString("vi-VN")}₫`
            : "Liên hệ"}
        </div>
      </div>
      {included.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {included.map((a) => (
            <span
              key={a.id}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-xxsmall text-primary"
            >
              {a.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckBadgeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
