"use client";

import Link from "next/link";
import { FileText, Home, ImageIcon, TrendingUp } from "lucide-react";
import { usePathname } from "next/navigation";

type StudentBottomNavProps = {
  latestRecordId: string | null;
};

export function StudentBottomNav({ latestRecordId }: StudentBottomNavProps) {
  const pathname = usePathname();

  const items = [
    { id: "home", label: "首页", href: "/student/home", icon: Home, disabled: false },
    {
      id: "training",
      label: "训练",
      href: latestRecordId ? `/student/training/${latestRecordId}` : "/student/home",
      icon: FileText,
      disabled: !latestRecordId,
    },
    { id: "photo", label: "照片", href: "/student/photos", icon: ImageIcon, disabled: false },
    { id: "growth", label: "成长", href: "/student/growth", icon: TrendingUp, disabled: false },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-line bg-white/95 px-4 pb-6 pt-3 backdrop-blur">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const active =
            item.id === "home"
              ? pathname === "/student/home"
              : item.id === "training"
                ? pathname.startsWith("/student/training")
                : item.id === "photo"
                  ? pathname.startsWith("/student/photos")
                  : pathname.startsWith("/student/growth");

          if (item.disabled) {
            return (
              <div
                key={item.id}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] text-muted opacity-55"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                active ? "bg-brand text-white" : "text-muted hover:bg-surface-muted"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
