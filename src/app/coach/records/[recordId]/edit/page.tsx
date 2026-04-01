import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { getTrainingRecordEditorData } from "@/lib/data";
import { TrainingRecordForm } from "@/components/coach/training-record-form";

export default async function EditTrainingRecordPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const session = await getSession();

  if (!session || session.role !== UserRole.COACH) {
    redirect("/login");
  }

  const editorData = await getTrainingRecordEditorData(recordId, session.userId);
  if (!editorData) {
    redirect("/coach/students");
  }

  return <TrainingRecordForm mode="edit" data={editorData} coachName={session.name} />;
}
