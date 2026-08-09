import { copy } from "@/constants/copy";

const LOGO_URL = "https://smbplus.vn/wp-content/uploads/2023/02/logo-1.png";

export default function Logo() {
  return (
    <img
      src={LOGO_URL}
      alt={copy.brand.name}
      draggable={false}
      className="size-[22px] rounded-full"
    />
  );
}
