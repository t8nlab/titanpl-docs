import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";

type Variant = "info" | "warning" | "success";

type NoticeProps = {
  title?: string;
  variant?: Variant;
  children: React.ReactNode;
};

const VARIANT_STYLES: Record<
  Variant,
  {
    icon: React.ReactNode;
    container: string;
    iconWrap: string;
    iconColor: string;
  }
> = {
  info: {
    icon: <Info size={14} />,
    container: "border-zinc-800 bg-zinc-900/60",
    iconWrap: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  warning: {
    icon: <AlertTriangle size={14} />,
    container: "border-amber-900/40 bg-amber-950/30",
    iconWrap: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  success: {
    icon: <CheckCircle2 size={14} />,
    container: "border-emerald-900/40 bg-emerald-950/30",
    iconWrap: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
};

export default function Notice({
  title,
  variant = "info",
  children,
}: NoticeProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`w-full border px-4 py-3 ${styles.container}`}
    >
      <div className="flex items-start justify-center gap-1">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full ${styles.iconWrap} ${styles.iconColor}`}
        >
          {styles.icon}
        </div>

        <div className="space-y-1 text-sm text-zinc-300">
          {title && (
            <p className="font-medium text-zinc-100">
              {title}
            </p>
          )}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
