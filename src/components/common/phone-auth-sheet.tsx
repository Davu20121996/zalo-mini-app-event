import { useState, type ReactNode } from "react";
import { Button, Input, Sheet, Text, useSnackbar } from "zmp-ui";
import {
  authorize,
  getAccessToken,
  getUserInfo,
  getPhoneNumber,
} from "zmp-sdk/apis";
import { useUserStore } from "@/stores/user.store";
import { useRegister } from "@/services/event/event.queries";
import { eventService } from "@/services/event/event.api";
import { RegisterRequest } from "@/types/event.types";
import { cn } from "@/utils/cn";

interface PhoneAuthSheetProps {
  visible: boolean;
  onDismiss?: () => void;
}

type View = "auth" | "form";

const COMPANY_SIZE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "lt30", label: "Dưới 30 nhân viên" },
  { value: "30-50", label: "30 - 50 nhân viên" },
  { value: "50-200", label: "50 - 200 nhân viên" },
  { value: "gt200", label: "Trên 200 nhân viên" },
  { value: "organization", label: "Tổ chức / Doanh nghiệp lớn" },
];

function normalizePhone(number: string): string {
  let s = number.replace(/[^\d]/g, "");
  if (s.length >= 11 && s.startsWith("84")) {
    s = "0" + s.slice(2);
  }
  return s;
}

export default function PhoneAuthSheet({ visible, onDismiss }: PhoneAuthSheetProps) {
  const setUp = useUserStore((s) => s.setUp);
  const setZaloUserId = useUserStore((s) => s.setZaloUserId);
  const { openSnackbar } = useSnackbar();
  const registerMutation = useRegister();

  const [view, setView] = useState<View>("auth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    tax_code: "",
    company_size: "",
    interested_products: "",
    zalo_user_id: "",
  });

  const updateField = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleAuthorize = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await authorize({
        scopes: ["scope.userInfo", "scope.userPhonenumber"],
      });
      const { userInfo } = await getUserInfo({ avatarType: "normal" });
      const { token } = await getPhoneNumber({});
      let phone = "";
      if (token) {
        try {
          const accessToken = await getAccessToken({});
          const resolved = await eventService.resolveZaloPhone(
            token,
            accessToken,
          );
          phone = normalizePhone(resolved.number ?? "");
        } catch {
          phone = "";
        }
      }
      // Save Zalo user ID to store
      if (userInfo?.id) {
        setZaloUserId(userInfo.id);
      }

      // Pre-fill form with Zalo data FIRST, then switch view in the same tick
      // so the form renders with values already populated — no empty flash.
      setForm({
        name: userInfo.name ?? "",
        phone: phone,
        email: "",
        company: "",
        tax_code: "",
        company_size: "",
        interested_products: "",
        zalo_user_id: userInfo?.id ?? "",
      });
      setView("form");

      if (phone) {
        openSnackbar({
          text: "Đã lấy số điện thoại từ Zalo.",
          type: "success",
        });
      }
    } catch (err) {
      // Even on error, switch to manual form so user can still fill in
      setView("form");
      setError((err as Error)?.message ?? null);
    } finally {
      setLoading(false);
    }
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
        zalo_user_id: form.zalo_user_id || undefined,
      };
      const result = await registerMutation.mutateAsync(payload);
      setUp({
        phone: result.phone,
        name: result.name,
        email: result.email ?? undefined,
        avatar: "",
        id: String(result.attendee_id),
        zalo_user_id: form.zalo_user_id || undefined,
      });
      openSnackbar({
        text: "Đăng ký sự kiện thành công!",
        type: "success",
      });
      onDismiss?.();
    } catch (err) {
      setError(
        (err as Error)?.message ??
          "Đăng ký không thành công, vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet visible={visible} autoHeight maskClosable={false}>
      {view === "auth" ? (
        <div className="flex flex-col items-center gap-4 px-6 py-8 pb-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PhoneIcon />
          </div>
          <div className="flex flex-col gap-1.5">
            <Text.Title size="normal" className="text-text-title">
              Đăng nhập để tham dự sự kiện
            </Text.Title>
            <Text size="small" className="text-text-secondary">
              Cần số điện thoại Zalo để kiểm tra tư cách tham dự và nhận QR
              check-in tại sự kiện.
            </Text>
          </div>
          {error && (
            <div className="w-full rounded-lg bg-red100 px-3 py-2 text-xxsmall text-red500">
              {error}
            </div>
          )}
          <div className="flex w-full flex-col gap-2.5 pt-2">
            <Button
              fullWidth
              size="large"
              loading={loading}
              disabled={!visible}
              className="!h-13 !rounded-xl bg-primary text-white"
              onClick={handleAuthorize}
            >
              Đồng ý lấy số điện thoại Zalo
            </Button>
            <Button
              fullWidth
              size="large"
              type="neutral"
              disabled={!visible || loading}
              className="!h-13 !rounded-xl bg-neutral400 text-text-primary"
              onClick={() => setView("form")}
            >
              Đăng ký thủ công
            </Button>
            {onDismiss && (
              <button
                type="button"
                disabled={loading}
                className="py-1 text-xxsmall text-text-secondary underline"
                onClick={onDismiss}
              >
                Bỏ qua, tôi sẽ đăng ký sau
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col bg-white">
          <div className="border-divider01 border-b px-6 py-4">
            <Text.Title size="normal" className="text-text-title">
              Thông tin đăng ký
            </Text.Title>
            <Text size="small" className="mt-1 text-text-secondary">
              Điền thông tin bên dưới để đăng ký tham dự sự kiện.
            </Text>
          </div>

          {/* Show pre-fill notice if name/phone came from Zalo */}
          {(form.name || form.phone) && (
            <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-blue100 px-3 py-2">
              <span className="text-xxsmall text-blue500">✓</span>
              <Text size="xxsmall" className="text-blue500">
                Đã điền sẵn tên và số điện thoại từ Zalo của bạn.
              </Text>
            </div>
          )}

          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto px-6 py-4">
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
                type="tel"
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
            <FormField label="Quy mô doanh nghiệp" optional>
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
                        company_size:
                          f.company_size === opt.value ? "" : opt.value,
                      }))
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Sản phẩm quan tâm" optional>
              <Input
                value={form.interested_products}
                onChange={(e) =>
                  updateField("interested_products")(e.target.value)
                }
                placeholder="Ví dụ: ERP, CRM, HRM"
                maxLength={255}
              />
            </FormField>

            {error && (
              <div className="rounded-lg bg-red100 px-3 py-2 text-xxsmall text-red500">
                {error}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 border-divider01 border-t px-6 py-4">
            <Button
              fullWidth
              size="large"
              loading={loading}
              disabled={!visible || loading}
              className={cn(
                "!h-13 !rounded-xl bg-primary text-white",
                !bodyFieldsValid(form) && "opacity-60",
              )}
              onClick={handleRegister}
            >
              Hoàn tất đăng ký
            </Button>
            <button
              type="button"
              disabled={loading}
              className="py-1 text-xxsmall text-text-secondary underline"
              onClick={() => {
                setView("auth");
                setError(null);
              }}
            >
              Quay lại đăng nhập bằng Zalo
            </button>
          </div>
        </div>
      )}
    </Sheet>
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
          <span className="text-xxsmall text-text-tertiary">(tùy chọn)</span>
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

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
      stroke="currentColor"
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}
