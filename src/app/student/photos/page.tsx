import Image from "next/image";
import { UserRole } from "@prisma/client";
import { ArrowLeftRight, Camera, Images, Quote, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import { getStudentPhotoPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

type ComparePhotoCardProps = {
  label: "Before" | "After";
  photo: {
    url: string;
    sessionIndex: number;
    sessionDate: string;
    title: string;
  };
};

function ComparePhotoCard({ label, photo }: ComparePhotoCardProps) {
  return (
    <article className="h-full rounded-[1.5rem] border border-line/70 bg-surface-muted p-3 shadow-[0_10px_24px_rgba(23,63,46,0.06)]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-white">
        <Image
          src={photo.url}
          alt={`${label} 对比照片`}
          fill
          sizes="(min-width: 768px) 18rem, 100vw"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="mt-3 flex min-h-[5.75rem] flex-col">
        <div className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">
          {label}
        </div>
        <div className="mt-2 min-h-6 text-xs leading-6 text-muted">
          第{photo.sessionIndex}次课 · {formatDate(photo.sessionDate)}
        </div>
        <div className="mt-2 min-h-12 overflow-hidden text-sm font-semibold leading-6 text-brand/85">
          {photo.title}
        </div>
      </div>
    </article>
  );
}

export default async function StudentPhotosPage() {
  const session = await requireRole(UserRole.STUDENT);
  const photoPage = await getStudentPhotoPage(session.userId);

  if (!photoPage) {
    notFound();
  }

  const {
    student,
    primaryCompare,
    momentGroups,
    latestCoachComment,
    compareInsight,
    latestSessionDate,
    hasPhotos,
  } = photoPage;

  return (
    <div className="pb-8">
      <section className="brand-gradient rounded-b-[2rem] px-5 pb-8 pt-6 text-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-white/72">
          Photo Review
        </div>
        <h1 className="mt-4 text-3xl font-bold">照片反馈</h1>
        <p className="mt-3 text-sm leading-7 text-white/76">
          从照片里回看动作变化和训练瞬间。当前阶段：{student.stageLabel}，内容由 {student.coachName} 人工挑选发布。
        </p>
        {latestSessionDate ? (
          <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/80">
            最近更新：{formatDate(latestSessionDate)}
          </div>
        ) : null}
      </section>

      <div className="-mt-4 space-y-4 px-4">
        {!hasPhotos ? (
          <section className="panel-card rounded-[1.75rem] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-brand">
              <Camera className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-brand">暂时还没有已发布照片</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              教练在训练录入页上传并发布照片后，这里会出现动作对比和训练瞬间。
            </p>
            <p className="mt-2 text-xs leading-6 text-brand/55">这一页会保持轻量，不会变成普通相册页。</p>
          </section>
        ) : null}

        {hasPhotos ? (
          <>
            <section className="panel-card rounded-[1.75rem] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-brand">
                  <ArrowLeftRight className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand">动作对比</h2>
                  <p className="text-sm text-muted">第一版只展示 1 组人工指定的 before / after。</p>
                </div>
              </div>

              {primaryCompare ? (
                <div className="mt-5 space-y-4">
                  <div className="space-y-4 md:hidden">
                    <ComparePhotoCard label="Before" photo={primaryCompare.before} />
                    <div className="relative flex items-center justify-center py-1">
                      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brand/10" />
                      <div className="relative inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-lg">
                        <ArrowLeftRight className="h-4 w-4" />
                        动作变化
                      </div>
                    </div>
                    <ComparePhotoCard label="After" photo={primaryCompare.after} />
                  </div>

                  <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] md:items-stretch md:gap-4">
                    <ComparePhotoCard label="Before" photo={primaryCompare.before} />

                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brand/10" />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                        <ArrowLeftRight className="h-5 w-5" />
                      </div>
                    </div>

                    <ComparePhotoCard label="After" photo={primaryCompare.after} />
                  </div>

                  <div className="rounded-[1.5rem] bg-success-soft p-4">
                    <div className="text-sm font-semibold text-brand">对比观察</div>
                    <p className="mt-2 text-sm leading-7 text-brand/82">
                      {compareInsight
                        ? `进步显著：${compareInsight}`
                        : "教练会通过同一组 before / after 照片，帮助你直观看到动作变化。"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-line px-5 py-10 text-center text-sm leading-7 text-muted">
                  当前还没有完整的 before / after 对比组合。教练发布同一分组下的 BEFORE 和 AFTER 后，这里会自动显示。
                </div>
              )}
            </section>

            <section className="panel-card rounded-[1.75rem] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/8 text-brand">
                  <Images className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand">训练瞬间</h2>
                  <p className="text-sm text-muted">按教练标记的 focusLabel 做轻量分组。</p>
                </div>
              </div>

              {momentGroups.length > 0 ? (
                <div className="mt-5 space-y-5">
                  {momentGroups.map((group) => (
                    <section key={group.label} className="rounded-[1.5rem] bg-surface-muted p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                          <Sparkles className="h-4 w-4 text-accent" />
                          {group.label}
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-brand/70">
                          {group.items.length} 张
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {group.items.map((photo) => (
                          <article key={photo.id} className="rounded-[1.25rem] bg-white p-2">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem]">
                              <Image
                                src={photo.url}
                                alt={`${group.label} 训练瞬间`}
                                fill
                                sizes="(min-width: 768px) 12rem, 50vw"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="mt-2 px-1 pb-1">
                              <div className="text-xs font-semibold text-brand">第{photo.sessionIndex}次课</div>
                              <div className="mt-1 text-[11px] leading-5 text-muted">
                                {formatDate(photo.sessionDate)}
                              </div>
                              <div className="mt-1 text-[11px] leading-5 text-brand/60">{photo.title}</div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-line px-5 py-10 text-center text-sm leading-7 text-muted">
                  当前还没有被标记为“训练瞬间”的照片。
                </div>
              )}
            </section>
          </>
        ) : null}

        {hasPhotos ? (
          <section className="panel-card rounded-[1.75rem] bg-brand p-5 text-white shadow-[0_20px_50px_rgba(23,63,46,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">教练总结</h2>
              <p className="text-sm text-white/72">作为这页的收口模块，帮助你把照片证据和训练反馈连起来。</p>
            </div>
          </div>

          {latestCoachComment ? (
            <p className="mt-4 text-sm leading-8 text-white/85">{latestCoachComment}</p>
          ) : (
            <p className="mt-4 text-sm leading-8 text-white/72">教练总结会在发布训练反馈后同步到这里。</p>
          )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
