import {
  Prisma,
  StudentStatus,
  TrainingRecordStatus,
  TrainingStage,
  UserRole,
} from "@prisma/client";

import { hashPassword } from "@/lib/auth/password";
import { stageLabels } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const studentListInclude = {
  primaryCoach: true,
  user: true,
  records: {
    orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }] as Prisma.TrainingRecordOrderByWithRelationInput[],
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
  },
} satisfies Prisma.StudentInclude;

function toStudentCardData(student: Prisma.StudentGetPayload<{ include: typeof studentListInclude }>) {
  const records = student.records;
  const publishedRecords = records.filter((record) => record.status === TrainingRecordStatus.PUBLISHED);
  const draftRecords = records.filter((record) => record.status === TrainingRecordStatus.DRAFT);
  const latestPublished = publishedRecords[0] ?? null;
  const latestDraft = draftRecords[0] ?? null;

  return {
    id: student.id,
    name: student.name,
    nickname: student.nickname,
    stage: student.stage,
    stageLabel: stageLabels[student.stage],
    primaryCoachName: student.primaryCoach.displayName,
    totalSessions: publishedRecords.length,
    latestSessionDate: latestPublished?.sessionDate ?? null,
    status: student.status,
    latestPublishedRecordId: latestPublished?.id ?? null,
    latestDraftRecordId: latestDraft?.id ?? null,
    hasDraft: Boolean(latestDraft),
    hasPublished: Boolean(latestPublished),
  };
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  if (user.passwordHash !== hashPassword(password)) {
    return null;
  }

  return user;
}

export async function getCoachStudentsDashboard(coachUserId: string) {
  const students = await prisma.student.findMany({
    where: {
      OR: [{ primaryCoachId: coachUserId }, { status: StudentStatus.ARCHIVED }],
    },
    include: studentListInclude,
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  const cards = students.map(toStudentCardData);
  const totalPublishedSessions = cards.reduce((sum, student) => sum + student.totalSessions, 0);
  const activeCount = cards.filter((student) => student.status === StudentStatus.ACTIVE).length;
  const pausedCount = cards.filter((student) => student.status === StudentStatus.PAUSED).length;
  const archivedCount = cards.filter((student) => student.status === StudentStatus.ARCHIVED).length;

  return {
    students: cards,
    summary: {
      totalStudents: cards.length,
      activeCount,
      pausedCount,
      archivedCount,
      totalPublishedSessions,
      pendingDraftCount: cards.filter((student) => student.hasDraft).length,
    },
  };
}

export async function getStudentForEdit(studentId: string, coachUserId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, primaryCoachId: coachUserId },
  });

  return student;
}

export async function getStudentTrainingDraft(studentId: string, coachUserId: string) {
  const student = await prisma.student.findFirst({
    where: { id: studentId, primaryCoachId: coachUserId },
    include: {
      primaryCoach: true,
      records: {
        where: { status: TrainingRecordStatus.DRAFT },
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          photos: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  const draft = student.records[0] ?? null;

  return {
    student: {
      id: student.id,
      name: student.name,
      stage: student.stage,
      stageLabel: stageLabels[student.stage],
      coachName: student.primaryCoach.displayName,
    },
    record: draft,
  };
}

export async function getTrainingRecordEditorData(recordId: string, coachUserId: string) {
  const record = await prisma.trainingRecord.findFirst({
    where: {
      id: recordId,
      coachId: coachUserId,
    },
    include: {
      student: {
        include: {
          primaryCoach: true,
        },
      },
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!record) {
    return null;
  }

  return {
    student: {
      id: record.student.id,
      name: record.student.name,
      stage: record.student.stage,
      stageLabel: stageLabels[record.student.stage],
      coachName: record.student.primaryCoach.displayName,
    },
    record,
  };
}

export async function getStudentHomeData(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      primaryCoach: true,
      records: {
        where: { status: TrainingRecordStatus.PUBLISHED },
        orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
  });

  if (!student) {
    return null;
  }

  return {
    student,
    latestRecord: student.records[0] ?? null,
  };
}

export async function getStudentTrainingDetail(recordId: string, userId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) return null;

  return prisma.trainingRecord.findFirst({
    where: {
      id: recordId,
      studentId: student.id,
      status: TrainingRecordStatus.PUBLISHED,
    },
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getStudentPhotosData(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      records: {
        where: { status: TrainingRecordStatus.PUBLISHED },
        orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
        take: 1,
        include: {
          photos: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  return {
    student,
    latestRecord: student.records[0] ?? null,
  };
}

export async function getStudentGrowthData(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      records: {
        where: { status: TrainingRecordStatus.PUBLISHED },
        orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!student) {
    return null;
  }

  return {
    student,
    records: student.records,
  };
}

export async function saveStudent(input: {
  coachUserId: string;
  studentId?: string;
  name: string;
  nickname?: string | null;
  gender?: string | null;
  age?: number | null;
  ageGroup?: string | null;
  trainingGoal?: string | null;
  notes?: string | null;
  stage: TrainingStage;
  stageStartedAt: Date;
  startedAt: Date;
  status: StudentStatus;
}) {
  const baseUserData = {
    name: input.name,
    passwordHash: hashPassword("student123"),
  };

  if (input.studentId) {
    return prisma.student.update({
      where: { id: input.studentId },
      data: {
        name: input.name,
        nickname: input.nickname,
        gender: input.gender,
        age: input.age,
        ageGroup: input.ageGroup,
        trainingGoal: input.trainingGoal,
        notes: input.notes,
        stage: input.stage,
        stageStartedAt: input.stageStartedAt,
        startedAt: input.startedAt,
        status: input.status,
        archivedAt: input.status === StudentStatus.ARCHIVED ? new Date() : null,
        user: {
          update: {
            name: input.name,
          },
        },
      },
    });
  }

  const normalizedEmailName = input.name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\w\u4e00-\u9fa5]/g, "");

  return prisma.student.create({
    data: {
      name: input.name,
      nickname: input.nickname,
      gender: input.gender,
      age: input.age,
      ageGroup: input.ageGroup,
      trainingGoal: input.trainingGoal,
      notes: input.notes,
      stage: input.stage,
      stageStartedAt: input.stageStartedAt,
      startedAt: input.startedAt,
      status: input.status,
      archivedAt: input.status === StudentStatus.ARCHIVED ? new Date() : null,
      primaryCoachId: input.coachUserId,
      user: {
        create: {
          ...baseUserData,
          role: UserRole.STUDENT,
          email: `student.${normalizedEmailName}.${Date.now()}@tennis.local`,
        },
      },
    },
  });
}
