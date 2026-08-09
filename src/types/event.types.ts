export type EventSummary = {
  id: number | string;
  name: string;
  slug: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  venue: string | null;
  zalo_url: string | null;
  fanpage_url: string | null;
  is_registered: boolean;
  event_url: string | null;
  hero_image?: string | null;
};

export type EventDetail = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  is_active: boolean;
  countdown_enabled: boolean;
  calendar_enabled: boolean;
  show_gallery: boolean;
  show_sponsors: boolean;
  show_tickets: boolean;
  meta_title: string | null;
  meta_description: string | null;
  favicon_url: string | null;
  og_image: string | null;
  zalo_url: string | null;
  fanpage_url: string | null;
  about_description: string | null;
  about_where: string | null;
  about_when: string | null;
  venue: string | null;
  pc_bg_image_url: string | null;
  mobile_bg_image_url: string | null;
  hero_image: string | null;
  mobile_hero_image: string | null;
  event_url: string | null;
  settings: Record<string, string | null>;
  key_benefits: Array<{
    icon: string;
    title: string;
    description: string;
    sort_order: number;
  }>;
  speakers: Array<Speaker>;
  schedules: Array<ScheduleItem>;
  venues: Array<Venue>;
  hotels: Array<Hotel>;
  galleries: Array<Gallery>;
  sponsors: Array<Sponsor>;
  faqs: Array<Faq>;
  amenities: Array<Amenity>;
  prices: Array<Price>;
};

export type Speaker = {
  id: number;
  name: string;
  role: string;
  company?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  description: string | null;
  full_description: string | null;
  photo_url: string | null;
  photo_thumb: string | null;
};

export type ScheduleItem = {
  id: number;
  title: string;
  subtitle: string | null;
  day_number: number | null;
  start_time: string;
  desc: string | null;
  speaker: {
    id: number;
    name: string;
    role: string;
    photo_url: string | null;
    photo_thumb: string | null;
  } | null;
};

export type Venue = {
  id: number;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  description: string | null;
  photos?: Array<{ url: string; thumbnail: string }>;
};

export type Hotel = {
  id: number;
  name: string;
  rating: number;
  address: string | null;
  description: string | null;
  photo_url: string | null;
  photo_thumb: string | null;
};

export type Gallery = {
  id: number;
  name: string;
  photos: Array<{ url: string; thumbnail: string }>;
};

export type Sponsor = {
  id: number;
  name: string;
  link: string | null;
  logo_url: string | null;
  logo_thumb: string | null;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
};

export type Amenity = {
  id: number;
  name: string;
};

export type Price = {
  id: number;
  name: string;
  price: string;
  amenity_ids: number[];
};

export type Customer = {
  attendee_id: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  tax_code: string | null;
  company_size: string | null;
  company_size_label: string | null;
  interested_products: string | null;
  ticket_type: string | null;
  status:
    | "pending"
    | "confirmed"
    | "rsvp_confirmed"
    | "attended"
    | "cancelled";
  status_label: string;
  qr: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  registered_at: string | null;
  event: {
    id: number;
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    venue: string;
  } | null;
  voucher: {
    id: number;
    code: string;
    name: string;
    type: string;
    value: number;
    discount_label: string;
    discount_amount: number | null;
    description: string | null;
    valid_until: string | null;
  } | null;
};

export type QrCheckin = {
  attendee_id: number;
  name: string;
  event_name: string;
  qr_code: string;
  qr_code_url: string;
  qr_png_base64: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
};

export type Voucher = {
  id: number;
  code: string;
  name: string;
  type: "discount_percent" | "discount_fixed" | "free_ticket" | "gift" | "priority_seat";
  type_label: string;
  value: number;
  discount_label: string;
  description: string | null;
  valid_from: string | null;
  valid_until: string | null;
  remaining_uses: number | null;
  is_available: boolean;
};

export type VouchersResponse = {
  current_voucher: Voucher | null;
  active_vouchers: Voucher[];
};

export type RegisterRequest = {
  phone: string;
  name: string;
  email?: string;
  company?: string;
  tax_code?: string;
  company_size?: string;
  interested_products?: string;
  ticket_type?: string;
  event_id?: number;
  zalo_user_id?: string;
};

export type UpdateCustomerRequest = {
  phone: string;
  name?: string;
  email?: string;
  company?: string;
  tax_code?: string;
  company_size?: string;
  interested_products?: string;
};

export type UpdateCustomerResponse = {
  attendee_id: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
};

export type ConfirmAttendanceResponse = {
  attendee_id: number;
  name: string;
  status: string;
  status_label: string;
  confirmed_at: string | null;
  event: {
    id: number;
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    venue: string;
  } | null;
  voucher: {
    id: number;
    code: string;
    name: string;
    discount_label: string;
  } | null;
};

export type RegisterResponse = {
  attendee_id: number;
  name: string;
  email?: string | null;
  phone: string;
  event: {
    id: number;
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    venue: string;
  };
  status: string;
  qr_code: string | null;
  qr_code_url: string | null;
};