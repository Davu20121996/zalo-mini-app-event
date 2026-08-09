import { Text } from "zmp-ui";
import { useVouchers } from "@/services/event/event.queries";
import { useUserStore } from "@/stores/user.store";
import { VoucherIcon } from "@/components/common/vectors";
import { formatDate } from "@/utils/event";

export default function VouchersPage() {
  const user = useUserStore((s) => s.user);
  const phone = user?.phone ?? "";
  const { data, isLoading } = useVouchers(phone || undefined);

  // Only show the voucher that belongs to this attendee (current_voucher),
  // not the global active_vouchers list which belongs to the event broadly.
  const current = data?.current_voucher ?? null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl bg-neutral100"
          />
        ))}
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <VoucherIcon className="h-12 w-12 text-text-disabled" />
        <Text.Title size="normal" className="text-text-title">
          Bạn chưa có voucher
        </Text.Title>
        <Text size="small" className="text-text-secondary">
          Khi ban tổ chức gửi voucher cho bạn, nó sẽ hiển thị ở đây.
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4">
          <VoucherIcon className="h-5 w-5 text-primary" />
          <Text.Title size="normal" className="text-text-title">
            Voucher của bạn
          </Text.Title>
        </div>

        {/* Main voucher code display */}
        <div className="flex flex-col items-center gap-2 border-y-2 border-dashed border-divider01 bg-green100 px-5 py-6 text-center">
          <Text size="xxsmall" className="text-text-secondary">
            Mã voucher
          </Text>
          <Text.Title size="normal" className="tracking-[0.2em] text-green500">
            {current.code}
          </Text.Title>
          <Text size="normal-sb" className="text-text-primary">
            {current.discount_label}
          </Text>
          {current.description && (
            <Text size="xxsmall" className="text-text-secondary">
              {current.description}
            </Text>
          )}
          <Text size="xxsmall" className="text-text-secondary">
            Hạn sử dụng:{" "}
            {current.valid_until
              ? formatDate(current.valid_until)
              : "Không giới hạn"}
          </Text>
        </div>

        {/* Type badge */}
        <div className="flex items-center justify-between gap-2 px-5 py-4">
          <Text size="xxsmall" className="text-text-secondary">
            Loại voucher
          </Text>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xxsmall text-primary">
            {current.type_label ?? current.type}
          </span>
        </div>

        <div className="border-divider01 border-t px-5 py-4">
          <Text size="xxsmall" className="text-text-secondary">
            Mã này dành riêng cho bạn — nhập khi mua hàng / đăng ký sự kiện để nhận ưu đãi.
          </Text>
        </div>
      </div>
    </div>
  );
}
