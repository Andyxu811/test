import Link from "next/link";
import { UserRole } from "@prisma/client";
import { ArrowRight, CalendarDays, NotebookPen, Sparkles, Target } from "lucide-react";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

import { requireRole } from "@/lib/auth/session";
import { getStudentPortalHome } from "@/lib/data";
import { formatDate } from "@/lib/format";

function SummaryCard({
  title,
  items,
  icon: Icon,
  tone,
  emptyText,
}: {
  title: string;
  items: string[];
  icon: ComponentType<{ className?: string }>;
  tone: "success" | "warning" | "info" | "neutral";
  emptyText: string;
}) {
  const toneClasses: Record<"success" | "warning" | "info" | "neutral", string> = {
    success: "bg-success-soft",
    warning: "bg-warning-soft",
    info: "bg-info-soft",
    neutral: "bg-white",
  };

  return (
    <section className={`panel-card rounded-[1.5rem] p-4 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-brand">{title}</h2>
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-7 text-brand/80">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted">{emptyText}</p>
      )}
    </section>
  );
}

export default async function StudentHomePage() {
  const session = await requireRole(UserRole.STUDENT);
  const home = await getStudentPortalHome(session.userId);

  if (!home) {
    notFound();
  }

  const { student, latestRecord } = home;

  return (
    <div className="pb-8">
      <section className="brand-gradient rounded-b-[2rem] px-5 pb-8 pt-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-brand shadow-lg">
            {student.name.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="mt-1 text-sm text-white/75">
              {student.age ? `${student.age}岁` : "年龄未设置"} · 学龄 {student.learningMonths} 个月
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-white/10 px-4 py-3 backdrop-blur">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
            当前训练阶段
          </div>
          <div className="mt-1 text-lg font-bold">{student.stageLabel}</div>
          <div className="mt-1 text-xs text-white/70">来自 {student.coachName} 的阶段判断</div>
        </div>
      </section>

      <div className="-mt-4 space-y-4 px-4">
        {latestRecord ? (
          <>
            <section className="panel-card rounded-[1.5rem] border-l-4 border-l-accent p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-brand/45 uppercase">
                    <CalendarDays className="h-4 w-4" />
                    最近训练
                  </div>
                  <div className="mt-2 text-lg font-bold text-brand">
                    {formatDate(latestRecord.sessionDate)}
                  </div>
                </div>
                <div className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-brand">
                  第{latestRecord.sessionIndex}次课
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">
                首页只保留最近一次训练摘要，完整反馈与教练点评请进入训练详情页查看。
              </p>
            </section>

            <Link
              href={`/student/training/${latestRecord.id}`}
              className="panel-card block rounded-[1.5rem] p-4 transition hover:-translate-y-0.5"
            >
              <div className="text-sm font-semibold text-brand/70">本次训练主题</div>
              <div className="mt-3 text-xl font-bold text-brand">{latestRecord.title}</div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span>查看完整反馈</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            <SummaryCard
              title="本次亮点摘要"
              items={latestRecord.highlights.slice(0, 3)}
              icon={Sparkles}
              tone="success"
              emptyText="本次训练暂未提炼亮点摘要。"
            />

            <SummaryCard
              title="当前重点摘要"
              items={latestRecord.improvements.slice(0, 3)}
              icon={Target}
              tone="warning"
              emptyText="当前还没有需要特别提醒的重点。"
            />

            <SummaryCard
              title="下次训练摘要"
              items={latestRecord.nextFocus.slice(0, 3)}
              icon={CalendarDays}
              tone="info"
              emptyText="下次训练重点会在这里更新。"
            />

            <SummaryCard
              title="本周作业摘要"
              items={latestRecord.homework.slice(0, 3)}
              icon={NotebookPen}
              tone="neutral"
              emptyText="这次训练暂未布置课后作业。"
            />
          </>
        ) : (
          <section className="panel-card rounded-[1.75rem] px-6 py-14 text-center">
            <h2 className="text-2xl font-bold text-brand">暂时还没有已发布训练</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              你的教练在发布第一条训练反馈后，这里会出现最近一次训练摘要。
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
