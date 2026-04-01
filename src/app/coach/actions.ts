"use server";

import { StudentStatus, TrainingRecordStatus, TrainingStage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveStudent } from "@/lib/data";

function parseDateField(value: FormDataEntryValue | null, fallback: Date) {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseOptionalString(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? raw : null;
}

function normalizeStatus(value: FormDataEntryValue | null) {
  const raw = String(value ?? StudentStatus.ACTIVE);
  return Object.values(StudentStatus).includes(raw as StudentStatus)
    ? (raw as StudentStatus)
    : StudentStatus.ACTIVE;
}

function normalizeStage(value: FormDataEntryValue | null) {
  const raw = String(value ?? TrainingStage.INTRO_ASSESSMENT);
  return Object.values(TrainingStage).includes(raw as TrainingStage)
    ? (raw as TrainingStage)
    : TrainingStage.INTRO_ASSESSMENT;
}

function splitAndNormalizeMultiline(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export async function saveStudentAction(formData: FormData) {
  const session = await requireRole("COACH");
  const studentId = parseOptionalString(formData.get("studentId"));

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("学员姓名不能为空。")
  }

  await saveStudent({
    coachUserId: session.userId,
    studentId: studentId ?? undefined,
    name,
    nickname: parseOptionalString(formData.get("nickname")),
    gender: parseOptionalString(formData.get("gender")),
    age: parseOptionalNumber(formData.get("age")),
    ageGroup: parseOptionalString(formData.get("ageGroup")),
    trainingGoal: parseOptionalString(formData.get("trainingGoal")),
    notes: parseOptionalString(formData.get("notes")),
    stage: normalizeStage(formData.get("stage")),
    stageStartedAt: parseDateField(formData.get("stageStartedAt"), new Date()),
    startedAt: parseDateField(formData.get("startedAt"), new Date()),
    status: normalizeStatus(formData.get("status")),
  });

  revalidatePath("/coach/students");
  redirect("/coach/students");
}

export async function saveTrainingRecordAction(formData: FormData) {
  const session = await requireRole("COACH");

  const recordId = parseOptionalString(formData.get("recordId"));
  const studentId = parseOptionalString(formData.get("studentId"));
  const intent = String(formData.get("intent") ?? "draft");
  const status = intent === "publish" ? TrainingRecordStatus.PUBLISHED : TrainingRecordStatus.DRAFT;

  if (!studentId) {
    throw new Error("缺少学员信息，无法保存训练记录。")
  }

  const title = String(formData.get("title") ?? "").trim();
  const trainedToday = splitAndNormalizeMultiline(formData.get("trainedToday"));
  const highlights = splitAndNormalizeMultiline(formData.get("highlights"));
  const improvements = splitAndNormalizeMultiline(formData.get("improvements"));
  const nextFocus = splitAndNormalizeMultiline(formData.get("nextFocus"));
  const coachComment = String(formData.get("coachComment") ?? "").trim();
  const homework = parseOptionalString(formData.get("homework"));

  if (!title || !trainedToday || !highlights || !improvements || !nextFocus || !coachComment) {
    throw new Error("请完整填写本次训练主题、训练内容、亮点、提升点、下次重点和教练点评。")
  }

  const sessionDate = parseDateField(formData.get("sessionDate"), new Date());
  const sessionIndex = Number(formData.get("sessionIndex") ?? 1);

  const photoItemsRaw = String(formData.get("photoItems") ?? "[]");
  let photoItems: Array<{
    url: string;
    caption?: string | null;
    usage?: "MOMENT" | "COMPARE";
    focusLabel?: string | null;
    compareGroupId?: string | null;
    compareSide?: "BEFORE" | "AFTER" | null;
    sortOrder?: number;
  }> = [];

  try {
    const parsed = JSON.parse(photoItemsRaw);
    if (Array.isArray(parsed)) {
      photoItems = parsed;
    }
  } catch {
    photoItems = [];
  }

  const normalizedPhotos = photoItems
    .filter((item) => typeof item.url === "string" && item.url.trim())
    .map((item, index) => ({
      url: item.url.trim(),
      caption: item.caption?.trim() || null,
      usage: item.usage === "COMPARE" ? "COMPARE" : "MOMENT",
      focusLabel: item.focusLabel?.trim() || null,
      compareGroupId: item.compareGroupId?.trim() || null,
      compareSide:
        item.compareSide === "BEFORE" || item.compareSide === "AFTER"
          ? item.compareSide
          : null,
      sortOrder: Number.isFinite(item.sortOrder) ? Number(item.sortOrder) : index,
    }));

  const data = {
    studentId,
    coachId: session.userId,
    sessionDate,
    sessionIndex,
    title,
    trainedToday,
    highlights,
    improvements,
    nextFocus,
    homework,
    coachComment,
    status,
    publishedAt: status === TrainingRecordStatus.PUBLISHED ? new Date() : null,
  };

  let savedRecordId: string;

  if (recordId) {
    const updated = await prisma.trainingRecord.update({
      where: { id: recordId },
      data: {
        ...data,
        photos: {
          deleteMany: {},
          create: normalizedPhotos,
        },
      },
    });

    savedRecordId = updated.id;
  } else {
    const created = await prisma.trainingRecord.create({
      data: {
        ...data,
        photos: {
          create: normalizedPhotos,
        },
      },
    });

    savedRecordId = created.id;
  }

  revalidatePath("/coach/students");
  revalidatePath(`/coach/records/${savedRecordId}/edit`);
  revalidatePath("/student/home");
  revalidatePath("/student/photos");
  revalidatePath("/student/growth");

  redirect("/coach/students");
}
