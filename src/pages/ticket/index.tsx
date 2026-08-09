import { useNavigate } from "react-router-dom";
import { Button, Text, useSnackbar } from "zmp-ui";
import {
  useConfirmAttendance,
  useCustomer,
  useQrCheckin,
} from "@/services/event/event.queries";
import { useUserStore } from "@/stores/user.store";
import { useQueryClient } from "@tanstack/react-query";
import { GET_CUSTOMER_KEY, GET_QR_KEY } from "@/constants/api";
import { copy } from "@/constants/copy";
import { formatDate } from "@/utils/event";
import { TicketIcon, VoucherIcon } from "@/components/common/vectors";

export default function TicketPage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const { openSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const phone = user?.phone ?? "";

  const { data, isLoading, isError } = useQrCheckin(phone || undefined);
  const { data: customer, isFetching: customerFetching } = useCustomer(phone || undefined);
  const confirmMutation = useConfirmAttendance();

  // "Xác minh" — refresh both customer + QR from server
  const handleVerify = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [GET_CUSTOMER_KEY, phone] }),
      queryClient.invalidateQueries({ queryKey: [GET_QR_KEY, phone] }),
    ]);
    openSnackbar({ text: "Đã cập nhật thông tin vé.", type: "success" });
  };

  const handleConfirm = async () => {
    if (!phone || confirmMutation.isPending) return;
    try {
      await confirmMutation.mutateAsync(phone);
      // Refresh customer data after confirming
      queryClient.invalidateQueries({ queryKey: [GET_CUSTOMER_KEY, phone] });
      openSnackbar({ text: "Đã xác nhận tham dự sự kiện!", type: "success" });
    } catch (err) {
      openSnackbar({
        text: (err as Error)?.message ?? "Xác nhận không thành công.",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 px-8 py-16">
        <div className="h-40 w-40 animate-pulse rounded-2xl bg-neutral100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-neutral100" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <TicketIcon className="h-12 w-12 text-text-disabled" />
        <Text.Title size="normal" className="text-text-title">
          {copy.event.noTicket}
        </Text.Title>
        <Text size="small" className="text-text-secondary">
          {copy.event.noTicketHint}
        </Text>
        <Button
          className="!rounded-xl bg-primary text-white"
          onClick={() => navigate("/")}
        >
          {copy.event.backToHome}
        </Button>
      </div>
    );
  }

  const qrSrc = data.qr_png_base64
    ? data.qr_png_base64.startsWith("data:")
      ? data.qr_png_base64
      : `data:image/png;base64,${data.qr_png_base64}`
    : data.qr_code_url;

  const isPending = !customer || customer.status === "pending";

  const isConfirmed =
    customer?.status === "rsvp_confirmed" ||
    customer?.status === "attended" ||
    customer?.status === "confirmed";

  // Show confirm button only after admin has approved and not yet confirmed by user
  const showConfirmButton = !isPending && !isConfirmed;

  return (
    <div className="flex min-h-full flex-col gap-4 px-4 py-5">
      {/* Ticket card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8">
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xxsmall text-primary">
            {copy.event.ticket}
          </div>
          <div className="text-normal-sb text-text-title">{data.name}</div>
          <div className="text-xxsmall text-text-secondary">{data.event_name}</div>

          {/* Status badge */}
          {customer && (
            <div
              className={`rounded-full px-3 py-1 text-xxsmall ${
                isConfirmed
                  ? "bg-green100 text-green500"
                  : isPending
                    ? "bg-yellow100 text-warning"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {customer.status_label}
            </div>
          )}
        </div>

        {/* QR section — always render once we have data; show pending UI if still pending */}
        {isPending ? (
          <div className="flex flex-col items-center gap-4 border-divider01 border-t bg-yellow100 px-6 py-8 text-center">
            <PendingClockIcon className="h-10 w-10 text-warning" />
            <div>
              <Text size="small" className="font-medium text-warning">
                Đang chờ ban tổ chức xác nhận
              </Text>
              <Text size="xxsmall" className="mt-1 text-text-secondary">
                Sau khi được xác nhận, vé QR sẽ hiện ngay tại đây.
              </Text>
            </div>
            {/* Verify button — user taps to refresh status from server */}
            <Button
              fullWidth
              size="medium"
              loading={customerFetching}
              className="!rounded-xl border border-warning bg-white text-warning"
              type="neutral"
              onClick={handleVerify}
            >
              🔄 Xác minh trạng thái vé
            </Button>
          </div>
        ) : qrSrc ? (
          <div className="flex flex-col items-center gap-3 border-divider01 border-t bg-elevation-02 px-6 py-6">
            <img
              src={qrSrc}
              alt="QR-check-in"
              className="h-48 w-48 rounded-xl bg-white p-2 shadow-sm"
            />
            <Text size="small" className="text-text-secondary">
              {copy.event.qrHint}
            </Text>
            {/* Refresh button for convenience */}
            <button
              type="button"
              className="text-xxsmall text-text-secondary underline"
              onClick={handleVerify}
            >
              Làm mới vé
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 border-divider01 border-t bg-elevation-02 px-6 py-6">
            <Text size="small" className="text-text-secondary">
              {copy.event.customerNotFound}
            </Text>
          </div>
        )}

        {/* Info rows */}
        <div className="flex flex-col gap-2.5 border-divider01 border-t px-6 py-5">
          <Row
            label={copy.event.checkIn}
            value={data.checked_in ? copy.event.checkedIn : copy.event.notCheckedIn}
            positive={data.checked_in}
          />
          {data.checked_in_at && (
            <Row label={copy.event.registeredAt} value={formatDate(data.checked_in_at)} />
          )}
          {customer?.event && (
            <button
              type="button"
              className="flex items-center justify-between gap-3 py-1"
              onClick={() => navigate(`/event/${customer.event?.id}`)}
            >
              <span className="text-xxsmall text-text-secondary">{copy.event.viewEvent}</span>
              <span className="max-w-[60%] truncate text-xxsmall text-primary underline">
                {customer.event?.name}
              </span>
            </button>
          )}
        </div>

        {/* Confirm attendance button — shown after admin approves, before user confirms */}
        {showConfirmButton && (
          <div className="border-divider01 border-t px-6 py-4">
            <Button
              fullWidth
              size="large"
              loading={confirmMutation.isPending}
              className="!h-12 !rounded-xl bg-green500 text-white"
              onClick={handleConfirm}
            >
              ✅ Xác nhận tham dự sự kiện
            </Button>
            <Text size="small" className="mt-2 text-center text-xxsmall text-text-secondary">
              Vui lòng xác nhận để ban tổ chức chuẩn bị tốt nhất cho bạn.
            </Text>
          </div>
        )}
      </div>

      {/* Voucher — only show after ticket is confirmed/sent */}
      {customer?.voucher && !isPending && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-2 border-divider01 border-b px-5 py-4">
            <VoucherIcon className="h-5 w-5 text-primary" />
            <Text.Title size="normal" className="text-text-title">
              Voucher của bạn
            </Text.Title>
          </div>
          <div className="flex flex-col items-center gap-2 border-b-2 border-dashed border-divider01 bg-green100 px-5 py-6 text-center">
            <Text size="xxsmall" className="text-text-secondary">
              Mã voucher
            </Text>
            <Text.Title size="normal" className="tracking-[0.2em] text-green500">
              {customer.voucher.code}
            </Text.Title>
            <Text size="small" className="text-text-primary">
              {customer.voucher.discount_label}
            </Text>
            {customer.voucher.description && (
              <Text size="xxsmall" className="text-text-secondary">
                {customer.voucher.description}
              </Text>
            )}
            {customer.voucher.valid_until && (
              <Text size="xxsmall" className="text-text-secondary">
                Hạn sử dụng:{" "}
                {new Date(customer.voucher.valid_until.replace(" ", "T")).toLocaleDateString("vi-VN")}
              </Text>
            )}
          </div>
          <button
            type="button"
            className="w-full px-5 py-4 text-left"
            onClick={() => navigate("/profile/vouchers")}
          >
            <Text size="small" className="text-primary">
              Xem chi tiết voucher &gt;
            </Text>
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xxsmall text-text-secondary">{label}</span>
      <span className={positive ? "flex items-center gap-1 text-xxsmall text-green500" : "text-xxsmall text-text-primary"}>
        {positive && <CheckBadgeIcon className="h-4 w-4" />}
        {value}
      </span>
    </div>
  );
}

function CheckBadgeIcon(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PendingClockIcon(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
