import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { StudentsDashboard } from "@/components/coach/students-dashboard";
import { getSession } from "@/lib/auth/session";
import { getCoachStudentsDashboard } from "@/lib/data";

export default async function CoachStudentsPage() {
  const session = await getSession();

  if (!session || session.role !== UserRole.COACH) {
    redirect("/login");
  }

  const dashboard = await getCoachStudentsDashboard(session.userId);

  return <StudentsDashboard coachName={session.name} dashboard={dashboard} />;
}
