import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { StudentForm } from "@/components/coach/student-form";
import { getSession } from "@/lib/auth/session";

export default async function NewStudentPage() {
  const session = await getSession();

  if (!session || session.role !== UserRole.COACH) {
    redirect("/login");
  }

  return <StudentForm mode="create" coachUserId={session.userId} />;
}
