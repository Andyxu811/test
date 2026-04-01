"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Edit3, FileText, Plus, UserRound } from "lucide-react";

import { STAGE_SURFACES, STATUS_SURFACES } from "@/lib/constants";

type CoachStudentCardProps = {
  student: {
    id: string;
    name: string;
    nickname: string | null;
    stage: "INTRO_ASSESSMENT" | "FOREHAND_FOUNDATION" | "FOREHAND_STABILITY" | "COMPREHENSIVE_UPGRADE";
    stageLabel: string;
    status: "ACTIVE" | "PAUSED" | "ARCHIVED";
    statusLabel: string;
    ageGroup: string | null;
    totalSessions: number;
    latestSessionDate: string;
    hasDraft: boolean;
    hasPublished: boolean;
    draftRecordId: string | null;
  };
};

export function StudentCard({ student }: CoachStudentCardProps) {
  const isArchived = student.status === "ARCHIVED";
  const isPaused = student.status === "PAUSED";
  const primaryActionHref =
    student.hasDraft && student.draftRecordId
      ? `/coach/records/${student.draftRecordId}/edit`
      : `/coach/students/${student.id}/records/new`;

  return (
    <article className="panel-card overflow-hidden rounded-[1.75rem]">
      <div className="brand-gradient flex items-start justify-between p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-brand shadow-lg">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{student.name}</h3>
            {student.nickname ? (
              <p className="mt-1 text-xs text-white/72">“{student.nickname}”</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${STATUS_SURFACES[student.status]}`}
          >
            {student.statusLabel}
          </span>
          {student.hasPublished ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              已发布
            </span>
          ) : null}
          {student.hasDraft ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
              <FileText className="h-3.5 w-3.5" />
              有未发布草稿
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className={`rounded-[1.25rem] p-4 ring-1 ${STAGE_SURFACES[student.stage]}`}>
          <div className="text-xs font-semibold tracking-[0.2em] text-brand/60 uppercase">
            当前阶段
          </div>
          <div className="mt-2 text-base font-semibold text-brand">{student.stageLabel}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-[1.25rem] bg-surface-muted p-4 text-sm text-brand">
          <div>
            <div className="text-xs text-muted">年龄段</div>
            <div className="mt-1 font-semibold">{student.ageGroup ?? "未设置"}</div>
          </div>
          <div>
            <div className="text-xs text-muted">总课次</div>
            <div className="mt-1 font-semibold">{student.totalSessions} 次</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-muted">最近训练</div>
            <div className="mt-1 font-semibold">
              {student.latestSessionDate === "-" ? "暂无训练记录" : student.latestSessionDate}
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          {isArchived ? (
            <span className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm font-semibold text-muted">
              已归档
            </span>
          ) : (
            <Link
              href={primaryActionHref}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isPaused && !student.hasDraft
                  ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                  : "bg-accent text-brand hover:bg-[#c79f2c]"
              }`}
            >
              {student.hasDraft ? (
                <FileText className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {student.hasDraft ? "继续录入草稿" : isPaused ? "补录训练" : "新建训练"}
            </Link>
          )}
          <Link
            href={`/coach/students/${student.id}/edit`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-brand transition hover:bg-surface-muted"
          >
            <Edit3 className="h-4 w-4" />
            编辑学员
          </Link>
          <span className="flex items-center justify-center rounded-2xl bg-brand/6 px-4 py-3 text-xs font-medium text-brand/65">
            学员端只读查看
          </span>
        </div>

        {isPaused && !student.hasDraft ? (
          <div className="rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">暂停训练规则</div>
                <p className="mt-1 text-xs leading-6">
                  当前学员处于暂停状态，仍可补录训练记录；只有再次发布后，学员端才会看到新的内容。
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {isArchived ? (
          <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div className="font-semibold">归档规则</div>
                <p className="mt-1 text-xs leading-6">
                  归档学员只保留历史记录查看与档案编辑，本阶段不继续新增训练记录。
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
