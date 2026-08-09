import { useNavigate } from "react-router-dom";
import { Avatar, Text } from "zmp-ui";
import { copy } from "@/constants/copy";
import { useCustomer } from "@/services/event/event.queries";
import { useUserStore } from "@/stores/user.store";
import {
  ChevronRightIcon,
  ProfileUserIcon,
  TicketIcon,
  VoucherIcon,
} from "@/components/common/vectors";

interface MenuItem {
  id: string;
  label: string;
  icon: JSX.Element;
  path: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const phone = user?.phone ?? "";
  const { data: customer } = useCustomer(phone || undefined);

  const displayName = user?.name || customer?.name || "Khách tham dự";
  const displayEmail = customer?.email || user?.email || "";
  const displayCompany = customer?.company || user?.company || "";

  const menuItems: MenuItem[] = [
    {
      id: "1",
      label: copy.profile.personalProfile,
      icon: <ProfileUserIcon className="h-6 w-6" />,
      path: "/profile/personal-info",
    },
    {
      id: "2",
      label: copy.profile.vouchers,
      icon: <VoucherIcon className="h-6 w-6" />,
      path: "/profile/vouchers",
    },
    {
      id: "3",
      label: copy.event.myTicket,
      icon: <TicketIcon className="h-6 w-6" />,
      path: "/ticket",
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-full flex-col bg-elevation-01">
      <div className="px-4 py-6">
        <div className="flex flex-col items-center gap-3">
          <Avatar
            src={user?.avatar || undefined}
            size={80}
            className="mb-1"
          >
            {displayName?.[0]?.toUpperCase() || "K"}
          </Avatar>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="text-xlarge-m text-text-primary">{displayName}</div>
            {displayEmail && (
              <div className="text-xxsmall text-text-secondary">
                {displayEmail}
              </div>
            )}
            {displayCompany && (
              <div className="text-xxsmall text-text-tertiary">
                {displayCompany}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-3.5 mt-3 flex flex-col gap-6 rounded-lg bg-white p-5">
        {menuItems.map((item: MenuItem) => {
          return (
            <div
              className="flex items-center justify-between"
              onClick={() => handleMenuClick(item.path)}
              key={item.id}
            >
              <div className="flex items-center gap-2 text-small">
                <div>{item.icon}</div>
                <div>{item.label}</div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-text-disabled" />
            </div>
          );
        })}
      </div>
    </div>
  );
}