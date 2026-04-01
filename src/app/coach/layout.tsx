import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

export default async function CoachLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session || session.role !== UserRole.COACH) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-app-pattern">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
