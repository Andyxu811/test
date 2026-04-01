"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, NotebookPen, Search, Send, Sparkles, Users } from "lucide-react";

import { StudentCard } from "@/components/coach/student-card";

type DashboardProps = {
  coachName: string;
  stats: {
    studentCount: number;
    activeCount: number;
    totalSessions: number;
    draftCount: number;
  };
  students: Array<{
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
  }>;
  flash?: {
    createdName?: string;
    createdAccount?: string;
    createdPassword?: string;
    savedDraft?: string;
    published?: string;
    updated?: string;
  };
};

const tabs = ["全部", "我的学员", "已归档"] as const;

export function StudentsDashboard({ coachName, stats, students, flash }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("全部");
  const [query, setQuery] = useState("");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesQuery =
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.nickname?.toLowerCase().includes(query.toLowerCase());

      const matchesTab =
        activeTab === "全部"
          ? true
          : activeTab === "我的学员"
            ? student.status !== "ARCHIVED"
            : student.status === "ARCHIVED";

      return matchesQuery && matchesTab;
    });
  }, [activeTab, query, students]);

  return (
    <div className="space-y-6">
      <section className="brand-gradient overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_24px_64px_rgba(23,63,46,0.18)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
              Coach Workspace
            </div>
            <div>
              <h1 className="font-display text-4xl font-extrabold">学员管理</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/76">
                欢迎回来，{coachName}。这一版只围绕最小闭环展开：建档、录入训练、发布给学员查看。
              </p>
            </div>
          </div>
          <Link
            href="/coach/students/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-brand transition hover:bg-[#c79f2c]"
          >
            <NotebookPen className="h-4 w-4" />
            新增学员
          </Link>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/12 bg-white/8 p-4 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <GraduationCap className="h-4 w-4 text-accent" />
                新增学员
              </div>
              <p className="mt-2 text-xs leading-6 text-white/70">
                建立基础档案，并自动生成一个学员端演示账号。
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <NotebookPen className="h-4 w-4 text-accent" />
                录入训练
              </div>
              <p className="mt-2 text-xs leading-6 text-white/70">
                每位学员只保留一条草稿入口，避免重复创建未完成记录。
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Send className="h-4 w-4 text-accent" />
                学员查看
              </div>
              <p className="mt-2 text-xs leading-6 text-white/70">
                发布后自动同步到学员端首页速览和训练详情，只读不可编辑。
              </p>
            </div>
          </div>
        </div>
      </section>

      {flash?.createdAccount ? (
        <div className="panel-card rounded-[1.5rem] border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <div className="font-semibold">学员建档成功</div>
          <p className="mt-2 leading-7">
            {flash.createdName} 已创建默认学员端账号，账号为{" "}
            <span className="rounded bg-white px-2 py-1 font-semibold">{flash.createdAccount}</span>
            ，默认密码为{" "}
            <span className="rounded bg-white px-2 py-1 font-semibold">{flash.createdPassword}</span>
            。
          </p>
        </div>
      ) : null}

      {flash?.savedDraft ? (
        <div className="panel-card rounded-[1.5rem] border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          已为 {flash.savedDraft} 保存训练草稿，学员端暂不可见。
        </div>
      ) : null}

      {flash?.published ? (
        <div className="panel-card rounded-[1.5rem] border-sky-200 bg-sky-50 p-5 text-sm text-sky-800">
          已发布 {flash.published} 的训练反馈，学员端首页和训练页已同步更新。
        </div>
      ) : null}

      {flash?.updated ? (
        <div className="panel-card rounded-[1.5rem] border-brand/15 bg-brand/5 p-5 text-sm text-brand">
          学员档案已更新。
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "学员总数", value: stats.studentCount, icon: Users },
          { label: "进行中", value: stats.activeCount, icon: Sparkles },
          { label: "总课次", value: stats.totalSessions, icon: NotebookPen },
          { label: "未发布草稿", value: stats.draftCount, icon: Send },
        ].map((item) => (
          <div key={item.label} className="panel-card rounded-[1.5rem] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/8 text-brand">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-3xl font-bold text-brand">{item.value}</div>
                <div className="text-sm text-muted">{item.label}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="panel-card rounded-[1.75rem] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索学员姓名或昵称"
              className="w-full rounded-2xl border border-line bg-surface-muted px-12 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-accent text-brand"
                    : "bg-brand/6 text-brand/75 hover:bg-brand/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-card rounded-[1.75rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand">教练工作流程</h2>
            <p className="mt-1 text-sm text-muted">本阶段只保留必要动作，避免流程发散。</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            "新增或编辑学员档案",
            "新建训练记录并保存草稿",
            "完善训练反馈与教练点评",
            "发布后由学员端只读查看",
          ].map((text, index) => (
            <div
              key={text}
              className="rounded-[1.25rem] bg-surface-muted px-4 py-4 text-sm font-medium text-brand"
            >
              <div className="mb-2 text-xs font-semibold tracking-[0.22em] text-brand/50 uppercase">
                Step {index + 1}
              </div>
              {text}
            </div>
          ))}
        </div>
      </section>

      {filteredStudents.length === 0 ? (
        <section className="panel-card rounded-[1.75rem] px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-brand">当前没有匹配学员</h2>
          <p className="mt-2 text-sm text-muted">
            {query ? "你可以换个关键词再试试。" : "点击右上角新增学员，开始建立试运行样本。"}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </section>
      )}
    </div>
  );
}
