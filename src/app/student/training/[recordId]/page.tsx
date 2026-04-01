import { UserRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { getStudentTrainingDetail } from "@/lib/data";
import { formatDateDisplay } from "@/lib/format";

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function StudentTrainingDetailPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const session = await getSession();

  if (!session || session.role !== UserRole.STUDENT) {
    redirect("/login");
  }

  const record = await getStudentTrainingDetail(recordId, session.userId);
  if (!record) {
    notFound();
  }

  const highlightItems = splitLines(record.highlights);
  const improvementItems = splitLines(record.improvements);
  const nextFocusItems = splitLines(record.nextFocus);
  const trainedTodayItems = splitLines(record.trainedToday);

  return (
    <main className="space-y-4">
      <section className="rounded-[28px] bg-[var(--coach-green)] px-5 py-6 text-white card-shadow">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">Training Record</p>
        <h1 className="mt-3 text-2xl font-bold">训练反馈</h1>
        <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
          <p>{formatDateDisplay(record.sessionDate)}</p>
          <p className="mt-1">第 {record.sessionIndex} 次课</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--border-soft)] bg-white px-5 py-5 card-shadow">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--coach-green-soft)]">本次训练主题</p>
        <h2 className="mt-3 text-xl font-semibold text-[var(--ink-900)]">{record.title}</h2>
        <div className="mt-5 rounded-2xl bg-[var(--accent-mint-soft)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--coach-green)]">今日亮点</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-700)]">
            {highlightItems.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 rounded-2xl bg-[var(--accent-red-soft)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--coach-green)]">需要提升的地方</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-700)]">
            {improvementItems.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--border-soft)] bg-white px-5 py-5 card-shadow">
        <div className="rounded-2xl bg-[var(--coach-green)] px-4 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">来自教练</p>
          <h2 className="mt-2 text-lg font-semibold">教练点评</h2>
          <p className="mt-3 text-sm leading-7 text-white/85">{record.coachComment}</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-[var(--border-soft)] bg-white px-5 py-5 card-shadow">
        <div>
          <p className="text-sm font-semibold text-[var(--coach-green)]">今天练了什么</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-700)]">
            {trainedTodayItems.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="mt-5 rounded-2xl bg-[var(--surface)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--coach-green)]">下次训练重点</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-700)]">
            {nextFocusItems.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        {record.homework ? (
          <div className="mt-4 rounded-2xl bg-[var(--accent-blue-soft)] px-4 py-4">
            <p className="text-sm font-semibold text-[var(--coach-green)]">课后作业</p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-700)] whitespace-pre-line">{record.homework}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
