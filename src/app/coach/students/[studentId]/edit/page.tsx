import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { getStudentForEdit } from "@/lib/data";
import { StudentForm } from "@/components/coach/student-form";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await getSession();

  if (!session || session.role !== UserRole.COACH) {
    redirect("/login");
  }

  const student = await getStudentForEdit(studentId, session.userId);
  if (!student) {
    redirect("/coach/students");
  }

  return <StudentForm mode="edit" coachUserId={session.userId} initialValues={student} />;
}
