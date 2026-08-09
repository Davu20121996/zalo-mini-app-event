import { useNavigate } from "react-router-dom";
import { Button, Text } from "zmp-ui";
import Logo from "../common/logo";
import { BackIcon } from "../common/vectors";
import { copy, theme } from "@/constants/copy";

// Small company logo shown in the top-right of the brand header
function CompanyLogo() {
  return (
    <img
      src="https://smbplus.vn/wp-content/uploads/2023/02/logo-1.png"
      alt="SMB+"
      draggable={false}
      className="h-7 w-auto object-contain opacity-80"
    />
  );
}

interface HeaderProps {
  title?: string;
  back?: boolean;
  position?: "fixed" | "sticky" | "static" | "relative";
}

export default function Header({ title, back, position }: HeaderProps) {
  const navigate = useNavigate();

  const positionClass = position || (title ? "fixed" : "sticky");

  if (title) {
    return (
      <div
        className={`${positionClass} header-margin left-0 top-0 z-10 flex h-12 w-full items-center gap-2 bg-background px-4 py-2`}
        style={{ color: theme.colors.text.primary }}
      >
        {back && (
          <Button
            className="w-fit bg-transparent p-1 active:bg-transparent"
            type="neutral"
            size="small"
            fullWidth
            onClick={() => navigate(-1)}
          >
            <BackIcon className="text-header_title text-text-primary" />
          </Button>
        )}
        <div className="text-header_title">{title}</div>
      </div>
    );
  }

  return (
    <div
      className={`${positionClass} header-margin left-0 top-0 flex h-12 w-full items-center gap-1.5 px-4 py-2`}
    >
      <Logo />
      <div className="text-header_title text-primary">{copy.brand.name}</div>
      {/* Company small logo, right-aligned */}
      <div className="ml-auto">
        <CompanyLogo />
      </div>
    </div>
  );
}
