import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Text, useSnackbar } from "zmp-ui";
import { useCustomer, useUpdateCustomer } from "@/services/event/event.queries";
import { useUserStore } from "@/stores/user.store";
import { copy } from "@/constants/copy";
import { cn } from "@/utils/cn";

const COMPANY_SIZE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "lt30", label: "Dưới 30 nhân viên" },
  { value: "30-50", label: "30 - 50 nhân viên" },
  { value: "50-200", label: "50 - 200 nhân viên" },
  { value: "gt200", label: "Trên 200 nhân viên" },
  { value: "organization", label: "Tổ chức / Doanh nghiệp lớn" },
];

export default function PersonalInfoPage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const setUp = useUserStore((s) => s.setUp);
  const { openSnackbar } = useSnackbar();
  const phone = user?.phone ?? "";
  const { data: customer, isLoading } = useCustomer(phone || undefined);
  const updateMutation = useUpdateCustomer();

  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? (customer?.email as string) ?? "",
    company: user?.company ?? "",
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    setForm((f) => ({
      ...f,
      name: f.name || customer.name,
      phone: f.phone || customer.phone,
      email: f.email || customer.email || "",
      company: f.company || customer.company || "",
    }));
  }, [customer]);

  const updateField = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
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
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Vui lòng nhập email công ty hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const result = await updateMutation.mutateAsync({
        phone: form.phone.trim(),
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        company: form.company.trim() || undefined,
      });
      setUp({
        phone: result.phone,
        name: result.name,
        email: result.email ?? undefined,
        company: result.company ?? undefined,
        avatar: user?.avatar ?? "",
        id: user?.id,
      });
      openSnackbar({
        text: "Đã cập nhật thông tin!",
        type: "success",
      });
      navigate("/profile");
    } catch (err) {
      setError(
        (err as Error)?.message ??
          "Cập nhật không thành công, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-3 bg-background px-4 py-4">
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <Text.Title size="normal" className="text-text-title">
            {copy.event.registerInfo}
          </Text.Title>
          <Text size="small" className="text-text-secondary">
            Cập nhật thông tin của bạn để ban tổ chức liên hệ chính xác.
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
        <FormField label="Email công ty" optional>
          <Input
            value={form.email}
            onChange={(e) => updateField("email")(e.target.value)}
            placeholder="Email công ty"
            type="email"
            maxLength={255}
          />
        </FormField>
        <FormField label="Tên công ty" optional>
          <Input
            value={form.company}
            onChange={(e) => updateField("company")(e.target.value)}
            placeholder="Tên công ty"
            maxLength={255}
          />
        </FormField>

        {customer?.company_size && (
          <FormField label={copy.event.companySize} optional>
            <div className="flex flex-wrap gap-2">
              {COMPANY_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xxsmall",
                    customer.company_size === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-divider01 text-text-secondary",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FormField>
        )}

        {error && (
          <div className="rounded-lg bg-red100 px-3 py-2 text-xxsmall text-red500">
            {error}
          </div>
        )}

        <Button
          fullWidth
          size="large"
          loading={loading}
          className="!h-13 !rounded-xl bg-primary text-white"
          onClick={handleSave}
        >
          Lưu thông tin
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