import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { getStudentTrainingDraft } from "@/lib/data";
import { TrainingRecordForm } from "@/components/coach/training-record-form";

export default async function NewTrainingRecordPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await getSession();

  if (!session || session.role !== UserRole.COACH) {
    redirect("/login");
  }

  const editorData = await getStudentTrainingDraft(studentId, session.userId);
  if (!editorData) {
    redirect("/coach/students");
  }

  return <TrainingRecordForm mode="create" data={editorData} coachName={session.name} />;
}
