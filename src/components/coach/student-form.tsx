"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { PlayCircle, Save, UserRound, X } from "lucide-react";

import { upsertStudentAction, type CoachFormState } from "@/app/coach/actions";
import {
  STUDENT_STATUS_OPTIONS,
  TRAINING_STAGE_OPTIONS,
  TRAINING_STAGE_LABELS,
} from "@/lib/constants";

type StudentFormProps = {
  mode: "create" | "edit";
  coachName: string;
  initialValues: {
    id?: string;
    name: string;
    nickname: string;
    age: string;
    gender: string;
    ageGroup: string;
    trainingGoal: string;
    notes: string;
    startedAt: string;
    stageStartedAt: string;
    stage: keyof typeof TRAINING_STAGE_LABELS;
    status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  };
};

const initialState: CoachFormState = {};

function SubmitButton({
  value,
  children,
}: {
  value: "save" | "saveAndTrain";
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
        value === "save"
          ? "bg-brand text-white hover:bg-brand-strong"
          : "bg-accent text-brand hover:bg-[#c79f2c]"
      }`}
    >
      {children}
    </button>
  );
}

export function StudentForm({ mode, coachName, initialValues }: StudentFormProps) {
  const [state, formAction] = useActionState(upsertStudentAction, initialState);
  const [selectedStage, setSelectedStage] = useState(initialValues.stage);

  return (
    <form action={formAction} className="relative min-h-[calc(100vh-11rem)] overflow-hidden rounded-[2rem]">
      <input type="hidden" name="studentId" value={initialValues.id ?? ""} />
      <div className="absolute inset-0 bg-black/40 lg:block" />
      <div className="relative flex min-h-[calc(100vh-11rem)] justify-end">
        <div className="hidden flex-1 p-8 lg:flex lg:items-end">
          <div className="max-w-xl rounded-[2rem] border border-white/12 bg-white/10 p-6 text-brand backdrop-blur">
            <div className="text-sm font-semibold tracking-[0.22em] text-brand/45 uppercase">
              Student Drawer
            </div>
            <h2 className="mt-3 text-3xl font-bold">学员建档 / 编辑</h2>
            <p className="mt-3 text-sm leading-7 text-brand/78">
              这一版继续保持 Figma 的右侧抽屉交互语义。为了避免过度工程化，当前实现使用独立路由承载抽屉样式，但信息结构与操作优先级仍按抽屉设计收敛。
            </p>
          </div>
        </div>

        <section className="relative z-10 flex w-full max-w-2xl flex-col bg-white shadow-[0_30px_80px_rgba(18,53,36,0.25)]">
          <div className="brand-gradient sticky top-0 z-10 flex items-center justify-between px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-brand">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{mode === "create" ? "新增学员" : "编辑学员"}</h1>
                <p className="mt-1 text-xs text-white/70">当前教练：{coachName}</p>
              </div>
            </div>
            <Link
              href="/coach/students"
              className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="关闭抽屉"
            >
              <X className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {state.error ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {state.error}
              </div>
            ) : null}

            <div className="space-y-8">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-accent" />
                  <h2 className="text-lg font-bold text-brand">基础信息</h2>
                </div>

                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-brand">学员姓名</span>
                    <input
                      name="name"
                      defaultValue={initialValues.name}
                      className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      placeholder="请输入学员姓名"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-brand">昵称（选填）</span>
                    <input
                      name="nickname"
                      defaultValue={initialValues.nickname}
                      className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      placeholder="学员的昵称或小名"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-brand">年龄</span>
                      <input
                        name="age"
                        defaultValue={initialValues.age}
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                        placeholder="例如：8"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-brand">建档日期</span>
                      <input
                        name="startedAt"
                        type="date"
                        defaultValue={initialValues.startedAt}
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-accent" />
                  <h2 className="text-lg font-bold text-brand">当前阶段</h2>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {TRAINING_STAGE_OPTIONS.map((stage) => (
                    <label
                      key={stage.value}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        selectedStage === stage.value
                          ? "border-accent bg-accent text-brand"
                          : "border-line bg-white text-brand hover:border-brand/30"
                      }`}
                    >
                      <span>{stage.label}</span>
                      <input
                        type="radio"
                        name="stage"
                        value={stage.value}
                        defaultChecked={selectedStage === stage.value}
                        onChange={() => setSelectedStage(stage.value)}
                        className="h-4 w-4 accent-[var(--brand)]"
                      />
                    </label>
                  ))}
                </div>
                <label className="mt-4 block space-y-2">
                  <span className="text-sm font-semibold text-brand">当前阶段开始时间</span>
                  <input
                    name="stageStartedAt"
                    type="date"
                    defaultValue={initialValues.stageStartedAt}
                    className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                  />
                </label>
              </section>

              <section className="border-t border-line pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-brand/35" />
                  <h2 className="text-lg font-bold text-brand">更多信息（选填）</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-brand">性别</span>
                      <select
                        name="gender"
                        defaultValue={initialValues.gender}
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      >
                        <option value="">请选择</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                        <option value="其他">其他</option>
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-brand">年龄段</span>
                      <select
                        name="ageGroup"
                        defaultValue={initialValues.ageGroup}
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      >
                        <option value="">请选择</option>
                        <option value="6-8岁">6-8岁</option>
                        <option value="8-10岁">8-10岁</option>
                        <option value="10-12岁">10-12岁</option>
                        <option value="12-15岁">12-15岁</option>
                        <option value="15-18岁">15-18岁</option>
                      </select>
                    </label>
                  </div>

                  {mode === "edit" ? (
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-brand">学员状态</span>
                      <select
                        name="status"
                        defaultValue={initialValues.status}
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      >
                        {STUDENT_STATUS_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <input type="hidden" name="status" value={initialValues.status} />
                  )}

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-brand">训练目标</span>
                    <input
                      name="trainingGoal"
                      defaultValue={initialValues.trainingGoal}
                      className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      placeholder="例如：参加区级比赛、掌握基础技术"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-brand">备注</span>
                    <textarea
                      name="notes"
                      defaultValue={initialValues.notes}
                      rows={4}
                      className="w-full rounded-[1.25rem] border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
                      placeholder="特殊情况、注意事项等"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-[1.5rem] bg-accent-soft p-5 text-sm leading-7 text-brand/80">
                <div className="font-semibold text-brand">当前简化规则</div>
                <p className="mt-2">
                  学员端账号会自动生成，默认密码固定为
                  <span className="rounded bg-white px-2 py-1 font-semibold text-brand">student123</span>
                  。这一版暂不做头像上传与协作教练配置。
                </p>
              </section>
            </div>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-line bg-white p-4 shadow-[0_-12px_32px_rgba(23,63,46,0.08)]">
            <Link
              href="/coach/students"
              className="flex-1 rounded-2xl border border-line px-4 py-3 text-center text-sm font-semibold text-brand transition hover:bg-surface-muted"
            >
              取消
            </Link>
            <SubmitButton value="save">
              <Save className="h-4 w-4" />
              {mode === "create" ? "仅保存" : "保存"}
            </SubmitButton>
            {mode === "create" ? (
              <SubmitButton value="saveAndTrain">
                <PlayCircle className="h-4 w-4" />
                保存并开始训练
              </SubmitButton>
            ) : null}
          </div>
        </section>
      </div>
    </form>
  );
}
