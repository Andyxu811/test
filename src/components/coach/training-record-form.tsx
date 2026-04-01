"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Info,
  Save,
  Send,
  Sparkles,
  UserSquare2,
} from "lucide-react";

import { upsertTrainingRecordAction, type CoachFormState } from "@/app/coach/actions";
import { PhotoManager } from "@/components/coach/photo-manager";

type TrainingRecordFormProps = {
  mode: "create" | "edit";
  initialValues: {
    id?: string;
    studentId: string;
    studentName: string;
    coachName: string;
    sessionIndex: number;
    sessionDate: string;
    title: string;
    trainedToday: string;
    highlights: string;
    improvements: string;
    nextFocus: string;
    homework: string;
    coachComment: string;
    status: "DRAFT" | "PUBLISHED";
    photos: Array<{
      id?: string;
      url: string;
      usage: "MOMENT" | "COMPARE";
      focusLabel: string;
      compareGroupId: string;
      compareSide: "BEFORE" | "AFTER";
      sortOrder: number;
    }>;
  };
};

const initialState: CoachFormState = {};

function ActionButton({
  value,
  children,
}: {
  value: "draft" | "publish";
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="intent"
      value={value}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
        value === "draft"
          ? "bg-brand text-white hover:bg-brand-strong"
          : "bg-accent text-brand hover:bg-[#c79f2c]"
      }`}
    >
      {children}
    </button>
  );
}

function FieldHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="text-lg font-semibold leading-7 text-brand md:text-xl">{title}</div>
      {hint ? <div className="text-xs font-medium leading-5 text-muted/80">{hint}</div> : null}
    </div>
  );
}

export function TrainingRecordForm({ mode, initialValues }: TrainingRecordFormProps) {
  const [state, formAction] = useActionState(upsertTrainingRecordAction, initialState);

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="recordId" value={initialValues.id ?? ""} />
      <input type="hidden" name="studentId" value={initialValues.studentId} />
      <input type="hidden" name="studentName" value={initialValues.studentName} />
      <input type="hidden" name="sessionIndex" value={String(initialValues.sessionIndex)} />

      <section className="brand-gradient rounded-[2rem] p-6 text-white shadow-[0_24px_64px_rgba(23,63,46,0.18)]">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.25rem] border border-white/12 bg-white/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-white/65">
              <UserSquare2 className="h-4 w-4 text-accent" />
              学员
            </div>
            <div className="mt-2 text-lg font-bold">{initialValues.studentName}</div>
          </div>
          <div className="rounded-[1.25rem] border border-white/12 bg-white/10 p-4">
            <div className="text-xs font-semibold tracking-[0.22em] uppercase text-white/65">
              主教练
            </div>
            <div className="mt-2 text-lg font-bold">{initialValues.coachName}</div>
          </div>
          <div className="rounded-[1.25rem] border border-white/12 bg-white/10 p-4">
            <div className="text-xs font-semibold tracking-[0.22em] uppercase text-white/65">
              课次
            </div>
            <div className="mt-2 text-lg font-bold">第 {initialValues.sessionIndex} 次</div>
          </div>
          <label className="rounded-[1.25rem] border border-white/12 bg-white/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase text-white/65">
              <CalendarDays className="h-4 w-4 text-accent" />
              日期
            </div>
            <input
              name="sessionDate"
              type="date"
              defaultValue={initialValues.sessionDate}
              className="mt-2 w-full bg-transparent text-lg font-bold outline-none"
            />
          </label>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-white/12 bg-white/8 px-4 py-3 text-sm text-white/78">
          学员端训练详情页会以“来自 {initialValues.coachName} 的点评”作为核心反馈模块展示。
        </div>
      </section>

      <section className="panel-card rounded-[1.75rem] border-sky-200 bg-sky-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-sm leading-7 text-brand/82">
            <h2 className="font-semibold text-brand">首页摘要同步规则</h2>
            <p>今日亮点会同步到“本次亮点摘要”，需要提升会同步到“当前重点摘要”。</p>
            <p>下次训练重点会同步到“下次训练摘要”，课后作业会同步到“本周作业摘要”。</p>
          </div>
        </div>
      </section>

      <section className="panel-card rounded-[1.75rem] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-brand">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand">
              {mode === "create" ? "训练记录录入" : "继续编辑训练草稿"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              首页保持速览，完整反馈与教练点评集中在训练详情页展示。
            </p>
          </div>
        </div>

        {state.error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        <div className="grid gap-5">
          <label className="space-y-3">
            <FieldHeader title="本次训练主题" />
            <input
              name="title"
              defaultValue={initialValues.title}
              className="w-full rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              placeholder="例如：正手引拍 + 分腿垫步 + 盯球训练"
            />
          </label>

          <label className="space-y-3">
            <FieldHeader title="今天练了什么" />
            <textarea
              name="trainedToday"
              defaultValue={initialValues.trainedToday}
              rows={4}
              className="w-full rounded-[1.25rem] border border-line bg-surface-muted px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              placeholder={"每行一条，例如：\n正手引拍动作\n分腿垫步启动\n盯球专注力"}
            />
          </label>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="space-y-3">
              <FieldHeader title="今日亮点" hint="同步到学员首页速览" />
              <textarea
                name="highlights"
                defaultValue={initialValues.highlights}
                rows={4}
                className="w-full rounded-[1.25rem] border border-line bg-success-soft px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
                placeholder={"每行一条，例如：\n左右手一起完成引拍\n分腿垫步更充分"}
              />
            </label>
            <label className="space-y-3">
              <FieldHeader title="需要提升" hint="同步到学员首页速览" />
              <textarea
                name="improvements"
                defaultValue={initialValues.improvements}
                rows={4}
                className="w-full rounded-[1.25rem] border border-line bg-warning-soft px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
                placeholder={"每行一条，例如：\n击球后太快收拍\n右脚没有踩实"}
              />
            </label>
          </div>

          <label className="space-y-3">
            <FieldHeader title="下次训练重点" />
            <textarea
              name="nextFocus"
              defaultValue={initialValues.nextFocus}
              rows={4}
              className="w-full rounded-[1.25rem] border border-line bg-info-soft px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              placeholder={"每行一条，例如：\n右脚踩实再击球\n击球后往前送"}
            />
          </label>

          <label className="space-y-3">
            <FieldHeader title="课后作业" hint="同步到学员首页“本周作业摘要”" />
            <textarea
              name="homework"
              defaultValue={initialValues.homework}
              rows={3}
              className="w-full rounded-[1.25rem] border border-line bg-surface-muted px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              placeholder={"每行一条，例如：\n对镜完成 10 组正手引拍\n每组开始前先做分腿垫步"}
            />
          </label>

          <label className="space-y-3">
            <FieldHeader title="教练点评" hint="训练页会作为“来自教练”的核心模块展示" />
            <textarea
              name="coachComment"
              defaultValue={initialValues.coachComment}
              rows={5}
              className="w-full rounded-[1.25rem] border border-line bg-surface-muted px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
              placeholder="这里写完整的训练反馈与鼓励，学员端训练页会完整展示这段内容。"
            />
          </label>
        </div>
      </section>

      <PhotoManager initialPhotos={initialValues.photos} />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel-card rounded-[1.75rem] p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/8 text-brand">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-brand">阶段更新</h2>
              <p className="text-sm text-muted">当前版本简化规则</p>
            </div>
          </div>
          <p className="text-sm leading-7 text-brand/78">
            当前版本先不在训练录入页里做阶段晋升操作。学员阶段仍通过“编辑学员”维护，避免录入链路变复杂。
          </p>
        </div>
      </section>

      <section className="panel-card rounded-[1.75rem] border-sky-200 bg-[linear-gradient(135deg,#eef7ff,#f4fff9)] p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-brand">发布后同步去向提示</h2>
            <p className="mt-1 text-sm text-muted">学员会在以下位置看到本次录入内容。</p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-[1.25rem] border border-sky-200 bg-white p-4">
            <div className="text-sm font-semibold text-brand">学员首页</div>
            <ul className="mt-3 space-y-2 text-xs leading-6 text-brand/78">
              <li>• 本次亮点摘要</li>
              <li>• 当前重点摘要</li>
              <li>• 下次训练摘要</li>
              <li>• 本周作业摘要</li>
            </ul>
          </div>
          <div className="rounded-[1.25rem] border border-emerald-200 bg-white p-4">
            <div className="text-sm font-semibold text-brand">训练反馈页</div>
            <ul className="mt-3 space-y-2 text-xs leading-6 text-brand/78">
              <li>• 完整训练记录</li>
              <li>• 来自教练的点评反馈</li>
              <li>• 本次训练日期与课次信息</li>
            </ul>
          </div>
          <div className="rounded-[1.25rem] border border-amber-200 bg-white p-4">
            <div className="text-sm font-semibold text-brand">照片页 / 成长页</div>
            <ul className="mt-3 space-y-2 text-xs leading-6 text-brand/78">
              <li>• 动作对比与训练瞬间照片</li>
              <li>• 当前阶段卡片</li>
              <li>• 已发布训练时间轴</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/coach/students"
          className="rounded-2xl border border-line bg-white px-5 py-3 text-sm font-semibold text-brand transition hover:bg-surface-muted"
        >
          返回学员管理
        </Link>
        <div className="flex flex-wrap gap-3">
          <ActionButton value="draft">
            <Save className="h-4 w-4" />
            保存草稿
          </ActionButton>
          <ActionButton value="publish">
            <Send className="h-4 w-4" />
            发布给学员
          </ActionButton>
        </div>
      </section>
    </form>
  );
}
