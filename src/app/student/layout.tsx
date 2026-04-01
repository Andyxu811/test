import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { StudentBottomNav } from "@/components/student/student-bottom-nav";
import { getSession } from "@/lib/auth/session";

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session || session.role !== UserRole.STUDENT) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-app-pattern pb-24">
      <div className="mx-auto max-w-md px-4 py-6">{children}</div>
      <StudentBottomNav />
    </div>
  );
}
