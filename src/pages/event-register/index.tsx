import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, Text, useSnackbar } from "zmp-ui";
import { useEventDetail, useRegister } from "@/services/event/event.queries";
import { useUserStore } from "@/stores/user.store";
import { RegisterRequest } from "@/types/event.types";
import { copy } from "@/constants/copy";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/event";
import { CalendarIcon, MapPinIcon } from "@/components/common/vectors";

const COMPANY_SIZE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "lt30", label: "Dưới 30 nhân viên" },
  { value: "30-50", label: "30 - 50 nhân viên" },
  { value: "50-200", label: "50 - 200 nhân viên" },
  { value: "gt200", label: "Trên 200 nhân viên" },
  { value: "organization", label: "Tổ chức / Doanh nghiệp lớn" },
];

export default function EventRegisterPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useUserStore((s) => s.user);
  const setUp = useUserStore((s) => s.setUp);
  const { openSnackbar } = useSnackbar();
  const { data: event, isLoading: eventLoading } = useEventDetail(id);
  const registerMutation = useRegister();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: "",
    company: "",
    tax_code: "",
    company_size: "",
    interested_products: "",
  });

  const updateField = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleRegister = async () => {
    if (loading) return;
    setError(null);

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Vui lòng nhập họ và tên (tối thiểu 2 ký tự).");
      return;
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) {
      setError("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Vui lòng nhập email công ty hợp lệ.");
      return;
    }
    if (!form.company.trim()) {
      setError("Vui lòng nhập tên công ty.");
      return;
    }
    if (!event) {
      setError("Không tìm thấy sự kiện. Vui lòng quay lại và thử lại.");
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterRequest = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        tax_code: form.tax_code.trim() || undefined,
        company_size: form.company_size || undefined,
        interested_products: form.interested_products.trim() || undefined,
        event_id: Number(event.id),
      };
      const result = await registerMutation.mutateAsync(payload);
      setUp({
        phone: result.phone,
        name: result.name,
        email: result.email ?? undefined,
        avatar: user?.avatar ?? "",
        id: String(result.attendee_id),
      });
      openSnackbar({
        text: copy.event.registerSuccess,
        type: "success",
      });
      navigate("/ticket", { replace: true });
    } catch (err) {
      setError(
        (err as Error)?.message ??
          "Đăng ký không thành công, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (eventLoading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-4">
        <div className="h-24 animate-pulse rounded-xl bg-neutral100" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-neutral100" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral100" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      {event && (
        <div className="mx-4 mt-4 flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm">
          <Text.Title size="normal" className="text-text-title">
            {event.name}
          </Text.Title>
          <div className="flex items-center gap-1.5 text-xxsmall text-text-secondary">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-1.5 text-xxsmall text-text-secondary">
              <MapPinIcon className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <Text.Title size="normal" className="text-text-title">
            {copy.event.registerInfo}
          </Text.Title>
          <Text size="small" className="text-text-secondary">
            Điền thông tin bên dưới để đăng ký tham dự sự kiện.
          </Text>
        </div>

        <FormField label="Họ và tên" required>
          <Input
            value={form.name}
            onChange={(e) => updateField("name")(e.target.value)}
            placeholder="Họ và tên"
            maxLength={255}
          />
        </FormField>
        <FormField label="Số điện thoại" required>
          <Input
            value={form.phone}
            onChange={(e) => updateField("phone")(e.target.value)}
            placeholder="Số điện thoại"
            type="number"
            maxLength={20}
          />
        </FormField>
        <FormField label="Email công ty" required>
          <Input
            value={form.email}
            onChange={(e) => updateField("email")(e.target.value)}
            placeholder="Email công ty"
            type="email"
            maxLength={255}
          />
        </FormField>
        <FormField label="Tên công ty" required>
          <Input
            value={form.company}
            onChange={(e) => updateField("company")(e.target.value)}
            placeholder="Tên công ty"
            maxLength={255}
          />
        </FormField>
        <FormField label="Mã số thuế (MST)" optional>
          <Input
            value={form.tax_code}
            onChange={(e) => updateField("tax_code")(e.target.value)}
            placeholder="Mã số thuế (MST)"
            maxLength={30}
          />
        </FormField>
        <FormField label={copy.event.companySize} optional>
          <div className="flex flex-wrap gap-2">
            {COMPANY_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xxsmall",
                  form.company_size === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-divider01 text-text-secondary",
                )}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    company_size: f.company_size === opt.value ? "" : opt.value,
                  }))
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label={copy.event.interestedProducts} optional>
          <Input
            value={form.interested_products}
            onChange={(e) => updateField("interested_products")(e.target.value)}
            placeholder="Ví dụ: ERP, CRM, HRM"
            maxLength={255}
          />
        </FormField>

        {error && (
          <div className="rounded-lg bg-red100 px-3 py-2 text-xxsmall text-red500">
            {error}
          </div>
        )}

        <Button
          fullWidth
          size="large"
          loading={loading}
          className={cn(
            "!h-13 !rounded-xl bg-primary text-white",
            !bodyFieldsValid(form) && "opacity-60",
          )}
          onClick={handleRegister}
        >
          Hoàn tất đăng ký
        </Button>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-small text-text-primary">
        <span>{label}</span>
        {required && <span className="text-red500">*</span>}
        {optional && (
          <span className="text-xxsmall text-text-tertiary">
            ({copy.event.optional})
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function bodyFieldsValid(form: {
  name: string;
  phone: string;
  email: string;
  company: string;
}) {
  return (
    form.name.trim().length >= 2 &&
    /^[0-9+\-\s()]{7,20}$/.test(form.phone.trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.company.trim().length > 0
  );
}
