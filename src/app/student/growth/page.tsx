import { UserRole } from "@prisma/client";
import { CalendarDays, Flag, NotebookPen, Sparkles, Target, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import { getStudentGrowthPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

function getSummaryItems(items: string[]) {
  return items.slice(0, 2);
}

export default async function StudentGrowthPage() {
  const session = await requireRole(UserRole.STUDENT);
  const growthPage = await getStudentGrowthPage(session.userId);

  if (!growthPage) {
    notFound();
  }

  const { student, timeline } = growthPage;

  return (
    <div className="pb-8">
      <section className="brand-gradient rounded-b-[2rem] px-5 pb-8 pt-6 text-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-white/72">
          Growth Track
        </div>
        <h1 className="mt-4 text-3xl font-bold">成长轨迹</h1>
        <p className="mt-3 text-sm leading-7 text-white/76">
          这里把已发布训练串成一条清晰时间线，帮助你看见阶段位置、训练重点和下一步方向。
        </p>
      </section>

      <div className="-mt-4 space-y-4 px-4">
        <section className="panel-card rounded-[1.75rem] p-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "总课次", value: `${student.totalSessions}`, icon: NotebookPen },
              { label: "训练月数", value: `${student.learningMonths}`, icon: CalendarDays },
              { label: "当前阶段", value: student.stageLabel, icon: TrendingUp },
            ].map((item) => (
              <article key={item.label} className="rounded-[1.35rem] bg-surface-muted p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-brand">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-bold leading-6 text-brand">{item.value}</div>
                <div className="mt-1 text-xs text-muted">{item.label}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card rounded-[1.75rem] overflow-hidden p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/8 text-brand">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand">当前阶段</h2>
              <p className="text-sm text-muted">当前阶段仍然读取学员档案里的阶段信息。</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(135deg,#143f2e,#265b43)] p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold tracking-[0.18em] text-white/65 uppercase">
                {student.stageLabel}
              </div>
              <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/80">
                阶段开始：{formatDate(student.stageStartedAt)}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/86">{student.stageFocus}</p>
          </div>
        </section>

        <section className="panel-card rounded-[1.75rem] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/8 text-brand">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand">训练时间轴</h2>
              <p className="text-sm text-muted">只展示已发布训练记录，按时间倒序排列。</p>
            </div>
          </div>

          {timeline.length > 0 ? (
            <div className="mt-5 space-y-4">
              {timeline.map((record) => (
                <article key={record.id} className="relative rounded-[1.5rem] border border-line bg-white p-4">
                  <div className="absolute left-4 top-5 h-[calc(100%-2rem)] w-px bg-brand/10" />
                  <div className="absolute left-[13px] top-5 h-3 w-3 rounded-full border-2 border-white bg-brand" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex rounded-full bg-brand/6 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-brand/70">
                        第{record.sessionIndex}次课
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-brand">{record.title}</h3>
                    </div>
                    <div className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-brand">
                      {formatDate(record.sessionDate)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 pl-4">
                    <section className="rounded-[1.25rem] bg-success-soft p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                        <Sparkles className="h-4 w-4" />
                        亮点摘要
                      </div>
                      <ul className="mt-2 space-y-2 text-sm leading-7 text-brand/82">
                        {getSummaryItems(record.highlights).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[1.25rem] bg-warning-soft p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                        <Target className="h-4 w-4" />
                        当前重点摘要
                      </div>
                      <ul className="mt-2 space-y-2 text-sm leading-7 text-brand/82">
                        {getSummaryItems(record.improvements).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-[1.25rem] bg-info-soft p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                        <CalendarDays className="h-4 w-4" />
                        下次训练重点摘要
                      </div>
                      <ul className="mt-2 space-y-2 text-sm leading-7 text-brand/82">
                        {getSummaryItems(record.nextFocus).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-line px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-brand">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="mt-4 text-base font-semibold text-brand">还没有已发布训练记录</div>
              <p className="mt-2 text-sm leading-7 text-muted">
                等教练发布第一条训练后，这里会开始形成成长时间轴。
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
